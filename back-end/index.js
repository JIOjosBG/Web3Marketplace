const express = require('express');
const { sequelize } = require('./models');
const ethers = require("ethers");
const bodyParser = require('body-parser')
require("dotenv").config();

const simpleSellerABI = require("./contracts/ABIs/SimpleSeller.json").abi;
const simpleAuctionABI = require("./contracts/ABIs/SimpleAuction.json").abi;

const addresses = require("./contracts/contractAddresses.json");
const sellerProductRoutes = require('./routes/sellerProducts.js');
const auctionRoutes = require('./routes/auctionProducts.js');

const { createSellerProduct, sellSellerProduct, deliverSellerProduct, createAuctionProduct, bidAuctionProduct, deliverAuctionProduct } = require('./controllers/eventHandlers');
const {scheduleBidExecution} = require('./controllers/scheduleJobs');
const provider = require("./controllers/shared.js")

const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerABI, provider);  
const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionABI, provider);  



const app = express();
const PORT = 5000

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','http://localhost:3000');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if(req.method === "OPTIONS"){
        res.header('Access-Control-Allow-Methods','PUT, PATCH, DELETE, GET, POST');
        return res.status(200).json({})
    }
    next()
})

app.get("/", (req, res) => res.send("Welcome to the API!"));
app.use("/s/p", sellerProductRoutes);
app.use("/a", auctionRoutes);

app.all("*", (req, res) =>res.send("404"));



app.listen(PORT, async () =>{
    console.log(`Server running on port: http://localhost:${PORT}`);
    //await sequelize.sync();
    await sequelize.authenticate();
    console.log("DB connected");
});

simpleSeller.on("sellerProductAdded", createSellerProduct);
simpleSeller.on("sellerProductSold", sellSellerProduct);
simpleSeller.on("sellerProductDelivered", deliverSellerProduct);
simpleAuction.on("auctionProductAdded", createAuctionProduct);
//TODO: add function to mark the auction as finished
simpleAuction.on("auctionProductBid", bidAuctionProduct);
simpleAuction.on("auctionProductDelivered", deliverAuctionProduct);
//scheduleBidExecution(13)
console.log("set up listeners");