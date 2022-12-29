const { sequelize, SellerProduct } = require("../models");

const getProducts = async (req, res) => {
    res.send("getProducts");
    console.log("getProducts");
}

const getProduct = async (req, res) => {
    console.log(req.params.id);
    res.send("getProduct");
    console.log("getProduct");
}

const createProduct = async (req, res) => {
    const {
        name, 
        price, 
        seller, 
        linkForMedia, 
        marketHashOfData, 
        description
    } = req.body;
    //TODO: checks for correct input data
    try{
        SellerProduct.create({
            name:name,
            price:price,
            seller:seller,
            addDate: new Date(),
            linkForMedia:linkForMedia,
            marketHashOfData:marketHashOfData,
            description:description
        });
    }catch(e){
        console.log(e);
    }
    res.send(req.body);
    console.log("createProduct");
}

const updateProduct = async (req, res) => {   
    console.log(req.params.id);
    res.send("updateProduct");
    console.log("updateProduct");
}

module.exports = { getProduct, createProduct, getProducts, updateProduct};