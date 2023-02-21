const { expect } = require("chai");
const { ethers } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config();


function hexToArray(hexx) {
    var hex = hexx.toString().slice(2);
    var arr = [];
    for (var i = 0; i < hex.length; i += 2)
        arr.push(parseInt(hex.substr(i, 2), 16));
    return arr;
}

function arrayToHex(arr){
    var res = ['0','x'];
    for (var n = 0, l = arr.length; n < l; n ++){
        var hex = arr[n].toString(16);
        if(hex.length==1){
            res.push('0')
        }
        res.push(hex);
    }
    return res.join('');
}

describe("Marketplace", function () {

    let marketplace;
    let Marketplace;
    let agoraToken;
    let AgoraToken;

    let accounts;
    let publicKey;

    let SimpleSeller;
    let simpleSeller1;
    let simpleSeller2;
    let simpleSeller3;

    beforeEach(async function ()  {
        accounts = await ethers.getSigners();
        Marketplace = await ethers.getContractFactory("Marketplace");
        publicKey = await ethers.utils.computePublicKey(process.env.ACCOUNT_PRIVATE_KEY);
        publicKey = hexToArray(publicKey);
        marketplace = await Marketplace.deploy(publicKey);
        
        AgoraToken = await ethers.getContractFactory("AgoraToken");
        agoraToken = await AgoraToken.deploy();

        SimpleSeller = await ethers.getContractFactory("SimpleSeller");

        simpleSeller1 = await SimpleSeller.deploy();
        simpleSeller2 = await SimpleSeller.deploy();
        simpleSeller3 = await SimpleSeller.deploy();
    });
    
    describe("Deployment", async function () {


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

        it("Should require public address", async function () {
            await expect(Marketplace.deploy([1,2,3,4])).to.be.revertedWith("Bad public key");
        });
    });
    describe("Add contracts", async function(){

        it("Adds one market contract", async function () {
            expect(await marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(1);
        });

        it("Not owner add contract", async function () {
            await expect(marketplace.connect(accounts[1]).addContract(simpleSeller1.address,"SimpleSeller1")).to.be.revertedWith('Ownable: caller is not the owner');
            expect( (await marketplace.getMarketAddresses()).length).equal(0);
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
            expect((await marketplace.markets(simpleSeller2.address)).addedBy).equal(accounts[0].address);
            expect((await marketplace.markets(simpleSeller3.address)).addedBy).equal(accounts[0].address);
        });

        it("Gets the address of the added contract", async function () {
            expect(  await marketplace.addContract(simpleSeller1.address,"SimpleSeller1")).to.not.throw;
            expect( (await marketplace.getMarketAddresses()).length).equal(1);
            expect( (await marketplace.getMarketAddresses())[0]).equal(simpleSeller1.address);
        });

        it("Throws error on 0 address", async function () {
            await expect(marketplace.addContract(await ethers.constants.AddressZero,"SimpleSeller1")).to.be.revertedWith("Address shouldn't be 0");
            expect( (await marketplace.getMarketAddresses()).length).equal(0);
        });

        it("Throws error on empty name", async function () {
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
    describe("setToken",async function(){
        it("Correct address from owner",async function(){
            expect(await marketplace.setToken(agoraToken.address)).to.not.throw;
        });
        it("Correct address not from owner",async function(){
            await expect(marketplace.connect(accounts[1]).setToken(agoraToken.address)).to.be.revertedWith('Ownable: caller is not the owner');
        });
        it("0 address from owner",async function(){
            await expect(marketplace.setToken(ethers.constants.AddressZero)).to.be.revertedWith("Token address shouldn't be address(0)");
        });
    });
    
    describe("Add and remove admin",async function(){
        it("successfully adds and removes",async function(){
            expect(await marketplace.admins(accounts[0].address)).to.be.false;
            expect(await marketplace.addAdmin(accounts[0].address)).to.not.throw;
            expect(await marketplace.admins(accounts[0].address)).to.be.true;
            expect(await marketplace.removeAdmin(accounts[0].address)).to.not.throw;
            expect(await marketplace.admins(accounts[0].address)).to.be.false;
        });
        it("0 address from owner",async function (){
            await expect( marketplace.addAdmin(ethers.constants.AddressZero)).to.be.revertedWith("Address shouldn't be 0");
        });
        it("Correct address not from owner",async function (){
            await expect( marketplace.connect(accounts[1]).addAdmin(accounts[1].address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
    describe("addCourier and removeCourier",async function(){
        beforeEach(async function(){
            expect(await marketplace.addAdmin(accounts[0].address)).to.not.throw;
        });
        it("successfully adds and removes",async function(){
            expect(await marketplace.couriers(accounts[0].address)).to.be.false;
            expect(await marketplace.addCourier(accounts[0].address))
            .to.emit(marketplace, "addedCourier")
            .withArgs(accounts[0].address,accounts[0].address);
            expect(await marketplace.couriers(accounts[0].address)).to.be.true;
            expect(await marketplace.removeCourier(accounts[0].address))
            .to.emit(marketplace, "removedCourier")
            .withArgs(accounts[0].address,accounts[0].address);
            expect(await marketplace.couriers(accounts[0].address)).to.be.false;
        });

        it("Tries to add 0 address",async function(){
            expect(await marketplace.couriers(await ethers.constants.AddressZero)).to.be.false;
            await expect(marketplace.addCourier(await ethers.constants.AddressZero)).to.be.revertedWith("Address shouldn't be 0");
            expect(await marketplace.couriers(await ethers.constants.AddressZero)).to.be.false;
        });

        it("Not admin",async function(){
            expect(await marketplace.couriers(accounts[3].address)).to.be.false;
            await expect(marketplace.connect(accounts[2]).addCourier(accounts[3].address)).to.be.revertedWith("Sender is not an admin!");
            expect(await marketplace.couriers(accounts[3].address)).to.be.false;
        });
    });

    describe("change public key",async function(){

        it("successfully changes",async function(){
           let newPublicKey = [];
           for(let i=0;i<65;i++){
               newPublicKey.push(i+1);
           }
           expect(await marketplace.changePublicKey(newPublicKey)).to.not.throw;
           expect(await marketplace.publicKey()).to.equal(arrayToHex(newPublicKey));
        });

        it("Reverts on bad public key",async function(){

            await expect(marketplace.changePublicKey([1,2,3,4])).to.be.revertedWith("Bad public key");
            expect(await marketplace.publicKey()).to.equal(arrayToHex(publicKey));
        });
    });

});
