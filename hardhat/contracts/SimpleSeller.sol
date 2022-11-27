// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Marketplace.sol";
import "hardhat/console.sol";
contract SimpleSeller is Ownable{
    struct Product{
        string name;
        uint price;
        uint sellerGets;
        address seller;
        address buyer;
        uint addDate;
        string linkForMedia;
        bytes32 marketHashOfData;
        bool approved;
        bool paid;
        bool delivered;
        bytes deliveryInstructions; 
    }
    address public  ownerMarketplace;

    mapping(uint => Product) public products;
    mapping(address => uint[]) public sellerToProductIndexes;
    //seller to (product to money)
    mapping(address => mapping(uint => uint)) public owedMoneyToSellers;
    mapping(address => mapping(uint => uint)) public owedMoneyToBuyers;

    uint public productCount=0;

    //TODO: createProductInstance(string,uint,link,hashofdata)

    function productInit(string calldata name, uint price, string calldata link, bytes32 marketHashOfData) private view returns(Product memory){
        return Product(name,price,price*99 / 100,msg.sender,address(0),block.timestamp,link,marketHashOfData,false,false,false,"");

    }

    function addProduct(string calldata name, uint price, string calldata link, bytes32 marketHashOfData) public {
        require(bytes(name).length != 0,"Name shouldn't be empty");
        require(price>=2000000,"Price should be >=2000000");
        products[productCount]=productInit(name, price, link, marketHashOfData);
        sellerToProductIndexes[msg.sender].push(productCount);
        productCount+=1;
    }

    function getIndexesFromSellerAddress(address seller) public view returns(uint[] memory indexes){
        return sellerToProductIndexes[seller];
    }

    function joinMarketplace(address marketplace) public onlyOwner{
        require(marketplace != address(0),"Address shouldn't be 0");
        ownerMarketplace = marketplace;
    }

    function transferFunds() public onlyOwner{
        require(ownerMarketplace!=address(0),"Doesn't have owner marketplace");
        payable(ownerMarketplace).transfer(address(this).balance);
    }

    function payProduct(uint index, bytes calldata deliveryInstructions) public payable{
        Product storage p = products[index];
        require(p.seller!=address(0), "No such product");
        require(p.paid==false,"Product already bought");
        require(msg.value>=p.price, "Not enough eth");
        require(deliveryInstructions.length!=0, "No delivery instructions");

        p.deliveryInstructions = deliveryInstructions;
        p.paid=true;
        owedMoneyToSellers[p.seller][index] = p.sellerGets;
        owedMoneyToBuyers[msg.sender][index] = p.price;
        products[index].buyer = msg.sender;
        if(msg.value>p.price){
            payable(msg.sender).transfer(msg.value-p.price);
        }

    }

    function deliverProduct(uint index) public  /* onlyDelivery */{
        Product memory p = products[index];
        require(p.seller!=address(0), "No such product");
        require(p.paid==true,"Product not paid");
        require(p.delivered==false,"Product already delivered");
        uint pay = owedMoneyToSellers[p.seller][index];
        owedMoneyToSellers[p.seller][index] = 0;
        owedMoneyToBuyers[p.buyer][index] = 0;
        products[index].delivered=true;
        payable(p.seller).transfer(pay);
    }

}
