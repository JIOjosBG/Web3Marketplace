const { sequelize, SellerProduct } = require("../models");
const ethers = require('ethers');

const simpleSellerABI = require("../contracts/ABIs/SimpleSeller.json").abi;
const addresses = require("../contracts/contractAddresses.json");
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerABI, provider); 

//TODO: listener for event createproduct (sets instanceId in DB)

const getProducts = async (req, res) => {
    const products = await SellerProduct.findAll();
    res.send(products);
    console.log("getProducts");
}

const getProduct = async (req, res) => {
    id = parseInt(req.params.id);
    if(id===null || isNaN(id)){
        console.log("ooooof")
        console.log("GET /s/p/:id : id is null or NaN");
        res.status(400);
        res.send({"message":"InstanceId=null"});
        return;
    }
    const product = await SellerProduct.findOne({ where: { instanceId: id } });

    //console.log(product);
    if(product===null || product.name==""){
        console.log(`GET /s/p/:id : not found ${id}`);
        res.status(404);
        res.send({"message":`404 not found with ${id}`});
        return;
    }
    res.send(product);
    console.log("GET /s/p/:id : found");
}

const instantiateOrUpdateProduct = async (req, res) => {
    const id = req.params.id;
    let bci;
    let p;

    if(id==null || isNaN(id)){
        console.log("POST /s/p/:id : id is null or NaN");
        res.status(400);
        res.send({"messsage":"id is null or nan"});
        return;
    }
    try{
        bci = await simpleSeller.products(id);
    }catch(e){
        console.log(`POST /s/p/:id : error in contract calling with id=${id}`);
        res.status(500);
        res.send({"message":`Internal server error`});
        return;
    }

    if(bci==null || bci.name==""){
        console.log(`POST /s/p/:id : no product with id ${id} in smart contract`);
        res.status(404);
        res.send({"message":`no product with id ${id} in smart contract`});
        return;
    }

    try{
        p = await SellerProduct.findOne({ where: { instanceId: id } });
    }catch(e){
        console.log("POST /s/p/:id : ", e);
    }
    try{

        if(p!=null){
            p.buyer = bci.buyer;
            p.approved = bci.approved;
            p.paid = bci.paid;
            p.delivered = bci.delivered;
            p.deliveryInstructions = bci.deliveryInstructions;
            p.save();
            console.log(`POST /s/p/:id : updated db instance with insanceid ${id}`)
            res.send(p.toJSON());
            return;
        }
    }catch(e){
        console.log(`POST /s/p/:id : cant update with bci ${id}`);
        res.status(500);
        res.send({"message":"Internal server error"});
        return;
    }
    let dbProduct;
    try{
        dbProduct =await SellerProduct.create({
            instanceId:id,
            name:bci.name,
            price: bci.price._hex,
            seller: bci.seller,
            buyer:bci.buyer,
            addDate: new Date(),
            linkForMedia:bci.linkForMedia,
            marketHashOfData:bci.marketHashOfData,
            approved:bci.approved,
            paid: bci.paid,
            delivered: bci.delivered,
            deliveryInstructions: bci.deliveryInstructions,
            description:""
        });
    }catch(e){
        console.log("POST /s/p/:id : cant create db instance");
        console.log("a",e);
        res.status(500);
        res.send({"message":"Internal server error"});
        return;
    }
    console.log(`POST /s/p/:id : created with bci id ${id}`)
    res.send(dbProduct.toJSON());
    

    
}

//TODO: make update product
// const updateProduct = async (req, res) => {   
//     console.log(req.params.id);
//     res.send("updateProduct");
//     console.log("updateProduct");
// }


module.exports = { getProduct, instantiateOrUpdateProduct, getProducts};