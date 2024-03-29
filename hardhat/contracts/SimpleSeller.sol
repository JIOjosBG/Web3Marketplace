// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Marketplace.sol";
import "hardhat/console.sol";
import "./AgoraToken.sol";

contract SimpleSeller is Ownable{
    event sellerProductAdded(string  name, uint price, address  seller, uint  index);
    event sellerProductSold(uint  index, address  buyer);
    event sellerProductDelivered(uint  index, address  seller, address  courier);
    event sellerProductApproved(uint  index);

    struct Product{
        string name;
        uint price;
        address seller;
        address buyer;
        uint addDate;
        string linkForMedia;
        bytes marketHashOfData;
        bool approved;
        bool paid;
        bool delivered;
        bytes deliveryInstructions; 
    }

    modifier correctlyInstantiated{
        require(address(ownerMarketplace)!=address(0),"Doesn't have owner marketplace");
        require(address(ownerMarketplace.myToken())!=address(0),"No token specified");
        _;
    }

    modifier productExists(uint index){
        require(products[index].seller!=address(0),"No such product");
        _;
    }

    uint public belongsToContract=0;

    Marketplace public  ownerMarketplace;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public sellerToProductIndexes;
    //seller to (product to money)
    mapping(address => mapping(uint => uint)) public owedMoneyToSellers;
    mapping(address => mapping(uint => uint)) public owedMoneyToBuyers;

    uint public productCount=0;

    function productInit(string calldata name, uint price, string calldata link, bytes calldata marketHashOfData) private view returns(Product memory){
        return Product(name,price,msg.sender,address(0),block.timestamp,link,marketHashOfData,false,false,false,"");
    }

    function addProduct(string calldata name, uint price, string calldata link, bytes calldata marketHashOfData) public {
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

    function transferFunds() public onlyOwner correctlyInstantiated{
        AgoraToken token = AgoraToken(ownerMarketplace.myToken());
        token.transfer(address(ownerMarketplace),belongsToContract);
        belongsToContract=0;
    }
    
    function payProduct(
        uint index, bytes calldata deliveryInstructions,
        uint expiration,address from,bytes memory sig
    ) public productExists(index) correctlyInstantiated{
        Product storage p = products[index];
        require(p.paid==false,"Product already bought");
        require(deliveryInstructions.length!=0, "No delivery instructions");
        bytes32 nonce=keccak256(abi.encodePacked(address(this),index));

        p.deliveryInstructions = deliveryInstructions;
        p.paid=true;
        owedMoneyToSellers[p.seller][index] = p.price*99/100;
        owedMoneyToBuyers[from][index] = p.price;
        products[index].buyer = from;

        AgoraToken token = AgoraToken(ownerMarketplace.myToken());
        token.transactiWithSignature(expiration,nonce,p.price,from,address(this),sig);
        
        emit sellerProductSold(index, from);
    }

    function deliverProduct(uint index) public productExists(index) correctlyInstantiated{
        Product memory p = products[index];
        require(p.paid==true,"Product not paid");
        require(p.delivered==false,"Product already delivered");
        require(ownerMarketplace.couriers(msg.sender)==true,"Not an authorized courier");
        
        uint pay = owedMoneyToSellers[p.seller][index];
        belongsToContract+=p.price-pay;
        owedMoneyToSellers[p.seller][index] = 0;
        owedMoneyToBuyers[p.buyer][index] = 0;
        products[index].delivered=true;
        AgoraToken(ownerMarketplace.myToken()).transfer(p.seller,pay);
        //payable(p.seller).transfer(pay);
        emit sellerProductDelivered(index, p.seller, msg.sender);
    }

    function approveProduct(uint index) public productExists(index) onlyOwner{
        products[index].approved=true;
        emit sellerProductApproved(index);
    }

}
