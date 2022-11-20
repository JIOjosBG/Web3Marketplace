// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Marketplace.sol";

contract SimpleSeller is Ownable{
    struct Product{
        string name;
        uint userPays;
        uint sellerGets;
        address seller;
        uint addDate;
        string linkForMedia;
        bytes32 marketHashOfData;
        bool approved;  
    }
    address public  ownerMarketplace;
    Product[] products;
    uint numberOfProducts=0;
    
    mapping(address => uint[]) public sellerToProductIndexes;
    mapping(bytes32 => uint) public productHashToIndex;

    function addProduct(string calldata name, uint price, string calldata link, bytes32 marketHashOfData) public {
        require(bytes(name).length != 0,"Name shouldn't be empty");
        require(price>2000000);
        products.push(Product(name,price,price*100 / 99,msg.sender,block.timestamp,link,marketHashOfData,false));
    }

    function joinMarketplace(address marketplace) public onlyOwner{
        require(marketplace != address(0),"Address shouldn't be 0 ");
        ownerMarketplace = marketplace;
    }

    function transferFunds() public onlyOwner{
        require(ownerMarketplace!=address(0),"Doesn't have owner marketplace");
        payable(ownerMarketplace).transfer(address(this).balance);
    }
}
