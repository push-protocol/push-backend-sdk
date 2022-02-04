import { ethers } from 'ethers';
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
export declare type NotificationNetworkType = "polygon" | "ropsten";
export default class NotificationHelper {
    private channelKey;
    private web3network;
    private network;
    private epnsSettings;
    private epnsCore;
    private channelAddress;
    private epnsCommunicator;
    /**
     *
     * @param web3network Network
     * @param channelKey Channel private key
     * @param epnsSettings Network of epns contract
     */
    constructor(web3network: string, channelKey: string, channelAddress: string, network: NetWorkSettings, epnsCoreSettings: EPNSSettings, epnsCommunicatorSettings: EPNSSettings);
    advanced: {
        sendOffchainNotification: (signingContract: any, payload: any, channelPrivateKey: any, recipientAddr: any, channelAddress: any) => Promise<any>;
        uploadToIPFS: (payload: any, logger: any, ipfsGateway: any, simulate: any) => Promise<unknown>;
        getInteractableContracts: (network: any, apiKeys: any, walletPK: any, deployedContract: any, deployedContractABI: any) => {
            provider: ethers.providers.BaseProvider;
            contract: ethers.Contract;
            signingContract: ethers.Contract | null;
        };
        sendNotification: (signingContract: any, channel: any, recipientAddr: any, notificationType: any, notificationStorageType: any, notificationStoragePointer: any, waitForTx: any, logger: any, simulate: any) => Promise<unknown>;
        preparePayload: (recipientAddr: any, payloadType: any, title: any, body: any, payloadTitle: any, payloadMsg: any, payloadCTA: any, payloadImg: any) => Promise<unknown>;
    };
    /**
     * Get Subscribed Users
     * @description gets users subscribed to a channel
     * @returns
     */
    getSubscribedUsers(): Promise<any>;
    getContract(address: string, abi: string): Promise<{
        provider: ethers.providers.BaseProvider;
        contract: ethers.Contract;
        signingContract: ethers.Contract | null;
    }>;
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
    sendNotification(user: string, title: string, message: string, payloadTitle: string, payloadMsg: string, notificationType: number, cta: string | undefined, img: string | undefined, simulate: any, { offChain }?: {
        offChain?: boolean | undefined;
    }): Promise<any>;
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
    private getPayloadHash;
    /**
     * Get Liquidity Payload
     * @description Gets IPFS payload hash after upload
     * @param title Title of Notification
     * @param message Message of Notification
     * @param payloadTitle Internal Title
     * @param payloadMsg Internal Message
     * @returns
     */
    private getPayload;
}
