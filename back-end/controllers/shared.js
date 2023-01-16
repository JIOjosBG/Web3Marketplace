const ganache = require("ganache");
const ethers = require("ethers");

var url = 'http://localhost:8545';
var provider = new ethers.providers.JsonRpcProvider(url);

module.exports = provider;