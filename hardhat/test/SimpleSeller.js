const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("SimpleSeller", function () {
    function stringToHex(str){
        var arr1 = ['0','x'];
        for (var n = 0, l = str.length; n < l; n ++){
            var hex = Number(str.charCodeAt(n)).toString(16);
            arr1.push(hex);
        }
        return arr1.join('');
    }

    function hexToString(hexx) {
        var hex = hexx.toString().slice(2);//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }
    let simpleSeller;
    const oneETH = ethers.utils.parseEther("1");
    const twoETHs = ethers.utils.parseEther("2");
    const oneETHAfterFee = ethers.utils.parseEther("0.99");
    const acceptableTreansactionFee = ethers.utils.parseEther("0.001");
    //console.log(stringToHex("asdasdas"));

    // const twoETHsAfterFee = ethers.utils.parseEther("1.98");
    let hashedData;
    describe("Deployment", async function () {
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
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
    describe("Add product", async function(){
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();
            hashedData = ethers.utils.formatBytes32String("");
        });


        it("Adds products ", async function () {
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",oneETH,"asd2",hashedData)).to.not.throw;

            const product1 = await simpleSeller.products(0);
            const product2 = await simpleSeller.products(1);

            expect((await simpleSeller.getIndexesFromSellerAddress(accounts[0].address))[0]).equal(0);
            expect((await simpleSeller.getIndexesFromSellerAddress(accounts[0].address))[1]).equal(1);

            //console.log(product1);
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
    describe("Pay product",async function(){
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();
            hashedData = ethers.utils.formatBytes32String("");
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;
            const product1 = await simpleSeller.products(0);
            const product2 = await simpleSeller.products(1);
        });

        it("Pays products",async function(){
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            expect(await simpleSeller.connect(accounts[1]).payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.not.throw;
            expect( (await simpleSeller.products(0)).paid).to.be.true;
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
            const rawdeliveryInstructions = (await simpleSeller.products(0)).deliveryInstructions;
            const deliveryInstructions = hexToString(rawdeliveryInstructions);
            expect( deliveryInstructions).equal("Deliver here");

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            
        });

        it("No such product",async function(){
            await expect(simpleSeller.payProduct(3,stringToHex("Deliver here"),{value:oneETH})).to.be.revertedWith("No such product");
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,3)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,3)).equal(0);
        });

        it("Product already bought",async function(){
            expect(await simpleSeller.connect(accounts[1]).payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.not.throw;
            await expect(simpleSeller.connect(accounts[2]).payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.be.revertedWith("Product already bought");
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[2].address,0)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
        });

        it("Not enough eth",async function(){
            await expect(simpleSeller.connect(accounts[1]).payProduct(1,stringToHex("Deliver here"),{value:oneETH})).to.be.revertedWith("Not enough eth");
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,1)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,1)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(ethers.constants.AddressZero);
        });
        it("Too much eth",async function(){
            const oldBalance = await ethers.provider.getBalance(accounts[1].address);
            expect(await simpleSeller.connect(accounts[1]).payProduct(0,stringToHex("Deliver here"),{value:twoETHs})).to.not.throw;
            const newBalance = await ethers.provider.getBalance(accounts[1].address);
            
            expect(newBalance.add(oneETH)).greaterThan(oldBalance.sub(acceptableTreansactionFee));
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
        });

        it("No delivery instructions",async function(){
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            await expect(simpleSeller.connect(accounts[1]).payProduct(0,stringToHex(""),{value:oneETH})).to.be.revertedWith("No delivery instructions");
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            expect( (await simpleSeller.products(0)).buyer).equal(ethers.constants.AddressZero);
            const rawdeliveryInstructions = (await simpleSeller.products(0)).deliveryInstructions;
            const deliveryInstructions = hexToString(rawdeliveryInstructions);
            expect( deliveryInstructions).equal("");

            
        });

    });

    describe("Join marketplace", async function(){

        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();

            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();

        });
        it("Joins marketplace",async function(){
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
            expect(await simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;
            expect(await simpleSeller.ownerMarketplace()).equal(marketplace.address);
        });
        it("Joins 0 address marketplace",async function(){
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
            await expect(simpleSeller.joinMarketplace(ethers.constants.AddressZero)).to.be.revertedWith("Address shouldn't be 0");
            expect(await simpleSeller.ownerMarketplace()).equal(ethers.constants.AddressZero);
        });
    });

    describe("Deliver product", async function(){

        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();
            hashedData = ethers.utils.formatBytes32String("");
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;

        });
        it("Deliver product",async function(){
            expect((await simpleSeller.products(0)).delivered).to.be.false;

            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[0].address,0)).equal(0);


            expect(await simpleSeller.payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.not.throw;
            expect((await simpleSeller.products(0)).delivered).to.be.false;
            
            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[0].address,0)).equal(oneETH);

            expect(await simpleSeller.deliverProduct(0)).to.not.throw;
            expect((await simpleSeller.products(0)).delivered).to.be.true;

            expect(await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
            expect(await simpleSeller.owedMoneyToBuyers(accounts[0].address,0)).equal(0);
        });
        
        it("No such product",async function(){
            await expect(simpleSeller.deliverProduct(2)).to.be.revertedWith("No such product");
        });

        it("Product not paid",async function(){
            await expect(simpleSeller.deliverProduct(0)).to.be.revertedWith("Product not paid");
        });

        it("Product already delivered",async function(){
            expect(await simpleSeller.payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.not.throw;
            await expect(simpleSeller.deliverProduct(0)).to.not.throw;
            await expect(simpleSeller.deliverProduct(0)).to.be.revertedWith("Product already delivered");
        });

        it("Repaing correctly the product",async function(){
            const oldContractBalance = await ethers.provider.getBalance(simpleSeller.address);
            const oldBalance0 = await ethers.provider.getBalance(accounts[0].address);
            const oldBalance1 = await ethers.provider.getBalance(accounts[1].address);

            expect(await simpleSeller.connect(accounts[1]).payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.not.throw;
            expect(await simpleSeller.deliverProduct(0)).to.not.throw;
            const newContractBalance = await ethers.provider.getBalance(simpleSeller.address);
            expect( newContractBalance.sub(oldContractBalance)).equal(oneETH.sub(oneETHAfterFee));

            const newBalance0 = await ethers.provider.getBalance(accounts[0].address);
            const newBalance1 = await ethers.provider.getBalance(accounts[1].address);    
            
            expect( oldBalance1.sub(newBalance1)).greaterThan(oneETH.sub(acceptableTreansactionFee));
            expect( newBalance0.sub(oldBalance0)).greaterThan(oneETHAfterFee.sub(acceptableTreansactionFee));
       
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(0);
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(0);
        });
    });

    describe("Transfer funds", async function(){
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();

            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();


            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.connect(accounts[0]).payProduct(0,stringToHex("Deliver here"),{value:oneETH})).to.not.throw;
            expect(await simpleSeller.deliverProduct(0)).to.not.throw;

        });

        it("Simple transfer",async function(){
            expect(simpleSeller.joinMarketplace(marketplace.address)).to.not.throw;

            const oldSimpleSellerBalance = await ethers.provider.getBalance(simpleSeller.address);
            const oldMarketplaceBalance = await ethers.provider.getBalance(marketplace.address);
            
            expect(oldSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(oldMarketplaceBalance).equal(0);

            expect(await simpleSeller.transferFunds()).to.not.throw;

            const newSimpleSellerBalance = await ethers.provider.getBalance(simpleSeller.address);
            const newMarketplaceBalance = await ethers.provider.getBalance(marketplace.address);

            expect(newSimpleSellerBalance).equal(0);
            expect(newMarketplaceBalance).equal(oneETH.sub(oneETHAfterFee));
        
        });
        it("No owner marketplace",async function(){
            const oldSimpleSellerBalance = await ethers.provider.getBalance(simpleSeller.address);
            const oldMarketplaceBalance = await ethers.provider.getBalance(marketplace.address);
            
            expect(oldSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(oldMarketplaceBalance).equal(0);

            await expect(simpleSeller.transferFunds()).to.be.revertedWith("Doesn't have owner marketplace");

            const newSimpleSellerBalance = await ethers.provider.getBalance(simpleSeller.address);
            const newMarketplaceBalance = await ethers.provider.getBalance(marketplace.address);

            expect(newSimpleSellerBalance).equal(oneETH.sub(oneETHAfterFee));
            expect(newMarketplaceBalance).equal(0);
        
        });
    });

});

