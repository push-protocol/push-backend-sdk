"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("./config/axios");
var epnsNotifyHelper_1 = __importDefault(require("./epnsNotifyHelper"));
var ethers_1 = require("ethers");
var logger_1 = __importDefault(require("./logger"));
var config_1 = __importDefault(require("./config"));
function getEPNSInteractableContract(epnsSettings, channelKey, etherscan, alchemy, infura) {
    // Get Contract
    return epnsNotifyHelper_1.default.getInteractableContracts(epnsSettings.network, // Network for which the interactable contract is req
    {
        // API Keys
        etherscanAPI: etherscan,
        infuraAPI: infura,
        alchemyAPI: alchemy,
    }, channelKey, // Private Key of the Wallet sending Notification
    epnsSettings.contractAddress, // The contract address which is going to be used
    epnsSettings.contractABI);
}
var DEFAULT_NETWORK_SETTINGS = {};
var DEFAULT_NOTIFICATION_CHAIN = '1';
var DEFAULT_NETWORK_TO_MONITOR = '1';
var NotificationHelper = /** @class */ (function () {
    /**
     *
     * @param channelKey Channel private key
     * @param epnsSettings Network of epns contract
     */
    function NotificationHelper(channelKey, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.communicatorContractAddress, communicatorContractAddress = _c === void 0 ? '' : _c, _d = _b.communicatorContractABI, communicatorContractABI = _d === void 0 ? config_1.default.communicatorContractABI : _d, _e = _b.channelAddress, channelAddress = _e === void 0 ? '' : _e, _f = _b.networkKeys, networkKeys = _f === void 0 ? DEFAULT_NETWORK_SETTINGS : _f, _g = _b.notificationChainId, notificationChainId = _g === void 0 ? DEFAULT_NOTIFICATION_CHAIN : _g, _h = _b.networkToMonitor, networkToMonitor = _h === void 0 ? DEFAULT_NETWORK_TO_MONITOR : _h;
        this.advanced = epnsNotifyHelper_1.default;
        communicatorContractAddress =
            communicatorContractAddress || config_1.default.communicatorContractAddress[notificationChainId];
        this.channelKey = channelKey;
        this.networkToMonitor = networkToMonitor;
        this.channelAddress = channelAddress || ethers_1.ethers.utils.computeAddress(channelKey);
        this.network = networkKeys;
        this.epnsCommunicatorSettings = {
            network: notificationChainId,
            contractAddress: communicatorContractAddress,
            contractABI: communicatorContractABI,
        };
        if (networkKeys.alchemy || networkKeys.infura || networkKeys.etherscan) {
            this.epnsCommunicator = getEPNSInteractableContract(this.epnsCommunicatorSettings, channelKey, this.network.etherscan, this.network.alchemy, this.network.infura);
        }
    }
    /**
     * Get Subscribed Users
     * @description gets users subscribed to a channel
     * @returns
     */
    NotificationHelper.prototype.getSubscribedUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channelSubscribers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, axios_1.postReq)('/channels/get_subscribers', {
                            channel: this.channelAddress,
                            op: 'read',
                        })
                            .then(function (res) {
                            var subscribers = res.data.subscribers;
                            return subscribers;
                        })
                            .catch(function (err) {
                            console.log({ err: err });
                            return [];
                        })];
                    case 1:
                        channelSubscribers = _a.sent();
                        return [2 /*return*/, channelSubscribers];
                }
            });
        });
    };
    NotificationHelper.prototype.getContract = function (address, abi) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.epnsCommunicator) {
                    console.log('You didnt pass in your network keys, so your functionality with this contract will be limited');
                }
                return [2 /*return*/, epnsNotifyHelper_1.default.getInteractableContracts(this.networkToMonitor, // Network for which the interactable contract is req
                    {
                        // API Keys
                        etherscanAPI: this.network.etherscan,
                        infuraAPI: this.network.infura,
                        alchemyAPI: this.network.alchemy,
                    }, null, // Private Key of the Wallet sending Notification
                    address, // The contract address which is going to be used
                    abi)];
            });
        });
    };
    /**
     * Send Notification
     * @description Sends notification to a particular user
     * @param user User Address
     * @param title Title of Notification
     * @param message Message of Notification
     * @param payloadTitle Internal Title
     * @param payloadMsg Internal Message
     */
    NotificationHelper.prototype.sendNotification = function (user, title, message, payloadTitle, payloadMsg, notificationType, cta, img, simulate, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.offChain, offChain = _c === void 0 ? true : _c, _d = _b.returnPayload, returnPayload = _d === void 0 ? false : _d;
        return __awaiter(this, void 0, void 0, function () {
            var channelAddress, payload, offChainPayload, response, hash, ipfshash, payloadType, storageType, txConfirmWait, tx;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        channelAddress = this.channelAddress;
                        if (!offChain) return [3 /*break*/, 4];
                        if (simulate &&
                            typeof simulate == 'object' &&
                            simulate.hasOwnProperty('txOverride') &&
                            simulate.txOverride.mode) {
                            if (simulate.txOverride.hasOwnProperty('recipientAddr'))
                                user = simulate.txOverride.recipientAddr;
                            if (simulate.txOverride.hasOwnProperty('notificationType'))
                                notificationType = simulate.txOverride.notificationType;
                        }
                        return [4 /*yield*/, this.getPayload(title, message, payloadTitle, payloadMsg, notificationType, cta, img, null)];
                    case 1:
                        payload = _e.sent();
                        return [4 /*yield*/, epnsNotifyHelper_1.default.generateOffChainSignature(this.epnsCommunicatorSettings, payload, this.channelKey, user, channelAddress)];
                    case 2:
                        offChainPayload = _e.sent();
                        if (returnPayload)
                            return [2 /*return*/, offChainPayload];
                        return [4 /*yield*/, epnsNotifyHelper_1.default.sendOffchainNotification(offChainPayload)];
                    case 3:
                        response = _e.sent();
                        return [2 /*return*/, response];
                    case 4:
                        // if its not offchain, then require key parameters be passed in
                        if (!this.epnsCommunicator) {
                            throw new Error('Initialize using an alchemy key or Infura parameters or an etherscan keys when initialising the constructor');
                        }
                        return [4 /*yield*/, this.getPayloadHash(user, title, message, payloadTitle, payloadMsg, notificationType, cta, img, simulate)];
                    case 5:
                        hash = _e.sent();
                        ipfshash = hash.ipfshash;
                        payloadType = hash.payloadType;
                        storageType = 1;
                        txConfirmWait = 1;
                        return [4 /*yield*/, epnsNotifyHelper_1.default.sendNotification(this.epnsCommunicator.signingContract, // Contract connected to signing wallet
                            channelAddress, user, // Recipient to which the payload should be sent
                            payloadType, // Notification Type
                            storageType, // Notificattion Storage Type
                            ipfshash, // Notification Storage Pointer
                            txConfirmWait, // Should wait for transaction confirmation
                            logger_1.default, // Logger instance (or console.log) to pass
                            simulate)];
                    case 6:
                        tx = _e.sent();
                        return [2 /*return*/, tx];
                }
            });
        });
    };
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
    NotificationHelper.prototype.getPayloadHash = function (user, title, message, payloadTitle, payloadMsg, notificationType, cta, img, simulate) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, ipfshash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPayload(title, message, payloadTitle, payloadMsg, notificationType, cta, img, user)];
                    case 1:
                        payload = _a.sent();
                        return [4 /*yield*/, epnsNotifyHelper_1.default.uploadToIPFS(payload, logger_1.default, null, simulate)];
                    case 2:
                        ipfshash = _a.sent();
                        // Sign the transaction and send it to chain
                        return [2 /*return*/, {
                                success: true,
                                user: user,
                                ipfshash: ipfshash,
                                payloadType: parseInt(payload.data.type),
                            }];
                }
            });
        });
    };
    /**
     * Get Liquidity Payload
     * @description Gets IPFS payload hash after upload
     * @param title Title of Notification
     * @param message Message of Notification
     * @param payloadTitle Internal Title
     * @param payloadMsg Internal Message
     * @returns
     */
    NotificationHelper.prototype.getPayload = function (title, message, payloadTitle, payloadMsg, notificationType, cta, img, user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, epnsNotifyHelper_1.default.preparePayload(user, // Recipient Address | Useful for encryption
                    notificationType, // Type of Notification
                    title, // Title of Notification
                    message, // Message of Notification
                    payloadTitle, // Internal Title
                    payloadMsg, // Internal Message
                    cta, // Internal Call to Action Link
                    img)];
            });
        });
    };
    return NotificationHelper;
}());
exports.default = NotificationHelper;
