const ethers = require('ethers');

const { sequelize, SellerProduct } = require("../models");
const simpleSellerABI = require("../contracts/ABIs/SimpleSeller.json").abi;
const addresses = require("../contracts/contractAddresses.json");
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerABI, provider);  

//TODO: add log file
//TODO: some form of tests

async function createSellerProduct(name,price,seller,index){
       try{
        await SellerProduct.create({
            name,
            price: price._hex,
            seller,
            instanceId:index,
            linkForMedia:"",
            marketHashOfData:"",
            description:"",
            addDate: new Date()
        });
    }catch(e){
        console.log(e);
        return;
    }
    console.log(name,price,seller,index);
 
}

async function sellSellerProduct(index,buyer){
    console.log(`Product with index ${index} sold`);
    let product = await SellerProduct.findOne({ where: { instanceId: index } });
    const bci = await simpleSeller.products(index);
    if (product === null) {
        //blockchain instance (bci)
        try{
            await createSellerProduct(bci.name,bci.price,bci.seller,index);
            product = await SellerProduct.findOne({ where: { instanceId: index } });
            console.log('Not found, but created!');
        }catch(e){
            console.log(e)
        }
    }
    product.buyer = bci.buyer;
    product.paid = true;
    product.deliveryInstructions = bci.deliveryInstructions; 
    product.save();
}

async function deliverSellerProduct(index, courier){
    console.log(`Product with index ${index} delivered`);
    let product = await SellerProduct.findOne({ where: { instanceId: index } });
    if (product === null) {
        //blockchain instance (bci)
        try{
            const bci = await simpleSeller.products(index);
            await createSellerProduct(bci.name,bci.price,bci.seller,index);
            product = await SellerProduct.findOne({ where: { instanceId: index } });
            console.log('Not found, but created!');
        }catch(e){
            console.log(e)
        }
    }
    product.delivered = true;
    product.save();
}

module.exports = { createSellerProduct, sellSellerProduct, deliverSellerProduct }
