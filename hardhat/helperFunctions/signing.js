const { ethers } = require("hardhat");

async function getPackedTransacion(contractAddress, expiration, nonce, amount, from, to){
    return result = await ethers.utils.solidityPack([ 'address', 'uint', 'uint' , 'uint' , 'address' , 'address' ], [ contractAddress, expiration, nonce, amount, from, to ]);
}


async function signTransaction(signer,contractAddress,expiration, nonce,amount,from,to){
    //console.log(signer.address);
    const transaction = await getPackedTransacion(contractAddress,expiration,nonce,amount,from,to);
    const hashedTransaction = await ethers.utils.keccak256(transaction);
    const signedHashedTransaction = await signer.signMessage(hashedTransaction);
    return {hashedTransaction ,signedHashedTransaction}  
    
    // let recovered = await ethers.utils.verifyMessage(message, flatSig);
    //console.log(recovered);;
} 

module.exports = {signTransaction,getPackedTransacion}