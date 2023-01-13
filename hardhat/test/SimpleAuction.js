const { expect } = require("chai");
const { ethers } = require("hardhat");

function stringToHex(str){
    var arr1 = ['0','x'];
    for (var n = 0, l = str.length; n < l; n ++){
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}
function hexToString(hexx) {
    var hex = hexx.toString().slice(2);
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

describe("SimpleAuction", async function () {
    let simpleAuction;
    let hashedData;
    let SimpleAuction;
    let accounts;
    let oneETH;
    let twoETHs;
    let finishDate;
    let oneETHAfterFee;
    let agoraToken;
    let marketplace;
    let sigData;
    let p0;
    let p1;
    beforeEach(async function ()  {

        hashedData = await ethers.utils.formatBytes32String("");
        SimpleAuction = await ethers.getContractFactory("SimpleAuction");
        AgoraToken = await ethers.getContractFactory("AgoraToken");
        Marketplace = await ethers.getContractFactory("Marketplace");
        
        accounts = await ethers.getSigners();
        oneETH = await ethers.utils.parseEther("1");
        twoETHs = await ethers.utils.parseEther("2");
        simpleAuction = await SimpleAuction.deploy();
        agoraToken = await AgoraToken.deploy();
        marketplace = await Marketplace.deploy();
        expect(await marketplace.addAdmin(accounts[0].address)).to.not.throw;
        expect(await marketplace.addCourier(accounts[3].address)).to.not.throw;

        finishDate =await  Math.floor(Date.now()/1000)+3600;
        oneETHAfterFee = ethers.utils.parseEther("0.99");
        sigData = {
            "currentTime": Math.floor(Date.now()/1000),
            "futureTime": Math.floor(Date.now()/1000)+3600,
            "nonce0oneETH": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,0,oneETH])),
            "nonce1oneETH": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,1,oneETH])),  
            "nonce0twoETHs": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,0,twoETHs])),
            "nonce1twoETHs": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,1,twoETHs])),  
            "nonce0tenWEI": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,0,10])),  
            "nonce1tenWEI": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[simpleAuction.address,1,10])),  
            "simplyBadNonce": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint","uint"],[ethers.constants.AddressZero,1,0])),  
        }

    });
   
    describe("Deployment", async function () {

        it("Should have the correct owner", async function () {
            const addressOfOwnerOfSimpleAuction = await simpleAuction.owner();
            expect(addressOfOwnerOfSimpleAuction).to.equal(accounts[0].address, "Wrong owner");
            expect(addressOfOwnerOfSimpleAuction).to.not.equal(accounts[1].address, "Wrong owner");
        });

        it("Should start with 0 values", async function () {
            expect(await simpleAuction.productCount()).equal(0);
        });
    });
    
    describe("addProduct()", async function(){
        beforeEach(async function ()  {
            simpleAuction = await SimpleAuction.deploy();
        });


        it("Adds products successfully", async function () {
            
            expect(await simpleAuction.addProduct("Product1",oneETH,"asd1",hashedData,finishDate)).to.not.throw;
            expect(await simpleAuction.addProduct("Product2",twoETHs,"asd2",hashedData,finishDate)).to.not.throw;

            const product1 = await simpleAuction.products(0);
            const product2 = await simpleAuction.products(1);

            expect((await simpleAuction.getIndexesFromSellerAddress(accounts[0].address))[0]).equal(0);
            expect((await simpleAuction.getIndexesFromSellerAddress(accounts[0].address))[1]).equal(1);

            expect(product1.name).equal("Product1");
            expect(product1.minimalPrice).equal(oneETH);
            expect(product1.seller).equal(accounts[0].address);
            expect(product1.currentBidder).equal(ethers.constants.AddressZero);
            expect(product1.bidAmount).equal(0);
            expect(product1.linkForMedia).equal("asd1");
            expect(product1.marketHashOfData).equal(hashedData);
            expect(product1.approved).to.be.false;
            expect(product1.delivered).to.be.false;
            expect(product1.deliveryInstructions).equal("0x");


            expect(product2.name).equal("Product2");
            expect(product2.minimalPrice).equal(twoETHs);
            expect(product2.seller).equal(accounts[0].address);
            expect(product2.currentBidder).equal(ethers.constants.AddressZero);
            expect(product2.bidAmount).equal(0);
            expect(product2.linkForMedia).equal("asd2");
            expect(product2.marketHashOfData).equal(hashedData);
            expect(product2.approved).to.be.false;
            expect(product2.delivered).to.be.false;
            expect(product2.deliveryInstructions).equal("0x");


            expect( await simpleAuction.productCount()).equal(2);
        });

        it("Throws error on empty name", async function () {
            await expect(simpleAuction.addProduct("",oneETH,"asd",hashedData,finishDate)).to.be.revertedWith("Name shouldn't be empty");
            expect( await simpleAuction.productCount()).equal(0);
        });

        it("Throws error on low price", async function () {
            await expect(simpleAuction.addProduct("Product1",1000,"asd",hashedData,finishDate)).to.be.revertedWith("Price should be >=2000000");
            expect( await simpleAuction.productCount()).equal(0);
        });

        it("Throws error on bad finishDate", async function () {
            const timeNow =await  Math.floor(Date.now()/1000);
         
            await expect(simpleAuction.addProduct("Product1",oneETH,"asd",hashedData,timeNow)).to.be.revertedWith("End should be in the future");
            expect( await simpleAuction.productCount()).equal(0);
        });

    });
    describe("bidForProduct with marketplace",async function(){
        beforeEach(async function ()  {

            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;
            expect(await simpleAuction.addProduct("Product1",oneETH,"asd1",hashedData,finishDate)).to.not.throw;
            expect(await simpleAuction.addProduct("Product2",twoETHs,"asd2",hashedData,finishDate)).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[2]).buyTokens({value:twoETHs})).to.not.throw;
            expect(await simpleAuction.belongsToContract()).equal(0);
            p0 = await simpleAuction.products(0);
            p1 = await simpleAuction.products(1);

        });

        it("Bids for product successfully",async function(){
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(oneETH);
            expect(await agoraToken.balanceOf(accounts[2].address)).equal(twoETHs);

            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.not.throw;
            expect( (await simpleAuction.products(0)).currentBidder).equal(accounts[1].address);
            expect( (await simpleAuction.products(0)).bidAmount).equal(oneETH);
            const rawdeliveryInstructions = (await simpleAuction.products(0)).deliveryInstructions;
            const deliveryInstructions = hexToString(rawdeliveryInstructions);
            expect( deliveryInstructions).equal("Deliver here");
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(oneETH);
            expect( await agoraToken.balanceOf(accounts[1].address)).equal(0);
            expect( await agoraToken.balanceOf(accounts[2].address)).equal(twoETHs);


            expect( (await simpleAuction.products(0)).currentBidder).equal(accounts[1].address);
            expect( (await simpleAuction.products(0)).bidAmount).equal(oneETH);
            const message2 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0twoETHs,twoETHs,accounts[2].address,simpleAuction.address])));
            const signature2 = accounts[2].signMessage(message2);
            expect(await simpleAuction.bidForProduct(0,stringToHex("Deliver here2"),twoETHs,accounts[2].address,signature2)).to.not.throw;
            expect( (await simpleAuction.products(0)).currentBidder).equal(accounts[2].address);
            expect( (await simpleAuction.products(0)).bidAmount).equal(twoETHs);
            const rawdeliveryInstructions2 = (await simpleAuction.products(0)).deliveryInstructions;
            const deliveryInstructions2 = hexToString(rawdeliveryInstructions2);
            expect( deliveryInstructions2).equal("Deliver here2");
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( await simpleAuction.owedMoneyToBidders(accounts[2].address,0)).equal(twoETHs);
            
            expect( await agoraToken.balanceOf(accounts[1].address)).equal(oneETH);
            expect( await agoraToken.balanceOf(accounts[2].address)).equal(0);
            expect(await simpleAuction.belongsToContract()).equal(0);

        
        });

        it("No such product",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(3,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.be.revertedWith("No such product");

            expect( await simpleAuction.owedMoneyToBidders(accounts[0].address,3)).equal(0);
            expect(await simpleAuction.belongsToContract()).equal(0);
            
        });

        it("Auction finished",async function(){
            await network.provider.send("evm_increaseTime", [3600])

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[0,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[2].address,signature)).to.be.revertedWith("Auction already finished");

            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
            await network.provider.send("evm_increaseTime", [-3600])
            
        });

        it("Lower than last bid",async function(){
            const message1 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature1 = accounts[1].signMessage(message1);
            expect(await simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature1)).to.not.throw;
        
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(oneETH);
            expect( await simpleAuction.owedMoneyToBidders(accounts[2].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(accounts[1].address);
            
            const message2 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0oneETH,oneETH,accounts[2].address,simpleAuction.address])));
            const signature2 = accounts[2].signMessage(message2);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[2].address,signature2)).to.be.rejectedWith("Bid must be larger");
            
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(oneETH);
            expect( await simpleAuction.owedMoneyToBidders(accounts[2].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(accounts[1].address);
            expect( (await simpleAuction.products(0)).bidAmount).equal(oneETH);

        });

        it("Lower than minimal price",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0tenWEI,10,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);

            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),10,accounts[1].address,signature)).to.be.rejectedWith("Bid must be larger");
            
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
        });

        it("No delivery instructions",async function(){        
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(0,stringToHex(""),oneETH,accounts[1].address,signature)).to.be.revertedWith("No delivery instructions");
            
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
            const rawdeliveryInstructions = (await simpleAuction.products(0)).deliveryInstructions;
            const deliveryInstructions = hexToString(rawdeliveryInstructions);
            expect( deliveryInstructions).equal("");
        });

        it("Wrong nonce",async function(){
            //bad index
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p1.finishDate,sigData.nonce1oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.be.revertedWith("Wrong arguments (recoveredAddress!=from)");
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);

            //bad amount
            const message2 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0twoETHs,oneETH,accounts[1].address,simpleAuction.address])));
            const signature2 = accounts[1].signMessage(message2);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature2)).to.be.revertedWith("Wrong arguments (recoveredAddress!=from)");
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);

            //bad address
            const message3 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.simplyBadNonce,oneETH,accounts[1].address,simpleAuction.address])));
            const signature3 = accounts[1].signMessage(message3);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature3)).to.be.revertedWith("Wrong arguments (recoveredAddress!=from)");
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
        });


        it("Expired signature",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[0,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.be.revertedWith("Wrong arguments (recoveredAddress!=from)");

            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
        });


    });
    describe("payProduct without marketplace ot token",async function (){
        beforeEach(async function ()  {

            expect(await simpleAuction.addProduct("Product1",oneETH,"asd1",hashedData,finishDate)).to.not.throw;
            expect(await simpleAuction.addProduct("Product2",twoETHs,"asd2",hashedData,finishDate)).to.not.throw;
            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;
        });

        it("Without marketplace or token",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.be.revertedWith("No marketplace");
            
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
            expect(await simpleAuction.belongsToContract()).equal(0);
            
        });
        it("Without token with marketplace",async function(){
            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.be.revertedWith("No token specified");
            expect( await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);
            expect( (await simpleAuction.products(0)).currentBidder).equal(ethers.constants.AddressZero);
            expect( (await simpleAuction.products(0)).bidAmount).equal(0);
        });
    });
    describe("Join marketplace", async function(){
        it("Joins marketplace",async function(){
            expect(await simpleAuction.ownerMarketplace()).equal(ethers.constants.AddressZero);
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;
            expect(await simpleAuction.ownerMarketplace()).equal(marketplace.address);
        });

        it("Joins marketplace not owner",async function(){
            expect(await simpleAuction.ownerMarketplace()).equal(ethers.constants.AddressZero);
            await expect(simpleAuction.connect(accounts[1]).joinMarketplace(marketplace.address)).to.be.revertedWith("Ownable: caller is not the owner");
            expect(await simpleAuction.ownerMarketplace()).equal(ethers.constants.AddressZero);
        });


        it("Joins 0 address marketplace",async function(){
            expect(await simpleAuction.ownerMarketplace()).equal(ethers.constants.AddressZero);
            await expect(simpleAuction.joinMarketplace(ethers.constants.AddressZero)).to.be.revertedWith("Address shouldn't be 0");
            expect(await simpleAuction.ownerMarketplace()).equal(ethers.constants.AddressZero);
        });
    });

    describe("deliverProduct", async function(){
        beforeEach(async function ()  {
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;

            expect(await simpleAuction.addProduct("Product1",oneETH,"asd1",hashedData,finishDate)).to.not.throw;
            expect(await simpleAuction.addProduct("Product2",twoETHs,"asd2",hashedData,finishDate)).to.not.throw;
            p0 = await simpleAuction.products(0)
            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.not.throw;
            expect((await simpleAuction.products(0)).delivered).to.be.false;
            
            expect(await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(oneETH);
            expect(await simpleAuction.belongsToContract()).equal(0);
            
        });

        it("Deliver product successfully",async function(){

            await network.provider.send("evm_increaseTime", [3600])
            expect(await simpleAuction.connect(accounts[3]).deliverProduct(0)).to.not.throw;
            expect((await simpleAuction.products(0)).delivered).to.be.true;

            expect(await simpleAuction.owedMoneyToBidders(accounts[1].address,0)).equal(0);

            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH.add(oneETHAfterFee)); //started with 1
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(oneETH); //started with two

            await network.provider.send("evm_increaseTime", [-3600])
            expect(await simpleAuction.belongsToContract()).equal(oneETH.sub(oneETHAfterFee));
            
        });
        
        it("No such product",async function(){
            await expect(simpleAuction.connect(accounts[3]).deliverProduct(2)).to.be.revertedWith("No such product");
            expect(await simpleAuction.belongsToContract()).equal(0);
            
        });

        it("Auction not finished",async function(){
            await expect(simpleAuction.connect(accounts[3]).deliverProduct(0)).to.be.revertedWith("Auction not finished");
            expect(await simpleAuction.belongsToContract()).equal(0);
            
        });

        it("Product already delivered",async function(){
            await network.provider.send("evm_increaseTime", [3600])
            await expect(simpleAuction.connect(accounts[3]).deliverProduct(0)).to.not.throw;
            await expect(simpleAuction.connect(accounts[3]).deliverProduct(0)).to.be.revertedWith("Product already delivered");
            await network.provider.send("evm_increaseTime", [-3600])
            expect(await simpleAuction.belongsToContract()).equal(oneETH.sub(oneETHAfterFee));
        });

        it("Not a courier",async function(){
            expect(await marketplace.removeCourier(accounts[3].address)).to.not.throw;
            await network.provider.send("evm_increaseTime", [3600])
            await expect(simpleAuction.connect(accounts[3]).deliverProduct(0)).to.be.revertedWith("Not an authorized courier");
            await network.provider.send("evm_increaseTime", [-3600])
            expect(await simpleAuction.belongsToContract()).equal(0);
        });

        it("No marketplace",async function(){
            simpleAuctionNoMP = await SimpleAuction.deploy();
            await expect(simpleAuctionNoMP.deliverProduct(0)).to.be.revertedWith("No owner marketplace");

        });

        it("No bids", async function ()  {
            expect(await simpleAuction.addProduct("Product3",oneETH,"asd1",hashedData,finishDate)).to.not.throw;
            const p2 = await simpleAuction.products(2)
            expect(p2.delivered).to.be.false;

            expect(p2.bidAmount).equal(0);
            expect(p2.currentBidder).equal(ethers.constants.AddressZero);

            expect(await simpleAuction.owedMoneyToBidders(accounts[0].address,3)).equal(0);
            expect(await simpleAuction.owedMoneyToBidders(accounts[1].address,3)).equal(0);
            expect(await simpleAuction.belongsToContract()).equal(0);
            await network.provider.send("evm_increaseTime", [3600])
            await expect( simpleAuction.connect(accounts[3]).deliverProduct(2)).to.be.revertedWith("No bids, therefore can't deliver");
            await network.provider.send("evm_increaseTime", [-3600])
        });
    
    });

    describe("transferFunds", async function(){
        beforeEach(async function ()  {
            expect(await simpleAuction.addProduct("Product1",oneETH,"asd1",hashedData,finishDate)).to.not.throw;
            expect(await simpleAuction.addProduct("Product2",twoETHs,"asd2",hashedData,finishDate)).to.not.throw;
            p0 = await simpleAuction.products(0);
            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;
            

        });

        it("Simple transfer",async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0oneETH,oneETH,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleAuction.bidForProduct(0,stringToHex("Deliver here"),oneETH,accounts[1].address,signature)).to.not.throw;

            await network.provider.send("evm_increaseTime", [3600])
            expect(await simpleAuction.connect(accounts[3]).deliverProduct(0)).to.not.throw;
            await network.provider.send("evm_increaseTime", [-3600])
            
            expect(await simpleAuction.belongsToContract()).equal(oneETH.sub(oneETHAfterFee));
            

            const oldsimpleAuctionBalance = await await agoraToken.balanceOf(simpleAuction.address);
            const oldMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);
            
            expect(oldsimpleAuctionBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(oldMarketplaceBalance).equal(0);

            expect(await simpleAuction.transferFunds()).to.not.throw;
            expect(await simpleAuction.belongsToContract()).equal(0);

            const newsimpleAuctionBalance = await agoraToken.balanceOf(simpleAuction.address);
            const newMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);

            expect(newsimpleAuctionBalance).equal(0);
            expect(newMarketplaceBalance).equal(oneETH.sub(oneETHAfterFee));
        
        });

        it("Simple transfer not owner",async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;

            const oldsimpleAuctionBalance = await await agoraToken.balanceOf(simpleAuction.address);
            const oldMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);
            
            await expect(simpleAuction.connect(accounts[1]).transferFunds()).to.be.rejectedWith('Ownable: caller is not the owner');

            const newsimpleAuctionBalance = await agoraToken.balanceOf(simpleAuction.address);
            const newMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);

            expect(newsimpleAuctionBalance).equal(oldsimpleAuctionBalance);
            expect(newMarketplaceBalance).equal(oldMarketplaceBalance);
        
        });

        it("No token specified",async function(){
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;
            await expect(simpleAuction.transferFunds()).to.be.revertedWith("No token specified");
        });

        it("No owner marketplace",async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            await expect(simpleAuction.transferFunds()).to.be.revertedWith("Doesn't have owner marketplace");
        
        });

    });

    describe("Events", async function () {
        beforeEach(async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleAuction.joinMarketplace(marketplace.address)).to.not.throw;

            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;

        });
        it("test events", async function () {
            expect(await simpleAuction.addProduct("Product1",oneETH,"asd1",hashedData,finishDate))
            .to.emit(simpleAuction, "auctionProductAdded")
            .withArgs("Product1",oneETH, accounts[0].address,0);
            p0 = await simpleAuction.products(0)
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[p0.finishDate,sigData.nonce0twoETHs,twoETHs,accounts[1].address,simpleAuction.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleAuction.bidForProduct(0,stringToHex("Deliver here"),twoETHs,accounts[1].address,signature))
            .to.emit(simpleAuction, "auctionProductBid")
            .withArgs(0,accounts[1].address,twoETHs);

            await network.provider.send("evm_increaseTime", [3600]);
            expect( await simpleAuction.connect(accounts[3]).deliverProduct(0))
            .to.emit(simpleAuction, "auctionProductDelivered")
            .withArgs(0, accounts[0].address,accounts[3].address);
            await network.provider.send("evm_increaseTime", [-3600]);
        });

    });

});