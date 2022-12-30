const express = require('express');
const { sequelize } = require('./models');
const ethers = require("ethers");
require("dotenv").config();

const simpleSellerABI = require("./contracts/ABIs/SimpleSeller.json").abi;
const addresses = require("./contracts/contractAddresses.json");
const sellerProductRoutes = require('./routes/sellerProducts.js');
const { handleSllerProductAdd } = require('./controllers/contractListeners');

const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleSeller = new ethers.Contract(addresses.simpleSeller, simpleSellerABI, provider);  


const app = express();
const PORT = 5000


app.use(express.json());

app.get("/", (req, res) => res.send("Welcome to the API!"));
app.use("/s/p", sellerProductRoutes);
app.all("*", (req, res) =>res.send("404"));



app.listen(PORT, async () =>{
    console.log(`Server running on port: http://localhost:${PORT}`);
    // await sequelize.sync();
    await sequelize.authenticate();
    console.log("DB connected");
});

simpleSeller.on("sellerProductAdded", handleSllerProductAdd);
