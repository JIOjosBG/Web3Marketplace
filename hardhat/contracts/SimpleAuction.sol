// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Marketplace.sol";
import "hardhat/console.sol";
import "./AgoraToken.sol";

contract SimpleAuction is Ownable{    
    event auctionProductAdded(string indexed name, uint minimalPrice, address indexed seller, uint indexed index);
    event auctionProductBid(uint indexed index,address indexed bidder, uint indexed amount);
    event auctionProductDelivered(uint indexed index, address indexed buyer, address indexed courier);
    event auctionProductApproved(uint indexed index);
    struct Product{
        string name;
        uint minimalPrice;
        address seller;
        uint addDate;
        string linkForMedia;
        bytes marketHashOfData;
        bool approved;
        bool delivered;
        bytes deliveryInstructions;

        address currentBidder;
        uint bidAmount;
        uint finishDate; 
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
    
    Marketplace public  ownerMarketplace;
    uint public belongsToContract=0;

    mapping(uint => Product) public products;
    mapping(address => uint[]) public sellerToProductIndexes;
    mapping(address => mapping(uint => uint)) public owedMoneyToBidders;

    uint public productCount=0;
    
    function productInit(
        string calldata name,
        uint minimalPrice,
        string calldata linkForMedia,
        bytes calldata marketHashOfData,
        uint endDate
        )private view returns(Product memory){
            return Product(
                name,minimalPrice,msg.sender,block.timestamp,linkForMedia,marketHashOfData, false,false,"",
                address(0),0,endDate
            );
    }

    function addProduct(string calldata name, uint minimalPrice, string calldata link, bytes calldata marketHashOfData, uint finishDate) public {
        require(bytes(name).length != 0,"Name shouldn't be empty");
        require(minimalPrice>=2000000,"Price should be >=2000000");
        require(finishDate>=block.timestamp,"End should be in the future");
        products[productCount]=productInit(name, minimalPrice, link, marketHashOfData,finishDate);
        sellerToProductIndexes[msg.sender].push(productCount);
        emit auctionProductAdded(name, minimalPrice, msg.sender,productCount);
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

    function bidForProduct(uint index,bytes calldata deliveryInstructions, uint amount, address from,bytes memory sig) public productExists(index) correctlyInstantiated{
        Product storage p = products[index];
        require(p.finishDate>block.timestamp,"Auction already finished");
        require(amount>=p.minimalPrice, "Bid must be larger");
        require(amount>p.bidAmount, "Bid must be larger");
        require(deliveryInstructions.length!=0, "No delivery instructions");
        //require(nonce==keccak256(abi.encodePacked(address(this),index,amount)),"Wrong nonce");
        bytes32 nonce = keccak256(abi.encodePacked(address(this),index,amount));
        p.deliveryInstructions = deliveryInstructions;
        AgoraToken token = AgoraToken(ownerMarketplace.myToken());
        token.transactiWithSignature(p.finishDate,nonce,amount,from,address(this),sig);
        //RETURN PREV BID MONEY
        if(p.currentBidder!=address(0)){
            owedMoneyToBidders[p.currentBidder][index] = 0;
            token.transfer(p.currentBidder,p.bidAmount);
        }
        owedMoneyToBidders[from][index] = amount;
        p.bidAmount=amount;
        p.currentBidder=from;

        emit auctionProductBid(index, from, amount);
    }

    function deliverProduct(uint index) public productExists(index) correctlyInstantiated{
        require(Marketplace(ownerMarketplace).couriers(msg.sender),"Not an authorized courier");
        
        Product memory p = products[index];
        require(p.finishDate<block.timestamp,"Auction not finished");
        require(p.currentBidder!=address(0),"No bids, therefore can't deliver");
        require(p.delivered==false,"Product already delivered");
        uint pay = owedMoneyToBidders[p.currentBidder][index] *99/100;
        belongsToContract += p.bidAmount/100;
        owedMoneyToBidders[p.currentBidder][index] = 0;
        products[index].delivered=true;
        AgoraToken(ownerMarketplace.myToken()).transfer(p.seller,pay);
        emit auctionProductDelivered(index, p.currentBidder, msg.sender);
    }
    
    function approveProduct(uint index) public onlyOwner productExists(index){
        products[index].approved=true;
        emit auctionProductApproved(index);
    }
}
