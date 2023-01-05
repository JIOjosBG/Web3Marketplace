const { AuctionProduct, AuctionBid } = require("../models");
const ethers = require('ethers');

const simpleAuctionABI = require("../contracts/ABIs/SimpleAuction.json").abi;
const addresses = require("../contracts/contractAddresses.json");
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionABI, provider); 


function hexToBytes(hex) {
    let bytes=[];
    for (let i=2;i<hex.length;i+=2)
        bytes.push(parseInt(hex.substr(i, 2), 16));
    return bytes;
}

const getProducts = async (req, res) => {
    const products = await AuctionProduct.findAll();
    res.send(products);
    console.log("getProducts");
}

const getBidsForProduct = async (req, res) => {
    id = parseInt(req.params.id);
    if(id===null || isNaN(id)){
        console.log("GET /a/b/:id : id is null or NaN");
        res.status(400);
        res.send({"message":"InstanceId=null"});
        return;
    }
    const bids = await AuctionBid.findAll({ where: { instanceId: id } });
    res.send(bids);
    console.log(`getBids ${id}`);
}

const getProduct = async (req, res) => {
    id = parseInt(req.params.id);
    if(id===null || isNaN(id)){
        console.log("GET /a/p/:id : id is null or NaN");
        res.status(400);
        res.send({"message":"InstanceId=null"});
        return;
    }
    const product = await AuctionProduct.findOne({ where: { instanceId: id } });

    //console.log(product);
    if(product===null || product.name==""){
        console.log(`GET /a/p/:id : not found ${id}`);
        res.status(404);
        res.send({"message":`404 not found with ${id}`});
        return;
    }
    res.send(product);
    console.log("GET /a/p/:id : found");
}

const instantiateOrUpdateProduct = async (req, res) => {
    const id = req.params.id;
    let bci;
    let p;
    if(id==null || isNaN(id)){
        console.log("POST /a/p/:id : id is null or NaN");
        res.status(400);
        res.send({"messsage":"id is null or nan"});
        return;
    }
    try{
        bci = await simpleAuction.products(id);
    }catch(e){
        console.log(`POST /a/p/:id : error in contract calling with id=${id}`);
        res.status(500);
        res.send({"message":`Internal server error`});
        return;
    }

    if(bci==null || bci.name==""){
        console.log(`POST /a/p/:id : no product with id ${id} in smart contract`);
        res.status(404);
        res.send({"message":`no product with id ${id} in smart contract`});
        return;
    }
    const deliveryInstructions = hexToBytes(bci.deliveryInstructions)
    const marketHashOfData = hexToBytes(bci.marketHashOfData)
    

    try{
        p = await AuctionProduct.findOne({ where: { instanceId: id } });
    }catch(e){
        console.log("POST /a/p/:id : ", e);
    }
    try{

        if(p!=null){
            p.currentBidder = bci.currentBidder;
            p.bidAmount = bci.bidAmount._hex;
            p.delivered = bci.delivered;
            p.deliveryInstructions = deliveryInstructions;
            p.save();
            console.log(`POST /a/p/:id : updated db instance with insanceid ${id}`)
            res.send(p.toJSON());
            return;
        }
    }catch(e){
        console.log(`POST /a/p/:id : cant update with bci ${id}`);
        res.status(500);
        res.send({"message":"Internal server error"});
        return;
    }
    let dbProduct;
    try{
        dbProduct =await AuctionProduct.create({
            instanceId:id,
            name:bci.name,
            minimalPrice: bci.minimalPrice._hex,
            seller: bci.seller,
            currentBidder:bci.currentBidder,
            bidAmount:bci.bidAmount._hex,
            finishDate: new Date(bci.finishDate*1000),
            addDate: new Date(),
            linkForMedia:bci.linkForMedia,
            marketHashOfData:marketHashOfData,
            approved:bci.approved,
            delivered: bci.delivered,
            deliveryInstructions: deliveryInstructions,
            description:""
        });
    }catch(e){
        console.log("POST /a/p/:id : cant create db instance");
        console.log(e);
        res.status(500);
        res.send({"message":"Internal server error"});
        return;
    }
    console.log(`POST /a/p/:id : created with bci id ${id}`)
    res.send(dbProduct.toJSON());
        
}

//TODO: finish this function
const bidForProduct = async (req, res,next) => {
    console.log("asdasd")
    let bci;
    let bid;
    console.log(req.body)
    console.log("POST /a/b/");
    instanceId = parseInt(req.body.instanceId);
    if(instanceId==null || isNaN(instanceId)){
        res.status(400)
        res.send({'message':'bad instance id'})
        return
    }
    if(req.body.bidder=="" || req.body.bidder==null ||
    req.body.amount=="" || req.body.amount==null ||
    req.body.deliveryInstructions=="" || req.body.deliveryInstructions==null ||
    req.body.signature=="" || req.body.signature==null){
        res.status(401)
        res.send({'message':'bad request'})
        return
    }
    try{
        bci = await simpleAuction.products(instanceId);
    }catch(e){
        console.log("POST /a/b/",e)
        console.log("cant get bci")
        res.status(500)
        res.send({"message":"Internal server error"})
        return
    }
    if(bci.name==""){
        console.log(`POST /a/b no such product with id ${instanceId}`);
        res.status(404)
        res.send({"message":"Cant find product in contract"})
        return
    } 
    
    if(bci.bidAmount.gt(req.body.amount) || bci.bidAmount.eq(req.body.amount)){
        console.log(`POST /a/b too low bid for id ${instanceId}`);
        res.status(400)
        res.send({"message":"Too low bid amount for this product"})
        return
    }
    const deliveryInstructions = hexToBytes(req.body.deliveryInstructions)
    const signature = hexToBytes(req.body.signature)
    try{
        bid = await AuctionBid.create({
            instanceId: instanceId,
            bidder: req.body.bidder,
            amount: req.body.amount,
            deliveryInstructions: deliveryInstructions,
            signature: signature
        });
    }catch(e){
        console.log("POST /a/b : cant create db instance", e)
        res.status(500)
        res.send({"message":"Inetrnal server error"})
        return;
    }

    res.send(bid.toJSON())
    
}
//TODO: make update product
// const updateProduct = async (req, res) => {   
//     console.log(req.params.id);
//     res.send("updateProduct");
//     console.log("updateProduct");
// }


module.exports = { getProduct, instantiateOrUpdateProduct, getProducts, getBidsForProduct, bidForProduct};