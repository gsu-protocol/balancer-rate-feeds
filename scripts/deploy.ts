import { ethers } from "hardhat";

async function main() {
  const osm = "0xD33bf7c2983f51dBC4abbF21850fA76d652329C8";

  const GSUcUSDTRateProvider = await ethers.getContractFactory("GSUcUSDTRateProvider");
  const gsuUsdtRateProvider = await GSUcUSDTRateProvider.deploy(osm);
  await gsuUsdtRateProvider.deployed();

  console.log(
    `GSUcUSDTRateProvider deployed to ${gsuUsdtRateProvider.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
