const { expect } = require("chai");

describe("Marketplace", function () {

    let marketplace;
    describe("Deployment", async function () {
        beforeEach(async function ()  {
            accounts = await ethers.getSigners();
            const Marketplace = await ethers.getContractFactory("Marketplace");
            marketplace = await Marketplace.deploy();
        });

        it("Should have the correct owner", async function () {
            const addressOfOwnerOfMarketplace = await marketplace.owner();
            expect(addressOfOwnerOfMarketplace).to.equal(accounts[0].address);
            expect(addressOfOwnerOfMarketplace).to.not.equal(accounts[1].address);
        });
    });
});
