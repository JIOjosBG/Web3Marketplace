// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const AgoraToken = await hre.ethers.getContractFactory("AgoraToken");
  const SimpleSeller = await hre.ethers.getContractFactory("SimpleSeller");
  const SimpleAuction = await hre.ethers.getContractFactory("SimpleAuction");

  const marketplace = await Marketplace.deploy();
  const agoraToken = await AgoraToken.deploy();
  const simpleSeller = await SimpleSeller.deploy();
  const simpleAuction = await SimpleAuction.deploy();


  await marketplace.deployed();
  await agoraToken.deployed();
  await simpleSeller.deployed();
  await simpleAuction.deployed();

  await marketplace.setToken(agoraToken.address);
  await marketplace.addContract(simpleSeller.address,"Simple Seller");
  await marketplace.addContract(simpleAuction.resolvedAddress,"Simple Auction");

  await simpleSeller.joinMarketplace(marketplace.address);
  await simpleAuction.joinMarketplace(marketplace.address);

  console.log(
    `
    {
      marketplace":"${marketplace.address}",
      "agoraToken":"${agoraToken.address}",
      "simpleSeller":"${simpleSeller.address}",
      "simpleAuction":"${simpleAuction.address}"
    }
    `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
