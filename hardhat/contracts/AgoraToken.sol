// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract AgoraToken is ERC20 {
    mapping(uint => bool) nonces;
    constructor() ERC20("AgoraToken", "AGR") {
        //_mint(msg.sender, initialSupply);
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

    function splitSignature(bytes[65] calldata sig) internal pure returns (uint8 v , bytes32 r, bytes32 s){
        require(sig.length == 65);
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function expectedPrefixedMessage(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
    function recoverSigner(bytes32 message, bytes[65] calldata sig) internal pure returns (address){
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }
    function sendTokensWithTransaction(uint expiration, uint nonce, uint amount, address from, address to, bytes[65] calldata sig) public {
        require(expiration>block.timestamp,"Signature expired");
        require(nonces[nonce]==false,"Signature already used");
        require(amount>0,"Amount must be >0");
        require(from!=address(0),"Zero address not allowed");
        require(to!=address(0),"Zero address not allowed");

        bytes32 message = expectedPrefixedMessage( keccak256(abi.encodePacked(address(this), expiration , nonce, amount, from, to)) );
        address expectedFrom = recoverSigner(message, sig);

        require(expectedFrom == from, "Signature from wrong user (from!=signature creator)");
        nonces[nonce]=true;
        
        _transfer(from, to, amount);
    }
}