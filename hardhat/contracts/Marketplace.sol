// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgoraToken.sol";
contract Marketplace is Ownable {
    event addedCourier(address adder, address courier);
    event removedCourier(address remover, address courier);

    constructor(bytes memory _publicKey) Ownable() {
        require(_publicKey.length==65,"Bad public key");
        publicKey = _publicKey;
    }

    struct Market{
        address contractAddress;
        address addedBy;
        string name;
        uint addDate;
    }

    bytes public publicKey;
    address public  myToken;
    address[] public marketAddresses;
    uint public marketCount;
    mapping(address => Market) public markets;
    mapping(address => bool) public couriers;
    mapping(address => bool) public admins;

    modifier onlyAdmin(){
        require(admins[msg.sender]==true,"Sender is not an admin!");
        _;
    }

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
        
        markets[contractAddress] = ( Market(contractAddress,msg.sender,name,block.timestamp));
        marketAddresses.push(contractAddress);
        marketCount+=1;
    }

    function addCourier(address courier) public onlyAdmin{
        require(courier!=address(0),"Address shouldn't be 0");
        couriers[courier]=true;
        emit addedCourier(msg.sender,courier);
    }

    function removeCourier(address courier) public onlyAdmin{
        couriers[courier]=false;
        emit removedCourier(msg.sender,courier);
    }

    function addAdmin(address admin) public onlyOwner{
        require(admin!=address(0),"Address shouldn't be 0");
        admins[admin]=true;
    }

    function removeAdmin(address admin) public onlyOwner{
        admins[admin]=false;
    }
    
    function changePublicKey(bytes memory _publicKey) public onlyOwner{
        require(_publicKey.length==65,"Bad public key");
        publicKey = _publicKey;
    }

    receive() external  payable {}
}
