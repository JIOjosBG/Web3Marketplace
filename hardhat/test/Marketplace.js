const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("Marketplace", function () {

    let marketplace;
    const oneETH = ethers.utils.parseEther("1");
    describe("Deployment", async function () {
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();

        });

        it("Should have the correct owner", async function () {
            const addressOfOwnerOfMarketplace = await marketplace.owner();
            expect(addressOfOwnerOfMarketplace).to.equal(accounts[0].address, "Wrong owner");
            expect(addressOfOwnerOfMarketplace).to.not.equal(accounts[1].address, "Wrong owner");
        });

        it("Should start with 0 values", async function () {
            expect(await marketplace.marketCount()).equal(0);
            const addresses = await marketplace.getMarketAddresses();
            expect(addresses.length).equal(0);
        });
    });
    describe("Add contracts", async function(){
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();

            const SimpleSeller = await ethers.getContractFactory("SimpleSeller");

            simpleSeller1 = await SimpleSeller.deploy();
            simpleSeller2 = await SimpleSeller.deploy();
            simpleSeller3 = await SimpleSeller.deploy();

        });

        it("Adds one market contract", async function () {
            expect(await marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(1);
        });
        it("Adds multiple market contract", async function () {
            expect(await marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            expect(await marketplace.addContract(simpleSeller2.address,"SimpleSeller2")).to.not.throw;
            expect(await marketplace.addContract(simpleSeller3.address,"SimpleSeller3")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(3);
            expect( await marketplace.marketCount()).equal(3);

            expect((await marketplace.markets(simpleSeller1.address)).name).equal("SimpleSeller1");
            expect((await marketplace.markets(simpleSeller2.address)).name).equal("SimpleSeller2");
            expect((await marketplace.markets(simpleSeller3.address)).name).equal("SimpleSeller3");
        });

        it("Has correct market address", async function () {
            expect(await marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            expect(await marketplace.addContract(simpleSeller2.address,"SimpleSeller2")).to.not.throw;
            expect(await marketplace.addContract(simpleSeller3.address,"SimpleSeller3")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(3);
            expect( await marketplace.marketCount()).equal(3);
            
            expect((await marketplace.markets(simpleSeller1.address)).addedBy).equal(accounts[0].address);
            expect((await marketplace.markets(simpleSeller1.address)).addedBy).equal(accounts[0].address);
            expect((await marketplace.markets(simpleSeller1.address)).addedBy).equal(accounts[0].address);


        });

        it("Gets the address of the added contract", async function () {
            expect(  await marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(1);
            expect( (await marketplace.getMarketAddresses())[0]).equal(simpleSeller1.address);
        });

        it("Thrwos error on 0 address", async function () {
            await expect(marketplace.addContract("0x0000000000000000000000000000000000000000","SimpleSeller1"))
        .to.be.revertedWith("Address shouldn't be 0");
            expect( (await marketplace.getMarketAddresses()).length).equal(0);
        });

        it("Thrwos error on empty name", async function () {
            await expect(marketplace.addContract(simpleSeller1.address,"")).to.be.revertedWith("Name length shouldn't be 0");
            expect( (await marketplace.getMarketAddresses()).length).equal(0);
        });

        it("Tries to double add a contract", async function () {
            await expect(marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            await expect(marketplace.addContract(simpleSeller1.address,"SimpleSeller2")).to.be.revertedWith("Market already added");
            expect( (await marketplace.getMarketAddresses()).length).equal(1);
            await expect(marketplace.addContract(simpleSeller2.address,"SimpleSeller2")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(2);
            await expect(marketplace.addContract(simpleSeller2.address,"SimpleSeller2")).to.be.revertedWith("Market already added");
            expect( (await marketplace.getMarketAddresses()).length).equal(2);
        });
    });
    describe("Pays to marketplace",async function() {
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();

            await ethers.provider.getBalance(accounts[0].address)
            
        });

        it("Tries to pay as a contract", async function () {
            //add user as contract
            await expect(marketplace.addContract(accounts[0].address,"SimpleSeller1")).to.not.throw;
            await expect((await marketplace.getMarketAddresses()).length).equal(1);
            const balance0Before = await ethers.provider.getBalance(accounts[0].address);
            // console.log(balance0Before)
            await expect(await marketplace.connect(accounts[0]).payAsMarket({value: oneETH})).to.not.throw;
            const balance0After = await ethers.provider.getBalance(accounts[0].address);
            // console.log(balance0After)
            expect(balance0Before).to.be.greaterThan(balance0After);
        });

        it("Tries to pay as a non-market", async function () {
            //add user as contract
            await expect(marketplace.addContract(accounts[0].address,"SimpleSeller1")).to.not.throw;
            await expect((await marketplace.getMarketAddresses()).length).equal(1);

            const balance1Before = await ethers.provider.getBalance(accounts[1].address);
            await expect(marketplace.connect(accounts[1]).payAsMarket({value: oneETH})).to.be.revertedWith("Market is not added");
            const balance1After = await ethers.provider.getBalance(accounts[1].address);
            
            expect(balance1Before-balance1After).to.be.lessThan(ethers.utils.parseEther("0.00003"));
        });

    });

});
