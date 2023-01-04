const ethers = require('ethers');

const { sequelize, SellerProduct, AuctionProduct } = require("../models");
const simpleSellerABI = require("../contracts/ABIs/SimpleSeller.json").abi;
const simpleAuctionABI = require("../contracts/ABIs/SimpleAuction.json").abi;

const addresses = require("../contracts/contractAddresses.json");
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerABI, provider);  
const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionABI, provider);  

//TODO: add log file
//TODO: some form of tests
//TODO: convert deliveryInstruction and marketHashOfData from hex string to bytes
async function createSellerProduct(name,price,seller,index){
       try{
        const p = await simpleSeller.products(index);
        await SellerProduct.create({
            name,
            price: price._hex,
            seller,
            instanceId:index,
            linkForMedia:"",
            marketHashOfData:p.marketHashOfData,
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
    //blockchain instance (bci)
    const bci = await simpleSeller.products(index);
    if (product === null) {
        try{
            await createSellerProduct(bci.name,bci.price,bci.seller,index);
            product = await SellerProduct.findOne({ where: { instanceId: index } });
            console.log('Not found, but created!');
        }catch(e){
            console.log(e)
        }
    }
    product.buyer = buyer;
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

            product.buyer = bci.buyer;
            product.deliveryInstructions=bci.deliveryInstructions;
            product.paid=true;
            console.log('Not found, but creating!');
        }catch(e){
            console.log(e)
        }
    }
    product.delivered = true;
    product.save();
}

//TODO: create cron job for submiting bids from the db
async function createAuctionProduct(name,minimalPrice,seller,index){
    console.log("okokokok")
    try{
        const p = await simpleAuction.products(index);
        await AuctionProduct.create({
            instanceId:index,
            name,
            minimalPrice: minimalPrice._hex,
            addDate: new Date(),
            seller,
            finishDate: new Date(p.finishDate*1000),
            linkForMedia:p.linkForMedia,
            description:"",
        });
    }catch(e){
        console.log(e);
        return;
    }
    console.log(`Created auction for ${name} index ${index}`)
}

async function bidAuctionProduct(index,bidder,amount){
    console.log(`Bid for product with index ${index}`);
    let product = await AuctionProduct.findOne({ where: { instanceId: index } });
    //blockchain instance (bci)
    const bci = await simpleAuction.products(index);
    if (product === null) {
        try{
            await createAuctionProduct(bci.name,bci.minimalPrice,bci.seller,index);
            product = await AuctionProduct.findOne({ where: { instanceId: index } });
            console.log('Not found, but created!');
        }catch(e){
            console.log(e)
        }
    }
    product.currentBidder = bidder;
    product.bidAmount = amount._hex;
    product.deliveryInstructions = bci.deliveryInstructions; 
    product.save();
}

async function deliverAuctionProduct(index, courier){
    console.log(`Auction Product with index ${index} delivered`);
    let product = await AuctionProduct.findOne({ where: { instanceId: index } });
    if (product === null) {
        //blockchain instance (bci)
        try{
            const bci = await simpleAuction.products(index);
            await createAuctionProduct(bci.name,bci.minimalPrice,bci.seller,index);
            product = await AuctionProduct.findOne({ where: { instanceId: index } });

            product.currentBidder = bci.currentBidder;
            product.bidAmount = bci.bidAmount._hex;
            product.deliveryInstructions=bci.deliveryInstructions;
            console.log('Not found, but creating!');
        }catch(e){
            console.log(e)
        }
    }
    product.delivered = true;
    product.save();
}


module.exports = { createSellerProduct, sellSellerProduct, deliverSellerProduct, createAuctionProduct, bidAuctionProduct, deliverAuctionProduct }
