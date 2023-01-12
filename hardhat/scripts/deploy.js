
const hre = require("hardhat");
const dotenv = require("dotenv")

dotenv.config();

async function main() {
  console.log("starting")
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const AgoraToken = await hre.ethers.getContractFactory("AgoraToken");
  const SimpleSeller = await hre.ethers.getContractFactory("SimpleSeller");
  const SimpleAuction = await hre.ethers.getContractFactory("SimpleAuction");
  console.log("deploying")
  
  const marketplace = await Marketplace.deploy();
  const agoraToken = await AgoraToken.deploy();
  const simpleSeller = await SimpleSeller.deploy();
  const simpleAuction = await SimpleAuction.deploy();




  console.log("not deployed")
  await marketplace.deployed();
  console.log("deployed marketplace")
  await agoraToken.deployed();
  console.log("deployed agoraToken")
  await simpleSeller.deployed();
  console.log("deployed simpleSeller")
  await simpleAuction.deployed();
  console.log("deployed simpleAuction")

  await marketplace.setToken(agoraToken.address);
  await marketplace.addContract(simpleSeller.address,"Simple Seller");
  await marketplace.addContract(simpleAuction.resolvedAddress,"Simple Auction");
  const owner = marketplace.owner();
  //check already deployed
  await marketplace.addAdmin(owner);
  await marketplace.addAdmin(process.env.ACCOUNT_PUBLIC_KEY);

  await simpleSeller.joinMarketplace(marketplace.address);
  await simpleAuction.joinMarketplace(marketplace.address);
  //TODO: set sender to be admin in marketplace
  console.log(
    `
    {
      "marketplace":"${marketplace.address}",
      "agoraToken":"${agoraToken.address}",
      "simpleSeller":"${simpleSeller.address}",
      "simpleAuction":"${simpleAuction.address}"
    }
    `
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//first run ganache-cli -d -m "myself armed safe reveal tissue bag milk coil call sweet adult clevever" --db ./ganache_db0