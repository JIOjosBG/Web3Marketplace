const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgoraToken", function () {
    let oneETH;
    let twoETH;
    let acceptableTreansactionFee;

    let accounts;
    let AgoraToken;
    let agoraToken;
    this.beforeEach(async function(){
        oneETH = ethers.utils.parseEther("1");
        twoETH = ethers.utils.parseEther("2");
        acceptableTreansactionFee = ethers.utils.parseEther("0.001");
        accounts = await ethers.getSigners();
        AgoraToken = await ethers.getContractFactory("AgoraToken");
        agoraToken = await AgoraToken.deploy();
    });


    describe("Buying Tokens", async function () {
        
        it("Buying tokens successfully",async function() {
            expect( await agoraToken.totalSupply()).equal(0);
            expect(await agoraToken.buyTokens({value:oneETH})).to.not.throw;
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH);
            expect( await agoraToken.totalSupply()).equal(oneETH);


        });
        it("Buying tokens with 0 eth",async function() {
            await expect(agoraToken.buyTokens()).to.be.revertedWith("Should send some eth");
            await expect(agoraToken.buyTokens({value:0})).to.be.revertedWith("Should send some eth");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect( await agoraToken.totalSupply()).equal(0);

        });
    });

    describe("Selling Tokens", async function () {
        beforeEach(async function ()  {
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

        it("Try to sell 0",async function() {
            const oldBalance = await ethers.provider.getBalance(accounts[0].address);
            expect( await agoraToken.totalSupply()).equal(oneETH);
            await expect(agoraToken.sellTokens(0)).to.be.revertedWith("Amount must be >0");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH);
            const newBalance = await ethers.provider.getBalance(accounts[0].address);
            expect(newBalance.sub(oldBalance)).lessThan(acceptableTreansactionFee);
        });
    });

    describe("Working with pre-signed transactions", async function () {
        let expiration;
        let expired;

        let nonce;

        beforeEach(async function ()  {
            expect(await agoraToken.connect(accounts[1]).buyTokens({value:twoETH})).to.not.throw;
            expiration = Math.floor(Date.now()/1000)+100;
            expired =  Math.floor(Date.now()/1000)-3600;

            nonce = ethers.utils.hexZeroPad(ethers.utils.hexlify(1), 32)

        });
        
        it("Transacting tokens successfully via pre-signed transaction",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,oneETH,accounts[1].address,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            expect(await agoraToken.transactiWithSignature(expiration,nonce,oneETH,accounts[1].address,accounts[0].address,signature)).to.not.throw;
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(oneETH);
        });

        it("Expired",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expired,nonce,oneETH,accounts[1].address,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expired,nonce,oneETH,accounts[1].address,accounts[0].address,signature)).to.be.revertedWith("Signature expired");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
        });

        it("Used nonce",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,oneETH,accounts[1].address,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,oneETH,accounts[1].address,accounts[0].address,signature)).to.not.throw;
            await expect(agoraToken.transactiWithSignature(expiration,nonce,oneETH,accounts[1].address,accounts[0].address,signature)).to.be.revertedWith("Nonce used");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(oneETH);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(oneETH);
        });

        it("Amount should be > 0",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,0,accounts[1].address,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,0,accounts[1].address,accounts[0].address,signature)).to.be.revertedWith("Amount should be >0");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
        });

        it("No enough tokens",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,twoETH,accounts[1].address,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            
            const nonce2 = ethers.utils.hexZeroPad(ethers.utils.hexlify(2), 32)
            const message2 = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce2,twoETH,accounts[1].address,accounts[0].address]);
            const hashedMessage2 = await ethers.utils.arrayify(await ethers.utils.keccak256(message2));
            const signature2 = ( await accounts[1].signMessage(hashedMessage2));
            
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,twoETH,accounts[1].address,accounts[0].address,signature)).to.not.throw;
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(twoETH);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(0);
            await expect(agoraToken.transactiWithSignature(expiration,nonce2,twoETH,accounts[1].address,accounts[0].address,signature2)).to.be.revertedWith("Not enough tokens");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(twoETH);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(0);
            
        });

        it("From=addres(0)",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,twoETH,ethers.constants.AddressZero,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,twoETH,ethers.constants.AddressZero,accounts[0].address,signature)).to.be.revertedWith("From can't be address(0)");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
        });

        it("To=addres(0)",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,twoETH,accounts[1].address,ethers.constants.AddressZero]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,twoETH,accounts[1].address,ethers.constants.AddressZero,signature)).to.be.revertedWith("To can't be address(0)");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
        });

        
        it("Bad arguments for signature",async function() {
            //switching from and to to make the message different from the passed arguments
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,oneETH,accounts[0].address,accounts[1].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            const signature = ( await accounts[1].signMessage(hashedMessage));
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,oneETH,accounts[1].address,accounts[0].address,signature)).to.be.revertedWith("Wrong arguments (recoveredAddress!=from)");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
        });
        it("Bad signature",async function() {
            const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,oneETH,accounts[1].address,accounts[0].address]);
            const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
            let signature = ( await accounts[1].signMessage(hashedMessage));
            signature+="aa";
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
            await expect(agoraToken.transactiWithSignature(expiration,nonce,oneETH,accounts[1].address,accounts[0].address,signature)).to.be.revertedWith("Signature has bad length");
            expect(await agoraToken.balanceOf(accounts[0].address)).equal(0);
            expect(await agoraToken.balanceOf(accounts[1].address)).equal(twoETH);
        });
    });

});