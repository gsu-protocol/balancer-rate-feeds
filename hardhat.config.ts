import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    goerli: {
      gasPrice: 200000000000,
      url: `https://goerli.block360.io/https`,
      accounts: ['a7edf98d7406537a9850db2a4cdb64f2146ceea1a6f23bf5ef05a5dd3543cfa1']
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.5.12",
      },
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
