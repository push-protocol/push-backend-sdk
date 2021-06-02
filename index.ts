
import epnsNotify from './epnsNotifyHelper';
import config from './config';
import { ethers } from 'ethers';
import logger from './logger';


export interface InfuraSettings {
    projectID: string
    projectSecret: string
}

export interface NetWorkSettings {
    alchemy?: string,
    infura?: InfuraSettings,
    etherscan?: string
}

export class NotificationHelper {
    private channelKey;
    private web3network;
    private epns;
    private infura: InfuraSettings
    private alchemy;
    private etherscan;
    /**
     * 
     * @param web3network Network
     * @param channelKey Channel private key
     */
    constructor(web3network: string, channelKey: string, network: NetWorkSettings) {
        this.channelKey = channelKey;
        this.web3network = web3network;
        if (network.alchemy) this.alchemy = network.alchemy
        if (network.infura) this.infura = network.infura
        if (!this.alchemy && !this.infura) {
            throw new Error("Initialize using an alchemy key or Infura parameters")
        }
        this.epns = this.getEPNSInteractableContract(channelKey, this.etherscan, this.alchemy, this.infura);
    }

    public advanced = epnsNotify;



    /**
     * Get Subscribed Users
     * @description gets users subscribed to a channel
     * @returns 
     */
    async getSubscribedUsers () {
        const channelAddress = ethers.utils.computeAddress(this.channelKey);
        const channelInfo = await this.epns.contract.channels(channelAddress)
        const filter = this.epns.contract.filters.Subscribe(channelAddress)
        let startBlock = channelInfo.channelStartBlock.toNumber();

        //Function to get all the addresses in the channel
        const eventLog = await this.epns.contract.queryFilter(filter, startBlock)
        const users = eventLog.map(log => log.args.user)
        return users
    }

    async getContract(address: string, abi: string){
        return epnsNotify.getInteractableContracts(
            this.web3network,                                              // Network for which the interactable contract is req
            {                                                                        // API Keys
                etherscanAPI: config.etherscanAPI,
                infuraAPI: config.infuraAPI,
                alchemyAPI: config.alchemyAPI
            },
            null,            // Private Key of the Wallet sending Notification
            address,                                                                // The contract address which is going to be used
            abi                                                                     // The contract abi which is going to be useds
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
    async sendNotification (user: string, title: string, message: string, payloadTitle: string, payloadMsg: string, simulate: boolean | Object) {
        const hash = await this.getPayloadHash(user, title, message, payloadTitle, payloadMsg, simulate)
        // Send notification
        const ipfshash = hash.ipfshash;
        const payloadType = hash.payloadType;

        const storageType = 1; // IPFS Storage Type
        const txConfirmWait = 1; // Wait for 0 tx confirmation

        const tx = await epnsNotify.sendNotification(
            this.epns.signingContract,                                      // Contract connected to signing wallet
            user,                                                           // Recipient to which the payload should be sent
            payloadType,                                                    // Notification Type
            storageType,                                                    // Notificattion Storage Type
            ipfshash,                                                       // Notification Storage Pointer
            txConfirmWait,                                                  // Should wait for transaction confirmation
            logger,                                                            // Logger instance (or console.log) to pass
            simulate
        )
        return tx
    }

    private getEPNSInteractableContract(channelKey: string, etherscan: string, alchemy: string, infura: InfuraSettings) {
    // Get Contract
    return epnsNotify.getInteractableContracts(
        config.web3RopstenNetwork,                                              // Network for which the interactable contract is req
        {                                                                       // API Keys
            etherscanAPI: etherscan,
            infuraAPI: infura,
            alchemyAPI: alchemy
        },
        channelKey,            // Private Key of the Wallet sending Notification
        config.deployedContract,                                                // The contract address which is going to be used
        config.deployedContractABI                                              // The contract abi which is going to be useds
    );
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
    private async getPayloadHash (user: string, title: string, message: string, payloadTitle: string, payloadMsg: string, simulate: boolean | Object) {
        const payload = await this.getLiquidityPayload(title, message, payloadTitle, payloadMsg)
        const ipfshash = await epnsNotify.uploadToIPFS(payload, logger, simulate)
        // Sign the transaction and send it to chain
        return {
            success: true,
            user,
            ipfshash,
            payloadType: parseInt(payload.data.type)
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
    private async getLiquidityPayload (title: string, message: string, payloadTitle: string, payloadMsg: string) {
        return epnsNotify.preparePayload(
            null,                                                               // Recipient Address | Useful for encryption
            3,                                                                  // Type of Notification
            title,                                                              // Title of Notification
            message,                                                            // Message of Notification
            payloadTitle,                                                       // Internal Title
            payloadMsg,                                                         // Internal Message
            null,                                                               // Internal Call to Action Link
            null,                                                               // internal img of youtube link
        );
    }
}