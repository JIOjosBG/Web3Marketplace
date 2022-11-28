const { expect } = require("chai");
const { ethers } = require("hardhat");
const {signTransaction, getPackedTransacion} = require("../helperFunctions/signing.js");

describe("AgoraToken", function () {
    const oneETH = ethers.utils.parseEther("1");
    const twoETH = ethers.utils.parseEther("2");

    const acceptableTreansactionFee = ethers.utils.parseEther("0.001");

    describe("Deploy contract", async function () {
            it("Deploying",async function() {
                accounts = await ethers.getSigners();
                const AgoraToken = await ethers.getContractFactory("AgoraToken");
                let agoraToken = await AgoraToken.deploy();
            });
    });

    describe("Buying Tokens", async function () {
        let accounts;
        let agoraToken;
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const AgoraToken = await ethers.getContractFactory("AgoraToken");
            agoraToken = await AgoraToken.deploy();
        });
        
        it("Buying tokens successfully",async function() {
            expect( await agoraToken.totalSupply()).equal(0);
            expect(await agoraToken.buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH);
            expect( await agoraToken.totalSupply()).equal(oneETH);


        });
        it("Buying tokens with 0 eth",async function() {
            await expect(agoraToken.buyTokens()).to.be.rejectedWith("Should send some eth");
            await expect(agoraToken.buyTokens({value:0})).to.be.rejectedWith("Should send some eth");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect( await agoraToken.totalSupply()).equal(0);

        });
    });

    describe("Selling Tokens", async function () {
        let accounts;
        let agoraToken;
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const AgoraToken = await ethers.getContractFactory("AgoraToken");
            agoraToken = await AgoraToken.deploy();
            expect(await agoraToken.buyTokens({value:oneETH})).to.not.throw;

        });
        
        it("Selling tokens successfully",async function() {
            const oldBalance = await ethers.provider.getBalance(accounts[0].address);
            expect( await agoraToken.totalSupply()).equal(oneETH);
            expect(await agoraToken.sellTokens(oneETH)).to.not.throw;
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            const newBalance = await ethers.provider.getBalance(accounts[0].address);
            expect(newBalance.sub(oldBalance)).greaterThan(oneETH.sub(acceptableTreansactionFee));
        });
        it("Try to sell more than available",async function() {
            const oldBalance = await ethers.provider.getBalance(accounts[0].address);
            expect( await agoraToken.totalSupply()).equal(oneETH);
            await expect(agoraToken.sellTokens(twoETH)).to.be.revertedWith("Your balance is < amount you want to sell");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH);
            const newBalance = await ethers.provider.getBalance(accounts[0].address);
            expect(newBalance.sub(oldBalance)).lessThan(acceptableTreansactionFee);
        });
    });

    describe("Working with pre-signed transactions", async function () {
        let accounts;
        let agoraToken;
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const AgoraToken = await ethers.getContractFactory("AgoraToken");
            agoraToken = await AgoraToken.deploy();
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:oneETH})).to.not.throw;

        });
        
        // it("Transacting tokens successfully via pre-signed transaction",async function() {
        //     const time  = Date.now();
        //     //console.log(time);
        //     const {hashedTransaction,signedHashedTransaction} = await signTransaction(accounts[1],agoraToken.address,time,1,oneETH,accounts[1].address,accounts[0].address);
        //     // await console.log(hashedTransaction,signedHashedTransaction);
        //     let recovered = await ethers.utils.verifyMessage(hashedTransaction,signedHashedTransaction);
        //     console.log(accounts[1].address);
        //     console.log(recovered);
        // });

    });

});