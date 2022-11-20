// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

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
    public address marketplace;
    Product[] products;
    uint numberOfProducts=0;
    
    public mapping(address => uint[]) sellerToProductIndexes;
    public mapping(bytes32 => uint) productHashToIndex;

    function addProduct(string calldata name, uint price, string calldata link, bytes32 marketHashOfData) public {
        require(bytes(name).length != 0);
        require(price>2000000);
        products.push(new Product(name,price,price*0.99,msg.sender,block.timestamp,link,marketHashOfData,false);
    }
}
