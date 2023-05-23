# GSUc Rate Providers for Balancer Metastable Pools

This repository contains adaptors which provide accurate values of tokens to be used in the Balancer Protocol V2 metastable pools, along with their tests, configuration, and deployment information.

## Build and Test

On the project root, run:

```shell
yarn # install all dependencies
yarn test # run all tests
```

## Deploy
```shell
npx hardhat run scripts/deploy.ts
```

## Licensing

Most of the Solidity source code is licensed under the GNU General Public License Version 3 (GPL v3): see [`LICENSE`](./LICENSE).