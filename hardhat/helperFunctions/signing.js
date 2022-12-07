const { ethers } = require("hardhat");

async function signMessage(signer,message){
    return await signer.signMessage(message);
}

async function generateSignatureStructure(expiration,contractAddress,index,amount,signingAccount,to){
    const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
    
    //const expiration  =Math.floor(Date.now()/1000)+100;
    const nonce = await ethers.utils.keccak256(await ethers.utils.solidityPack(['address','uint'],[contractAddress,index]));
    const message = await ethers.utils.solidityPack(['uint','bytes32','uint','address','address'],[expiration,nonce,amount,signingAccount.address,to]);
    const hashedMessage = await ethers.utils.arrayify(await ethers.utils.keccak256(message));
    const signature = ( await signingAccount.signMessage(hashedMessage));

    return {
        'expiration':expiration,
        'nonce':nonce,
        'amount':amount,
        'from':signingAccount.address,
        'to':to,
        'signature':signature
    }
}

module.exports = {signMessage,generateSignatureStructure}