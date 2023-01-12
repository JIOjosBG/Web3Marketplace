require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()


/** @type import('hardhat/config').HardhatUserConfig */

// const ALCHEMY_API_KEY = "KEY";
// const GOERLI_PRIVATE_KEY = "YOUR GOERLI PRIVATE KEY";

module.exports = {
  
  solidity: "0.8.13",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.API_KEY}`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY]
    },
    ganache: {
      url: `http://localhost:8545`,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY],
      allowUnlimitedContractSize: true
    }
  }
};