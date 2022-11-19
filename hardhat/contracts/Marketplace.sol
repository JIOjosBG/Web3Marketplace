// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {

    struct Market{
        address addedBy;
        string name;
        address contractAddress;
        uint addDate;
        uint addedValue;
    }

    address[] marketAddresses;
    uint marketCount;
    mapping(address => Market) markets;

    receive() external payable {
        if(markets[msg.sender].contractAddress!=address(0)){
            markets[msg.sender].addedValue+=msg.value;
        }else{
            ( payable(msg.sender) ).transfer(msg.value);
        }
    }

    function addContract(address contractAddress, string calldata name) public onlyOwner {
        require(contractAddress!=address(0));
        require(bytes(name).length != 0);
        require(markets[contractAddress].contractAddress == address(0));
        for(uint i = 0; i < marketCount; i++){
            //checks if hashes of strings are the same (cant comapare types string calldata and string storage with == or !=)
            require(keccak256(abi.encodePacked((name))) != keccak256(abi.encodePacked((markets[marketAddresses[i]].name))));
        }
        markets[msg.sender] = ( Market(msg.sender,name,contractAddress,block.timestamp,0));
        marketAddresses.push(msg.sender);
        marketCount+=1;
    }

}
