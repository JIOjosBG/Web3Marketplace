// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
contract Marketplace is Ownable {

    struct Market{
        address contractAddress;
        address addedBy;
        string name;
        uint addDate;
        uint addedValue;
    }

    address[] public marketAddresses;
    uint public marketCount;
    mapping(address => Market) public markets;

    receive() external payable {
        if(markets[msg.sender].contractAddress!=address(0)){
            markets[msg.sender].addedValue+=msg.value;
        }else{
            ( payable(msg.sender) ).transfer(msg.value);
        }
    }

    function addContract(address contractAddress, string calldata name) public onlyOwner {
        require(contractAddress!=address(0),"address shouldn't be 0");
        require(bytes(name).length != 0, "Name length shouldn't be 0");
        require(markets[contractAddress].contractAddress == address(0),"Market already exists");

        markets[msg.sender] = ( Market(contractAddress,msg.sender,name,block.timestamp,0));
        marketAddresses.push(msg.sender);
        marketCount+=1;
    }

}
