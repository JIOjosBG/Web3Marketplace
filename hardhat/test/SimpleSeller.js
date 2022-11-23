const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("SimpleSeller", function () {

    let simpleSeller;
    const oneETH = ethers.utils.parseEther("1");
    const twoETHs = ethers.utils.parseEther("2");
    const oneETHAfterFee = ethers.utils.parseEther("0.99");
    const twoETHsAfterFee = ethers.utils.parseEther("1.98");
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
            expect(product1.received).to.be.false;

            expect(product2.name).equal("Product2");
            expect(product2.price).equal(oneETH);
            expect(product2.sellerGets).equal(oneETHAfterFee);
            expect(product2.seller).equal(accounts[0].address);
            expect(product2.buyer).equal(ethers.constants.AddressZero);
            expect(product2.linkForMedia).equal("asd2");
            expect(product2.marketHashOfData).equal(hashedData);
            expect(product2.approved).to.be.false;
            expect(product2.paid).to.be.false;
            expect(product2.received).to.be.false;

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
        let acceptableTreansactionFee;

        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
            simpleSeller = await SimpleSeller.deploy();
            hashedData = ethers.utils.formatBytes32String("");
            expect(await simpleSeller.addProduct("Product1",oneETH,"asd1",hashedData)).to.not.throw;
            expect(await simpleSeller.addProduct("Product2",twoETHs,"asd2",hashedData)).to.not.throw;
            const product1 = await simpleSeller.products(0);
            const product2 = await simpleSeller.products(1);
            acceptableTreansactionFee = ethers.utils.parseEther("0.001");
        });

        it("Pays products",async function(){
            expect( (await simpleSeller.products(0)).paid).to.be.false;
            expect(await simpleSeller.connect(accounts[1]).payProduct(0,{value:oneETH})).to.not.throw;
            expect( (await simpleSeller.products(0)).paid).to.be.true;
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);

            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            
        });

        it("No such product",async function(){
            await expect(simpleSeller.payProduct(3,{value:oneETH})).to.be.revertedWith("No such product");
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,3)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,3)).equal(0);
        });

        it("Product already bought",async function(){
            expect(await simpleSeller.connect(accounts[1]).payProduct(0,{value:oneETH})).to.not.throw;
            await expect(simpleSeller.connect(accounts[2]).payProduct(0,{value:oneETH})).to.be.revertedWith("Product already bought");
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[2].address,0)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
        });

        it("Not enough eth",async function(){
            await expect(simpleSeller.connect(accounts[1]).payProduct(1,{value:oneETH})).to.be.revertedWith("Not enough eth");
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,1)).equal(0);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,1)).equal(0);
            expect( (await simpleSeller.products(0)).buyer).equal(ethers.constants.AddressZero);
        });
        it("Too much eth",async function(){
            const oldBalance = await ethers.provider.getBalance(accounts[1].address);
            expect(await simpleSeller.connect(accounts[1]).payProduct(0,{value:twoETHs})).to.not.throw;
            const newBalance = await ethers.provider.getBalance(accounts[1].address);
            
            expect(newBalance.add(oneETH)).greaterThan(oldBalance.sub(acceptableTreansactionFee));
            expect( await simpleSeller.owedMoneyToSellers(accounts[0].address,0)).equal(oneETHAfterFee);
            expect( await simpleSeller.owedMoneyToBuyers(accounts[1].address,0)).equal(oneETH);
            expect( (await simpleSeller.products(0)).buyer).equal(accounts[1].address);
        });
 
    });
});
