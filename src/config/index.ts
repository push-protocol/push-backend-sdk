import dotenv from 'dotenv';
const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  /**
   * Web3 Related
   */
  etherscanAPI: process.env.ETHERSCAN_API,

  infuraAPI: {
    projectID: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  },

  alchemyAPI: process.env.ALCHEMY_API,

  web3MainnetProvider: process.env.MAINNET_WEB3_PROVIDER,
  web3MainnetNetwork: process.env.MAINNET_WEB3_NETWORK,
  web3MainnetSocket: process.env.MAINNET_WEB3_SOCKET,

  web3RopstenProvider: process.env.ROPSTEN_WEB3_PROVIDER,
  web3RopstenNetwork: process.env.ROPSTEN_WEB3_NETWORK,
  web3RopstenSocket: process.env.ROPSTEN_WEB3_SOCKET,

  web3KovanProvider: process.env.KOVAN_WEB3_PROVIDER,
  web3KovanNetwork: process.env.KOVAN_WEB3_NETWORK,
  web3KovanSocket: process.env.KOVAN_WEB3_SOCKET,

  /**
   * EPNS Related
   */
  deployedContract: process.env.EPNS_DEPLOYED_CONTRACT,
  deployedContractABI: require('./epns_contract.json'),
};
