const { expect } = require("chai");
const { ethers } = require("hardhat");
const {generateSignatureStructure} = require("../helperFunctions/signing");

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

describe("SimpleSeller", async function () {
    let simpleSeller;
    let hashedData;

    

    describe("Deployment", async function () {
        beforeEach(async function ()  {
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();

        });

        it("Should have the correct owner", async function () {
            const addressOfOwnerOfSimpleSeller = await simpleSeller.owner();
            expect(addressOfOwnerOfSimpleSeller).to.equal(accounts[0].address, "Wrong owner");
            expect(addressOfOwnerOfSimpleSeller).to.not.equal(accounts[1].address, "Wrong owner");
        });

        it("Should start with 0 values", async function () {
            expect(await simpleSeller.productCount()).equal(0);
        });
    });
    describe("addProduct()", async function(){
        beforeEach(async function ()  {
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();
            hashedData = ethers.utils.formatBytes32String("");
        });


        it("Adds products successfully", async function () {
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",oneETH,"asd2",hashedData)).to.not.throw;

            const product1 = await simpleSeller.products(0);
            const product2 = await simpleSeller.products(1);

            expect((await simpleSeller.getIndexesFromSellerAddress(accounts[0].address))[0]).equal(0);
            expect((await simpleSeller.getIndexesFromSellerAddress(accounts[0].address))[1]).equal(1);

            expect(product1.name).equal("Product1");
            expect(product1.price).equal(oneETH);
            expect(product1.sellerGets).equal(oneETHAfterFee);
            expect(product1.seller).equal(accounts[0].address);
            expect(product1.buyer).equal(ethers.constants.AddressZero);
            expect(product1.linkForMedia).equal("asd1");
            expect(product1.marketHashOfData).equal(hashedData);
            expect(product1.approved).to.be.false;
            expect(product1.paid).to.be.false;
            expect(product1.delivered).to.be.false;
            expect(product1.deliveryInstructions).equal("0x");


            expect(product2.name).equal("Product2");
            expect(product2.price).equal(oneETH);
            expect(product2.sellerGets).equal(oneETHAfterFee);
            expect(product2.seller).equal(accounts[0].address);
            expect(product2.buyer).equal(ethers.constants.AddressZero);
            expect(product2.linkForMedia).equal("asd2");
            expect(product2.marketHashOfData).equal(hashedData);
            expect(product2.approved).to.be.false;
            expect(product2.paid).to.be.false;
            expect(product2.delivered).to.be.false;
            expect(product2.deliveryInstructions).equal("0x");


            expect( await simpleSeller.productCount()).equal(2);
        });


        it("Thrwos error on empty name", async function () {
            await expect(simpleSeller.addProduct("",oneETH,"asd",hashedData)).to.be.revertedWith("Name shouldn't be empty");
            expect( await simpleSeller.productCount()).equal(0);
        });

        it("Thrwos error on low price", async function () {
            await expect(simpleSeller.addProduct("Product1",1000,"asd",hashedData)).to.be.revertedWith("Price should be >=2000000");
            expect( await simpleSeller.productCount()).equal(0);
        });

    });
    describe("payProduct with marketplace",async function(){
        let sigData;
        beforeEach(async function ()  {
            const oneETH = ethers.utils.parseEther("1");
            const twoETHs = ethers.utils.parseEther("2");
            const oneETHAfterFee = ethers.utils.parseEther("0.99");
            const accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            const AgoraToken = await ethers.getContractFactory("AgoraToken");
            const Marketplace = await ethers.getContractFactory("Marketplace");
    
            simpleSeller = await SimpleSeller.deploy();
            agoraToken = await AgoraToken.deploy();
            marketplace = await Marketplace.deploy();
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            hashedData = ethers.utils.formatBytes32String("");
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;
            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;


            const product1 = await simpleSeller.products(0);
            const product2 = await simpleSeller.products(1);
            sigData = {
                "currentTime": Math.floor(Date.now()/1000),
                "futureTime":  Math.floor(Date.now()/1000)+1000,
                "nonce0": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint"],[simpleSeller.address,0])),
                "nonce1": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint"],[simpleSeller.address,1])),  
            }

        });

        it("Pays products successfully",async function(){
            expect( (await simpleSeller.products(0)).paid).to.be.false;

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.not.throw;

            expect( (await simpleSeller.products(0)).paid).to.be.true;
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);

            const rawdeliveryInstructions = (await simpleSeller.products(0)).deliveryInstructions;
            const deliveryInstructions = hexToString(rawdeliveryInstructions);
            expect( deliveryInstructions).equal("Deliver here");

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            
        });

        it("No such product",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(3,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.be.revertedWith("No such product");

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,3)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,3)).equal(0);
        });

        it("Product already bought",async function(){
            const message1 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature1 = accounts[1].signMessage(message1);
            await expect(simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature1)).to.not.throw;

            const message2 =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[2].address,simpleSeller.address])));
            const signature2 = accounts[2].signMessage(message2);
            await expect(simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[2].address,signature2)).to.be.revertedWith("Product already bought");

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[2].address,0)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
        });

        it("Not enough eth",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(1,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.be.revertedWith("Not enough eth");
            
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,1)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,1)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(ethers.constants.AddressZero);
        });

        it("Too much eth (if case)",async function(){

            const oldBalance = await agoraToken.balanceOf(accounts[1].address);
            
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,twoETHs,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,twoETHs,accounts[1].address,signature)).to.not.throw;
            
            const newBalance = await agoraToken.balanceOf(accounts[1].address);

            expect(newBalance.add(oneETH)).equal(oldBalance);
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
        });

        it("No delivery instructions",async function(){
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(0,stringToHex(""),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.be.revertedWith("No delivery instructions");
            

            expect( (await simpleSeller.products(0)).paid).to.be.false;
            expect( (await simpleSeller.products(0)).buyer).equal(ethers.constants.AddressZero);
            const rawdeliveryInstructions = (await simpleSeller.products(0)).deliveryInstructions;
            const deliveryInstructions = hexToString(rawdeliveryInstructions);
            expect( deliveryInstructions).equal("");
        });

        it("Wrong nonce",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce1,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce1,oneETH,accounts[1].address,signature)).to.be.revertedWith("Wrong nonce");

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,3)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,3)).equal(0);
        });


        it("Expired signature",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.currentTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.currentTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.be.revertedWith("Signature expired");

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(ethers.constants.AddressZero);
        });


    });
    describe("payProduct without marketplace ot token",async function (){
        let sigData;
        beforeEach(async function ()  {

            const oneETH = ethers.utils.parseEther("1");
            const twoETHs = ethers.utils.parseEther("2");
            const oneETHAfterFee = ethers.utils.parseEther("0.99");
            const accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");

            simpleSeller = await SimpleSeller.deploy();

            hashedData = ethers.utils.formatBytes32String("");
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;
            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;


            const product1 = await simpleSeller.products(0);
            const product2 = await simpleSeller.products(1);
            sigData = {
                "currentTime": Math.floor(Date.now()/1000),
                "futureTime":  Math.floor(Date.now()/1000)+1000,
                "nonce0": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint"],[simpleSeller.address,0])),
                "nonce1": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint"],[simpleSeller.address,1])),  
            }

        });
        it("Without marketplace or token",async function(){
            expect( (await simpleSeller.products(0)).paid).to.be.false;

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.be.revertedWith("No marketplace");
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToSellers(accounts[1].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(0);
        });
        it("Without token with marketplace",async function(){
            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            await expect(simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.be.revertedWith("No token specified");
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToSellers(accounts[1].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(0);


        });
    });
    describe("Join marketplace", async function(){

        beforeEach(async function ()  {
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            const Marketplace = await ethers.getContractFactory("Marketplace");

            simpleSeller = await SimpleSeller.deploy();
            marketplace = await Marketplace.deploy();

        });
        it("Joins marketplace",async function(){
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;
            expect(await simpleSeller.ownerMarketplace()).equal(marketplace.address);
        });

        it("Joins marketplace not owner",async function(){
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
            await expect(simpleSeller.connect(accounts[1]).joinMarketplace(marketplace.address)).to.be.revertedWith("Ownable: caller is not the owner");
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
        });


        it("Joins 0 address marketplace",async function(){
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
            await expect(simpleSeller.joinMarketplace(ethers.constants.AddressZero)).to.be.revertedWith("Address shouldn't be 0");
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
        });
    });

    describe("deliverProduct", async function(){

        beforeEach(async function ()  {
            const oneETH = ethers.utils.parseEther("1");
            const twoETHs = ethers.utils.parseEther("2");
            const oneETHAfterFee = ethers.utils.parseEther("0.99");
            const accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            const AgoraToken = await ethers.getContractFactory("AgoraToken");
            const Marketplace = await ethers.getContractFactory("Marketplace");

            simpleSeller = await SimpleSeller.deploy();
            agoraToken = await AgoraToken.deploy();
            marketplace = await Marketplace.deploy();
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            hashedData = ethers.utils.formatBytes32String("");
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;
            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;

            sigData = {
                "currentTime": Math.floor(Date.now()/1000),
                "futureTime":  Math.floor(Date.now()/1000)+1000,
                "nonce0": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint"],[simpleSeller.address,0])),
                "nonce1": await ethers.utils.keccak256(await ethers.utils.solidityPack(["address","uint"],[simpleSeller.address,1])),  
            }


        });
        it("Deliver product successfully",async function(){
            expect((await simpleSeller.products(0)).delivered).to.be.false;

            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[0].address,0)).equal(0);

            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.not.throw;


            expect((await simpleSeller.products(0)).delivered).to.be.false;
            
            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);

            expect(await simpleSeller.deliverProduct(0)).to.not.throw;
            expect((await simpleSeller.products(0)).delivered).to.be.true;

            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(0);

            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH.add(oneETHAfterFee)); //started with 1
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(oneETH); //stareted with 2

        });
        
        it("No such product",async function(){
            await expect(simpleSeller.deliverProduct(2)).to.be.revertedWith("No such product");
        });

        it("Product not paid",async function(){
            await expect(simpleSeller.deliverProduct(0)).to.be.revertedWith("Product not paid");
        });

        it("Product already delivered",async function(){
            const message =await ethers.utils.arrayify( await ethers.utils.keccak256(await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,simpleSeller.address])));
            const signature = accounts[1].signMessage(message);
            expect(await simpleSeller.payProduct(0,stringToHex("Deliver here"),sigData.futureTime,sigData.nonce0,oneETH,accounts[1].address,signature)).to.not.throw;

            await expect(simpleSeller.deliverProduct(0)).to.not.throw;
            await expect(simpleSeller.deliverProduct(0)).to.be.revertedWith("Product already delivered");
        });
    });

    describe("transferFunds", async function(){
        beforeEach(async function ()  {
            const oneETH = ethers.utils.parseEther("1");
            const twoETHs = ethers.utils.parseEther("2");
            const oneETHAfterFee = ethers.utils.parseEther("0.99");
            const accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            const AgoraToken = await ethers.getContractFactory("AgoraToken");
            const Marketplace = await ethers.getContractFactory("Marketplace");

            simpleSeller = await SimpleSeller.deploy();
            agoraToken = await AgoraToken.deploy();
            marketplace = await Marketplace.deploy();

            hashedData = ethers.utils.formatBytes32String("");

            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;

            expect(await agoraToken.connect(accounts[0]).buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETHs})).to.not.throw;
            
            expect(await agoraToken.connect(accounts[1]).transfer(simpleSeller.address,oneETH.sub(oneETHAfterFee)));
        
        });

        it("Simple transfer",async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            const oldSimpleSellerBalance = await await agoraToken.balanceOf(simpleSeller.address);
            const oldMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);
            
            expect(oldSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(oldMarketplaceBalance).equal(0);

            expect(await simpleSeller.transferFunds()).to.not.throw;

            const newSimpleSellerBalance = await agoraToken.balanceOf(simpleSeller.address);
            const newMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);

            expect(newSimpleSellerBalance).equal(0);
            expect(newMarketplaceBalance).equal(oneETH.sub(oneETHAfterFee));
        
        });

        it("Simple transfer not owner",async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            const oldSimpleSellerBalance = await await agoraToken.balanceOf(simpleSeller.address);
            const oldMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);
            
            await expect(simpleSeller.connect(accounts[1]).transferFunds()).to.be.rejectedWith('Ownable: caller is not the owner');

            const newSimpleSellerBalance = await agoraToken.balanceOf(simpleSeller.address);
            const newMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);

            expect(newSimpleSellerBalance).equal(oldSimpleSellerBalance);
            expect(newMarketplaceBalance).equal(oldMarketplaceBalance);
        
        });

        it("No token specified",async function(){
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            const oldSimpleSellerBalance = await await agoraToken.balanceOf(simpleSeller.address);
            const oldMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);
            
            expect(oldSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(oldMarketplaceBalance).equal(0);

            await expect(simpleSeller.transferFunds()).to.be.revertedWith("No token specified");

            const newSimpleSellerBalance = await agoraToken.balanceOf(simpleSeller.address);
            const newMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);

            expect(newSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(newMarketplaceBalance).equal(0);
        
        });

        it("No owner marketplace",async function(){

            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;

            const oldSimpleSellerBalance = await await agoraToken.balanceOf(simpleSeller.address);
            const oldMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);
            
            expect(oldSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(oldMarketplaceBalance).equal(0);

            await expect(simpleSeller.transferFunds()).to.be.revertedWith("Doesn't have owner marketplace");

            const newSimpleSellerBalance = await agoraToken.balanceOf(simpleSeller.address);
            const newMarketplaceBalance = await agoraToken.balanceOf(marketplace.address);

            expect(newSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(newMarketplaceBalance).equal(0);
        
        });

    });

});

