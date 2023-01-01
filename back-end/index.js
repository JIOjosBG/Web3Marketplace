const express = require('express');
const { sequelize } = require('./models');
const ethers = require("ethers");
require("dotenv").config();

const simpleSellerABI = require("./contracts/ABIs/SimpleSeller.json").abi;
const simpleAuctionABI = require("./contracts/ABIs/SimpleAuction.json").abi;

const addresses = require("./contracts/contractAddresses.json");
const sellerProductRoutes = require('./routes/sellerProducts.js');
const { createSellerProduct, sellSellerProduct, deliverSellerProduct, createAuctionProduct, bidAuctionProduct, deliverAuctionProduct } = require('./controllers/eventHandlers');

const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerABI, provider);  
const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionABI, provider);  


const app = express();
const PORT = 5000


app.use(express.json());

app.get("/", (req, res) => res.send("Welcome to the API!"));
app.use("/s/p", sellerProductRoutes);
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

