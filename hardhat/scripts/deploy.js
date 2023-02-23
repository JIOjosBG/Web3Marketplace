
const {ethers} = require("hardhat");
const dotenv = require("dotenv")

dotenv.config();

function hexToArray(hexx) {
  var hex = hexx.toString().slice(2);
  var arr = [];
  for (var i = 0; i < hex.length; i += 2)
      arr.push(parseInt(hex.substr(i, 2), 16));
  return arr;
}


async function main() {
  console.log("starting")
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const AgoraToken = await ethers.getContractFactory("AgoraToken");
  const SimpleSeller = await ethers.getContractFactory("SimpleSeller");
  const SimpleAuction = await ethers.getContractFactory("SimpleAuction");
  console.log("deploying")
  const wallet = new ethers.Wallet(process.env.ACCOUNT_PRIVATE_KEY);
  publicKey = wallet.publicKey;
  const marketplace = await Marketplace.deploy(publicKey);
  const agoraToken = await AgoraToken.deploy();
  const simpleSeller = await SimpleSeller.deploy();
  const simpleAuction = await SimpleAuction.deploy();

  console.log("deploying...")
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
  await marketplace.addContract(simpleAuction.address,"Simple Auction");
  const owner = marketplace.owner();
  await marketplace.addAdmin(owner);
  await marketplace.addAdmin(wallet.address);

  await simpleSeller.joinMarketplace(marketplace.address);
  await simpleAuction.joinMarketplace(marketplace.address);
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