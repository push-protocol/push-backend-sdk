# Backend SDK


## About

This module is used to send notifications to [EPNS](http://www.epns.io/) channels easy. It Provides an abstraction layer
above advanced internal EPNS notification functions.

It is written in typescript and requires node v10.0.0 or higher.
Most features will work with nodejs v6.0.0 and higher but using older versions than v10.0.0 is not recommended.



## Usage

```javascript
import epnsHelper, {InfuraSettings, NetWorkSettings, EPNSSettings} from '../helpers/notificationHelper'

// InfuraSettings contains setttings details on infura
const infuraSettings: InfuraSettings = {
  projectID: config.infuraAPI.projectID,
  projectSecret: config.infuraAPI.projectSecret
}

// Network settings contains details on alchemy, infura and etherscan
const settings: NetWorkSettings = {
  alchemy: config.alchemyAPI,
  infura: infuraSettings,
  etherscan: config.etherscanAPI
}

// EPNSSettings settings contains details on EPNS network, contract address and contract ABI
const epnsSettings: EPNSSettings = {
  network: config.web3RopstenNetwork,
  contractAddress: config.deployedContract,
  contractABI: config.deployedContractABI
}

// NB: Either one or both alchemy and infura has to be passed in to the sdk settings
// channelPrivateKey must begin with '0x'
const sdk = new epnsHelper(config.web3MainnetNetwork, channelPrivateKey, settings, epnsSettings)

// getSubscribedUsers gets all subscribed users to the EPNS channel passed in on initialisation
const users = await sdk.getSubscribedUsers();

// getContract returns an ethers contract representation of a deployed instance
const contract = await getContract(address, abi)

// send messages to a particular user (or simulate by passing a boolean)
await sendNotification(user, title, message, payloadTitle, payloadMsg, notificationType, simulate)
```

## Advanced usage

```javascript
import epnsHelper, {InfuraSettings, NetWorkSettings, EPNSSettings} from '../helpers/notificationHelper'

const sdk = new epnsHelper(config.web3MainnetNetwork, channelKey, settings)
```
