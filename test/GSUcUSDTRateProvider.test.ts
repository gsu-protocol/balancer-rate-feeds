import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("GSUcUSDTRateProvider", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContracts() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const rate = ethers.utils.parseEther("1.001");

    const OSM = await ethers.getContractFactory("OSM");
    const MedianMock = await ethers.getContractFactory("MedianMock");
    const GSUcUSDTRateProvider = await ethers.getContractFactory("GSUcUSDTRateProvider");
    const medianMock = await MedianMock.deploy();
    const osm = await OSM.deploy(medianMock.address);
    const gsuUsdtRateProvider = await GSUcUSDTRateProvider.deploy(osm.address);

    // Setting up osm

    // osm contract can read values from median 
    await medianMock["kiss(address)"](osm.address);
    await medianMock.poke(rate);
    await osm.step(1); // setting osm delay to 1 sec
    await osm.poke();

    return { osm, gsuUsdtRateProvider, medianMock, rate, owner, otherAccount };
  }

  describe("Configurations", function () {
    it("Should set the right configurations", async function () {
      const { osm, gsuUsdtRateProvider, medianMock, rate, owner } = await loadFixture(deployContracts);

      expect(await gsuUsdtRateProvider.osm()).to.equal(osm.address);
      expect(await gsuUsdtRateProvider.osm_delay()).to.equal(true);
      expect(await gsuUsdtRateProvider.owner()).to.equal(owner.address);
    });

    it("Owner can enable/disable osm_delay", async function () {
      const { gsuUsdtRateProvider, otherAccount } = await loadFixture(deployContracts);
      await expect(gsuUsdtRateProvider.connect(otherAccount).setOSMDelay(false)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      await gsuUsdtRateProvider.setOSMDelay(false);
      expect(await gsuUsdtRateProvider.osm_delay()).to.equal(false);
    });
  });

  describe("RateFeeds", async function () {

    it("RateFeed contract should not be able to get rate when not whitelisted", async function () {
      const { gsuUsdtRateProvider } = await loadFixture(deployContracts);
      await expect(gsuUsdtRateProvider.getRate()).to.be.revertedWith(
        "OSM/contract-not-whitelisted"
      );
    });

    describe("RateFeed contract should be able to get rate when whitelisted", async function () {

      it("Without osm_dealy", async function () {
        const { gsuUsdtRateProvider, osm, medianMock } = await loadFixture(deployContracts);
        await gsuUsdtRateProvider.setOSMDelay(false);

        const updatedRate = ethers.utils.parseEther("2");
        await medianMock.poke(updatedRate);
        await osm["kiss(address)"](gsuUsdtRateProvider.address);
        await osm.poke()

        //with 1 poke should reflect latest rate
        expect(await gsuUsdtRateProvider.getRate()).to.equal(updatedRate);
      })

      it("With osm_dealy", async function () {
        const { gsuUsdtRateProvider, osm, medianMock, rate } = await loadFixture(deployContracts);

        const updatedRate = ethers.utils.parseEther("2");
        await medianMock.poke(updatedRate);

        await osm.step(10); // setting osm delay to 10 sec
        await osm["kiss(address)"](gsuUsdtRateProvider.address);

        await time.increaseTo((await time.latest()) + 10);
        await osm.poke()

        //with 1 poke should still reflect the old rate
        expect(await gsuUsdtRateProvider.getRate()).to.equal(rate);

        await expect(osm.poke()).to.be.revertedWith("OSM/not-passed");

        await time.increaseTo((await time.latest()) + 10);
        await osm.poke()

        //with 2nd poke should reflect latest rate
        expect(await gsuUsdtRateProvider.getRate()).to.equal(updatedRate);
      })
    });
  });
});
