const { sequelize, SellerProduct } = require("../models");
//TODO: listener for event createproduct (sets instanceId in DB)


async function handleSllerProductAdd(name,price,seller,index){
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


module.exports = { handleSllerProductAdd }
