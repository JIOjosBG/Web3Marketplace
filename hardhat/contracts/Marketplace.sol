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

    Market[] markets;
    uint marketCount;
    mapping(address => uint) addressToIndex;
    mapping(string => uint) nameToIndex; 

    function addContract(address contractAddress, string calldata name) public onlyOwner {
        require(contractAddress!=address(0));
        require(bytes(name).length != 0);
        for(uint i = 0; i < markets.length; i++){
            require(contractAddress != markets[i].contractAddress);
            //checks is hashes of strings are the same (cant comapare types string calldata and string storage with == or !=)
            require(keccak256(abi.encodePacked((name))) != keccak256(abi.encodePacked((markets[i].name))));
        }
        markets.push(Market(msg.sender,name,contractAddress,block.timestamp,0));
        addressToIndex[contractAddress] = marketCount;
        nameToIndex[name] = marketCount;
        marketCount+=1;
    }
}
