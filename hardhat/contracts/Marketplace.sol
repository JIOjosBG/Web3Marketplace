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


    function payAsMarket() public payable{
        require(markets[msg.sender].contractAddress!=address(0),"Market is not added");
         payable(msg.sender).transfer(msg.value);
    }

    function getMarketAddresses() public view returns(address[] memory){
        return marketAddresses;
    }

    function addContract(address contractAddress, string calldata name) public onlyOwner {
        require(contractAddress!=address(0),"Address shouldn't be 0");
        require(bytes(name).length != 0, "Name length shouldn't be 0");
        require(markets[contractAddress].contractAddress == address(0),"Market already added");
        
        markets[contractAddress] = ( Market(contractAddress,msg.sender,name,block.timestamp,0));
        marketAddresses.push(contractAddress);
        marketCount+=1;
    }

}
