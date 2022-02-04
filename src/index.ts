import {postReq} from './config/axios';
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

export type NotificationNetworkType = "polygon" | "ropsten";

export default class NotificationHelper {
  private channelKey: string;
  private web3network: string;
  private network: NetWorkSettings;
  private epnsSettings: EPNSSettings;
  private epnsCore;
  private channelAddress;
  private epnsCommunicator;
  // private infura: InfuraSettings
  // private alchemy: string;
  // private etherscan: string;
  /**
   *
   * @param web3network Network
   * @param channelKey Channel private key
   * @param epnsSettings Network of epns contract
   */
  constructor(web3network: string, channelKey: string, channelAddress: string, network: NetWorkSettings, epnsCoreSettings: EPNSSettings, epnsCommunicatorSettings: EPNSSettings) {
    this.channelKey = channelKey;
    this.web3network = web3network;
    this.epnsSettings = epnsCoreSettings;
    this.channelAddress = channelAddress;
    this.network = network;
    // if (network.alchemy) this.alchemy = network.alchemy
    // if (network.infura) this.infura = network.infura
    if (!network.alchemy && !network.infura) {
      throw new Error('Initialize using an alchemy key or Infura parameters');
    }
    this.epnsCore = getEPNSInteractableContract(epnsCoreSettings, channelKey, network.etherscan, network.alchemy, network.infura);
    this.epnsCommunicator = getEPNSInteractableContract(epnsCommunicatorSettings, channelKey, network.etherscan, network.alchemy, network.infura);
  }

  public advanced = epnsNotify;

  /**
   * Get Subscribed Users
   * @description gets users subscribed to a channel
   * @returns
   */
  async getSubscribedUsers() {
    const channelSubscribers = await postReq('/channels/get_subscribers',{
      "channel": this.channelAddress,
      "op": 'read'
    })
    .then((res:any) => {
      const { subscribers } = res.data;
      return subscribers;
    })
    .catch((err) => {
      console.log({err});
      return []
    })
    return channelSubscribers;
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
    cta: string | undefined,
    img: string | undefined,
    simulate: any,
    {offChain = false} = {} //add optional parameter for offchain sending of notification
  ) {
    const channelAddress = this.channelAddress;
    // check if offchain notification is enabled and send a different notification type
    if(offChain){
      if (simulate && typeof simulate == 'object' && simulate.hasOwnProperty('txOverride') && simulate.txOverride.mode) {
        if (simulate.txOverride.hasOwnProperty('recipientAddr')) user = simulate.txOverride.recipientAddr;
        if (simulate.txOverride.hasOwnProperty('notificationType'))
          notificationType = simulate.txOverride.notificationType;
      }
  
      const payload: any = await this.getPayload(title, message, payloadTitle, payloadMsg, notificationType, cta, img, null);
      const response = await epnsNotify.sendOffchainNotification(
        this.epnsCommunicator,
        payload,
        this.channelKey,
        user,
        channelAddress
      );
      return response;
    }
    const hash = await this.getPayloadHash(user, title, message, payloadTitle, payloadMsg, notificationType, cta, img,simulate);

    // Send notification
    const ipfshash = hash.ipfshash;
    const payloadType = hash.payloadType;

    const storageType = 1; // IPFS Storage Type
    const txConfirmWait = 1; // Wait for 0 tx confirmation

    //const channelAddress = ethers.utils.computeAddress(this.channelKey);
    console.log({channelAddress});
    const tx = await epnsNotify.sendNotification(
      this.epnsCommunicator.signingContract, // Contract connected to signing wallet
      channelAddress,
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
    cta: string|undefined,
    img: string|undefined,
    simulate: boolean | Object,
  ) {
    const payload: any = await this.getPayload(title, message, payloadTitle, payloadMsg, notificationType, cta, img, user);

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
  private async getPayload(title: string, message: string, payloadTitle: string, payloadMsg: string, notificationType: number, cta: string | undefined, img: string | undefined, user: string | null | undefined) {
    return epnsNotify.preparePayload(
      user, // Recipient Address | Useful for encryption
      notificationType, // Type of Notification
      title, // Title of Notification
      message, // Message of Notification
      payloadTitle, // Internal Title
      payloadMsg, // Internal Message
      cta, // Internal Call to Action Link
      img, // internal img of youtube link
    );
  }
}
