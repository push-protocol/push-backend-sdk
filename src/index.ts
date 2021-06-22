import epnsNotify from './epnsNotifyHelper';
import { ethers } from 'ethers';
import logger from './logger';

function getEPNSInteractableContract(epnsSettings: EPNSSettings, channelKey: string, etherscan: string | undefined, alchemy: string | undefined, infura: InfuraSettings | undefined) {
  // Get Contract
  return epnsNotify.getInteractableContracts(
    epnsSettings.network, // Network for which the interactable contract is req
    {
      // API Keys
      etherscanAPI: etherscan,
      infuraAPI: infura,
      alchemyAPI: alchemy,
    },
    channelKey, // Private Key of the Wallet sending Notification
    epnsSettings.contractAddress, // The contract address which is going to be used
    epnsSettings.contractABI, // The contract abi which is going to be useds
  );
}

export interface InfuraSettings {
  projectID: string;
  projectSecret: string;
}

export interface NetWorkSettings {
  alchemy?: string;
  infura?: InfuraSettings;
  etherscan?: string;
}

export interface EPNSSettings {
  network: string;
  contractAddress: string;
  contractABI: string;
}

export default class NotificationHelper {
  private channelKey: string;
  private web3network: string;
  private network: NetWorkSettings;
  private epnsSettings: EPNSSettings;
  private epns;
  // private infura: InfuraSettings
  // private alchemy: string;
  // private etherscan: string;
  /**
   *
   * @param web3network Network
   * @param channelKey Channel private key
   * @param epnsSettings Network of epns contract
   */
  constructor(web3network: string, channelKey: string, network: NetWorkSettings, epnsSettings: EPNSSettings) {
    this.channelKey = channelKey;
    this.web3network = web3network;
    this.epnsSettings = epnsSettings;
    this.network = network;
    // if (network.alchemy) this.alchemy = network.alchemy
    // if (network.infura) this.infura = network.infura
    if (!network.alchemy && !network.infura) {
      throw new Error('Initialize using an alchemy key or Infura parameters');
    }
    this.epns = getEPNSInteractableContract(epnsSettings, channelKey, network.etherscan, network.alchemy, network.infura);
  }

  public advanced = epnsNotify;

  /**
   * Get Subscribed Users
   * @description gets users subscribed to a channel
   * @returns
   */
  async getSubscribedUsers() {
    const channelAddress = ethers.utils.computeAddress(this.channelKey);
    const channelInfo = await this.epns.contract.channels(channelAddress);
    const filter = this.epns.contract.filters.Subscribe(channelAddress);
    let startBlock = channelInfo.channelStartBlock.toNumber();

    //Function to get all the addresses in the channel
    const eventLog = await this.epns.contract.queryFilter(filter, startBlock);
    const users = eventLog.map((log: any) => log.args.user);
    return users;
  }

  async getContract(address: string, abi: string) {
    return epnsNotify.getInteractableContracts(
      this.web3network, // Network for which the interactable contract is req
      {
        // API Keys
        etherscanAPI: this.network.etherscan,
        infuraAPI: this.network.infura,
        alchemyAPI: this.network.alchemy,
      },
      null, // Private Key of the Wallet sending Notification
      address, // The contract address which is going to be used
      abi, // The contract abi which is going to be useds
    );
  }

  /**
   * Send Notification
   * @description Sends notification to a particular user
   * @param channelKey Channel Private key
   * @param user User Address
   * @param title Title of Notification
   * @param message Message of Notification
   * @param payloadTitle Internal Title
   * @param payloadMsg Internal Message
   */
  public async sendNotification(
    user: string,
    title: string,
    message: string,
    payloadTitle: string,
    payloadMsg: string,
    notificationType: number,
    simulate: boolean | Object,
  ) {
    const hash = await this.getPayloadHash(user, title, message, payloadTitle, payloadMsg, notificationType, simulate);
    // Send notification
    const ipfshash = hash.ipfshash;
    const payloadType = hash.payloadType;

    const storageType = 1; // IPFS Storage Type
    const txConfirmWait = 1; // Wait for 0 tx confirmation

    const tx = await epnsNotify.sendNotification(
      this.epns.signingContract, // Contract connected to signing wallet
      user, // Recipient to which the payload should be sent
      payloadType, // Notification Type
      storageType, // Notificattion Storage Type
      ipfshash, // Notification Storage Pointer
      txConfirmWait, // Should wait for transaction confirmation
      logger, // Logger instance (or console.log) to pass
      simulate,
    );
    return tx;
  }

  /**
   * Get Payload Hash
   * @description Gets IPFS payload hash after upload
   * @param user User Address
   * @param title Title of Notification
   * @param message Message of Notification
   * @param payloadTitle Internal Title
   * @param payloadMsg Internal Message
   * @returns
   */
  private async getPayloadHash(
    user: string,
    title: string,
    message: string,
    payloadTitle: string,
    payloadMsg: string,
    notificationType: number,
    simulate: boolean | Object,
  ) {
    const payload: any = await this.getPayload(title, message, payloadTitle, payloadMsg, notificationType);
    const ipfshash = await epnsNotify.uploadToIPFS(payload, logger, null, simulate);
    // Sign the transaction and send it to chain
    return {
      success: true,
      user,
      ipfshash,
      payloadType: parseInt(payload.data.type),
    };
  }

  /**
   * Get Liquidity Payload
   * @description Gets IPFS payload hash after upload
   * @param title Title of Notification
   * @param message Message of Notification
   * @param payloadTitle Internal Title
   * @param payloadMsg Internal Message
   * @returns
   */
  private async getPayload(title: string, message: string, payloadTitle: string, payloadMsg: string, notificationType: number) {
    return epnsNotify.preparePayload(
      null, // Recipient Address | Useful for encryption
      notificationType, // Type of Notification
      title, // Title of Notification
      message, // Message of Notification
      payloadTitle, // Internal Title
      payloadMsg, // Internal Message
      null, // Internal Call to Action Link
      null, // internal img of youtube link
    );
  }
}
