const { ethers } = require("hardhat");

async function signMessage(signer,message){
    return await signer.signMessage(message);
}

module.exports = {signMessage}