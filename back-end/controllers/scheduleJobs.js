const ethers = require('ethers');
const schedule = require('node-schedule');


const { AuctionBid } = require("../models");
const simpleAuctionABI = require("../contracts/ABIs/SimpleAuction.json").abi;

const addresses = require("../contracts/contractAddresses.json");
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionABI, provider);  

const scheduleBidExecution = async (index) => {

    let bci;
    if(index==null || isNaN(index) || typeof(index)!='number'){
        console.log("createCronJob: bad index")
        return
    }
    try{
        bci = await simpleAuction.products(index);
    }catch(e){
        console.log("createCronJob: Error: cant access the contract")
        return
    }
    if(bci==null || bci.name==""){
        console.log("createCronJob: no sich product in the contract")
        return
    }

    //const executeTime = new Date((bci.finishDate-60*60)*1000)
    const executeTime = new Date(new Date().getTime()+10000)
    

    var j = schedule.scheduleJob(executeTime,()=> makeBidsForProduct(index));
}

async function makeBidsForProduct(index){
    if(index==null || isNaN(index) || typeof(index)!='number'){
        console.log("makeBidsForProduct: bad index")
        return
    }
    //TODO: execute bids
    console.log(`In cron job with index ${index}`)
}


module.exports = {scheduleBidExecution}