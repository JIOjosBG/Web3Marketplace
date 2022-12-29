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
    if(chechCorrectCreateProductData(req.body)==false){
        res.status(400);
        res.send(req.body);
        return;
    }
    const {
        name, 
        price, 
        seller, 
        linkForMedia="",
        marketHashOfData="",
        description=""
    } = req.body;
    try{
        await SellerProduct.create({
            name,
            price,
            seller,
            addDate: new Date(),
            linkForMedia,
            marketHashOfData,
            description
        });
    }catch(e){
        res.send(e.statusCode);
        console.log(e);
        return;
    }
    const createdProduct = await SellerProduct.findOne({ where: { name: name }});
    res.send(createdProduct);
    console.log("createProduct");
}

const updateProduct = async (req, res) => {   
    console.log(req.params.id);
    res.send("updateProduct");
    console.log("updateProduct");
}


function chechCorrectCreateProductData(args){
    if(args.name==null || args.name=='') return false;
    if(args.price==null || args.price<=0) return false;
    if(args.seller==null || args.seller=='') return false;
    return true;
}


module.exports = { getProduct, createProduct, getProducts, updateProduct};