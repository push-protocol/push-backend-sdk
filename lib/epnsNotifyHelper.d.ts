import { ethers } from 'ethers';
declare const _default: {
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
export default _default;
