// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract AgoraToken is ERC20 {
    mapping(bytes32 => bool) nonces;
    constructor() ERC20("AgoraToken", "AGR") {
    }
    
    function buyTokens() external payable{
        require(msg.value>0,"Should send some eth");
        _mint(msg.sender, msg.value);
    }

    function sellTokens(uint amount) external {
        require(amount>0,"Amount must be >0");
        require(this.balanceOf(msg.sender)>=amount,"Your balance is < amount you want to sell");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    function prefixed(bytes32 messageHash) internal pure returns (bytes32) { 
        bytes memory hashPrefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(hashPrefix, messageHash));
    }
    function splitSignature(bytes memory sig) internal pure returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65,"Signature has bad length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function getMsgSigner(bytes32 _hashedMessage, bytes memory signature) internal pure returns (address) {
        bytes32 prefixedHashMessage = prefixed(_hashedMessage);
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        address signer = ecrecover(prefixedHashMessage, v, r, s);
        return signer;
    }

    function transactiWithSignature (
        uint expiration, bytes32 nonce, uint amount, 
        address from, address to, bytes memory signature ) public{

        require(expiration>block.timestamp,"Signature expired");
        require(nonces[nonce]==false,"Nonce used");
        require(amount>0,"Amount should be >0");
        require(from!=address(0),"From can't be address(0)");
        require(to!=address(0),"To can't be address(0)");
        require(amount<=balanceOf(from),"Not enough tokens");

        bytes32 message = keccak256(abi.encodePacked(expiration,nonce,amount,from,to));
        address signer = getMsgSigner(message,signature);
        require(signer==from,"Wrong arguments (recoveredAddress!=from)");
        nonces[nonce] = true;
        _transfer(from, to, amount );
    }
}