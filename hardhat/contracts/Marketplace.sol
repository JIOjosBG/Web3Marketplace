// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgoraToken.sol";

contract Marketplace is Ownable {

    struct Market{
        address contractAddress;
        address addedBy;
        string name;
        uint addDate;
        uint addedValue;
    }

    address public  myToken;
    address[] public marketAddresses;
    uint public marketCount;
    mapping(address => Market) public markets;
    mapping(address => bool) public couriers;

    function setToken(address _token) public onlyOwner {
        require(_token!=address(0),"Token address shouldn't be address(0)");
        myToken = (_token);
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

    function addCourier(address courier) public onlyOwner{
        require(courier!=address(0),"Address shouldn't be 0");
        couriers[courier]=true;
    }

    function removeCourier(address courier) public onlyOwner{
        couriers[courier]=false;
    }
    

    receive() external  payable {}
}
