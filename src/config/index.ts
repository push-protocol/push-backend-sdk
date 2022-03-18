export default {
  /**
   * EPNS Related
   */
  // addresses for the core contract
  coreNetwork: "1",
  coreContractAddress: '0x66329Fdd4042928BfCAB60b179e1538D56eeeeeE',
  coreContractABI: require('../data/epns_contract.json'),
  // addresses for the communicator contract
  communicatorContractAddress: {
    1: "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa",
    42: "0x87da9Af1899ad477C67FeA31ce89c1d2435c77DC",
    80001: "0xD2ee1e96e3592d5945dDc1808834d7EE67400823",
    137: "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa"
  },
  communicatorContractABI: require('../data/epns_communicator.json')
};
