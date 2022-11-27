// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract AGRToken is ERC20 {
    constructor() ERC20("AgoraToken", "AGR") {
        //_mint(msg.sender, initialSupply);
    }
    function buyTokens() external payable{
        require(msg.value>0,"Should send some eth");
        _mint(msg.sender, msg.value);
    }

    function sellTokens(uint amount) external {
        require(amount>0,"Amount must be >0");
        require(this.balanceOf(msg.sender)>amount,"You balance is < amount you want to sell");

        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }
}