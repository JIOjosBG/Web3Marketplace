// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Marketplace.sol";
import "hardhat/console.sol";
import "./AgoraToken.sol";

contract SimpleAuction is Ownable{    
    event auctionProductAdded(string name, uint minimalPrice, address seller, uint index);
    event auctionProductBid(uint index,address bidder, uint amount);
    event auctionProductDelivered(uint index, address buyer, address courier);

    struct Product{
        string name;
        uint minimalPrice;
        address seller;
        uint addDate;
        string linkForMedia;
        bytes32 marketHashOfData;
        bool approved;
        bool delivered;
        bytes deliveryInstructions;

        address currentBidder;
        uint bidAmount;
        //uint startDate;
        uint finishDate; 
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
        bytes32 marketHashOfData,
        uint endDate
        )private view returns(Product memory){
            return Product(
                name,minimalPrice,msg.sender,block.timestamp,linkForMedia,marketHashOfData, false,false,"",
                address(0),0,/*startDate,*/endDate
            );
    }

    function addProduct(string calldata name, uint minimalPrice, string calldata link, bytes32 marketHashOfData,/*uint startDate,*/ uint finishDate) public {
        require(bytes(name).length != 0,"Name shouldn't be empty");
        require(minimalPrice>=2000000,"Price should be >=2000000");
        //require(startDate>=block.timestamp,"Start should be in the future");
        require(finishDate>=block.timestamp,"End should be in the future");
        //require(startDate<finishDate,"Start should be before end");
        products[productCount]=productInit(name, minimalPrice, link, marketHashOfData,/*startDate,*/finishDate);
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
    
    function transferFunds() public onlyOwner{
        require(address(ownerMarketplace)!=address(0),"Doesn't have owner marketplace");
        AgoraToken token = AgoraToken(ownerMarketplace.myToken());
        require(address(ownerMarketplace.myToken())!=address(0),"No token specified");
        token.transfer(address(ownerMarketplace),belongsToContract);
        belongsToContract=0;
    }

    function bidForProduct(uint index,bytes calldata deliveryInstructions,uint expiration, bytes32 nonce, uint amount, address from,bytes memory sig) public payable{
        Product storage p = products[index];
        require(p.seller!=address(0), "No such product");
        require(p.finishDate>block.timestamp,"Auction already finished");
        //require(p.startDate<block.timestamp,"Auction hasnt started");
        require(amount>=p.minimalPrice, "Bid must be larger");
        require(amount>p.bidAmount, "Bid must be larger");

        require(deliveryInstructions.length!=0, "No delivery instructions");
        require(nonce==keccak256(abi.encodePacked(address(this),index,amount)),"Wrong nonce");

        require(address(ownerMarketplace)!=address(0),"No marketplace");
        require(address(ownerMarketplace.myToken())!=address(0),"No token specified");

        p.deliveryInstructions = deliveryInstructions;

        AgoraToken token = AgoraToken(ownerMarketplace.myToken());

        token.transactiWithSignature(expiration,nonce,amount,from,address(this),sig);
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

    //TODO: mechanism to verivy the caller is authorized
    function deliverProduct(uint index) public  /* onlyDelivery */{
        Product memory p = products[index];
        require(p.seller!=address(0), "No such product");
        require(p.finishDate<block.timestamp,"Auction not finished");
        require(p.delivered==false,"Product already delivered");
        //check if caller is courier only if there is an owner marketplace, else revert with false
        require(address(ownerMarketplace)!=address(0) ? ownerMarketplace.couriers(msg.sender)==true : false,"Not an authorized courier");

        uint pay = owedMoneyToBidders[p.currentBidder][index] *99/100;
        belongsToContract += p.bidAmount/100;
        owedMoneyToBidders[p.currentBidder][index] = 0;
        products[index].delivered=true;
        AgoraToken(ownerMarketplace.myToken()).transfer(p.seller,pay);
        emit auctionProductDelivered(index, p.currentBidder, msg.sender);
    }
}
