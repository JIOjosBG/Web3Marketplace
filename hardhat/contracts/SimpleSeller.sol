// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Marketplace.sol";
import "hardhat/console.sol";
import "./AgoraToken.sol";

contract SimpleSeller is Ownable{
    event sellerProductAdded(string name, uint price, address seller, uint index);
    event sellerProductSold(uint index, address buyer);
    event sellerProductDelivered(uint index, address seller, address courier);

    struct Product{
        string name;
        uint price;
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

    uint public belongsToContract=0;

    Marketplace public  ownerMarketplace;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public sellerToProductIndexes;
    //seller to (product to money)
    mapping(address => mapping(uint => uint)) public owedMoneyToSellers;
    mapping(address => mapping(uint => uint)) public owedMoneyToBuyers;

    uint public productCount=0;

    function productInit(string calldata name, uint price, string calldata link, bytes32 marketHashOfData) private view returns(Product memory){
        return Product(name,price,msg.sender,address(0),block.timestamp,link,marketHashOfData,false,false,false,"");

    }

    function addProduct(string calldata name, uint price, string calldata link, bytes32 marketHashOfData) public {
        require(bytes(name).length != 0,"Name shouldn't be empty");
        require(price>=2000000,"Price should be >=2000000");
        products[productCount]=productInit(name, price, link, marketHashOfData);
        sellerToProductIndexes[msg.sender].push(productCount);
        emit sellerProductAdded(name,price,msg.sender,productCount);
        productCount+=1;
    }

    function getIndexesFromSellerAddress(address seller) public view returns(uint[] memory indexes){
        return sellerToProductIndexes[seller];
    }

    function joinMarketplace(Marketplace marketplace) public onlyOwner{
        require(address(marketplace) != address(0),"Address shouldn't be 0");
        ownerMarketplace =Marketplace(marketplace);
    }

    function transferFunds() public onlyOwner{
        require(address(ownerMarketplace)!=address(0),"Doesn't have owner marketplace");
        //payable(ownerMarketplace).transfer(address(this).balance);
        AgoraToken token = AgoraToken(ownerMarketplace.myToken());
        require(address(ownerMarketplace.myToken())!=address(0),"No token specified");
        token.transfer(address(ownerMarketplace),belongsToContract);
        belongsToContract=0;
    }

    function payProduct(uint index, bytes calldata deliveryInstructions,uint expiration, bytes32 nonce, uint amount, address from,bytes memory sig) public payable{
        Product storage p = products[index];
        require(p.seller!=address(0), "No such product");
        require(p.paid==false,"Product already bought");
        require(amount>=p.price, "Not enough eth");
        require(deliveryInstructions.length!=0, "No delivery instructions");
        require(nonce==keccak256(abi.encodePacked(address(this),index)),"Wrong nonce");
        require(address(ownerMarketplace)!=address(0),"No marketplace");
        require(address(ownerMarketplace.myToken())!=address(0),"No token specified");

        p.deliveryInstructions = deliveryInstructions;
        p.paid=true;
        owedMoneyToSellers[p.seller][index] = p.price*99/100;
        owedMoneyToBuyers[from][index] = p.price;
        products[index].buyer = from;
        AgoraToken token = AgoraToken(ownerMarketplace.myToken());
        token.transactiWithSignature(expiration,nonce,amount,from,address(this),sig);

        if(amount>p.price){
            token.transfer(from,amount-p.price);
        }
        emit sellerProductSold(index, from);


    }

    function deliverProduct(uint index) public  /* onlyDelivery */{
        Product memory p = products[index];
        require(p.seller!=address(0), "No such product");
        require(p.paid==true,"Product not paid");
        require(p.delivered==false,"Product already delivered");
        //check if caller is courier only if there is an owner marketplace, else revert with false
        require(address(ownerMarketplace)!=address(0) ? ownerMarketplace.couriers(msg.sender)==true : false,"Not an authorized courier");
        uint pay = owedMoneyToSellers[p.seller][index];
        belongsToContract+=p.price-pay;
        owedMoneyToSellers[p.seller][index] = 0;
        owedMoneyToBuyers[p.buyer][index] = 0;
        products[index].delivered=true;
        AgoraToken(ownerMarketplace.myToken()).transfer(p.seller,pay);
        //payable(p.seller).transfer(pay);
        emit sellerProductDelivered(index, p.seller, msg.sender);
    }

}
