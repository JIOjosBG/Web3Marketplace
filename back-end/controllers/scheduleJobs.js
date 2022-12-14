const ethers = require('ethers');
const schedule = require('node-schedule');
const dotenv = require('dotenv')
dotenv.config()

const { AuctionBid } = require("../models");
const simpleAuctionABI = require("../contracts/ABIs/SimpleAuction.json").abi;
const agoraTokenABI = require("../contracts/ABIs/AgoraToken.json").abi;

const addresses = require("../contracts/contractAddresses.json");
//TODO: provider to signer
//CAUTION: doesnt work otherwise
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${process.env.INFURA_KEY}`);
const signer = new ethers.Wallet( process.env.ACCOUNT_PRIVATE_KEY, provider )

const simpleAuction = new ethers.Contract(addresses.simpleAuction, simpleAuctionABI, signer);  
const agoraToken = new ethers.Contract(addresses.agoraToken, agoraTokenABI, signer);  

const scheduleBidExecution = async (index) => {
    console.log(`scheduleBidExecution for product ${index}`)
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

    const executeTime = new Date((bci.finishDate-60*60)*1000)
    //const executeTime = new Date(new Date().getTime()+5000)
    

    var j = schedule.scheduleJob(executeTime,()=> makeBidsForProduct(index));
}

async function makeBidsForProduct(index){
    let bids;
    let bci;
    let flag=0;
    if(index==null || isNaN(index) || typeof(index)!='number'){
        console.log("makeBidsForProduct: bad index")
        return
    }
    try{
        bci = await simpleAuction.products(index);
    }catch(e){
        console.log(`Schedule jobs: err on connecting with contract`);
        return
    }
    if(bci==null || bci.name==""){
        console.log(`Schedule jobs: no product with id ${index} in smart contract`);
        return;
    }

    console.log(`In cron job with index ${index}`)
    try{

        bids = await AuctionBid.findAll({
            order: [
                ['amount', 'DESC']
            ],
            where:{
                instanceId:index
            }
        });
    }catch(e){
        console.log("Schedule job: err on finding bids");
        return
    }
    try{
        for(let i=0;i<bids.length;i++){

            if(
            (await agoraToken.balanceOf(bids[i].bidder)).gt(bids[i].amount) &&
            !(bci.bidAmount.gt(bids[i].amount))
            ){  
                const preHashedNonce = await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,index,bids[i].amount])
                const nonce = await ethers.utils.arrayify(await ethers.utils.keccak256(preHashedNonce));
                const expiration = bci.finishDate;
                await simpleAuction.bidForProduct(index,bids[i].deliveryInstructions,expiration, nonce, bids[i].amount, bids[i].bidder, bids[i].signature);
                console.log(`Schedule jobs: successfully bid for product ${index}`)
                flag=1;
                break
            }
        }
    }catch(e){
        console.log(e)
        console.log("Schedule job: cant make bid");
    }
    if(flag==1){
        console.log(`Schedule jobs: successfully bid for product ${index}`)
    }else{
        console.log(`Schedule jobs: didnt bid for product ${index}`)
        
    }
}


module.exports = {scheduleBidExecution}