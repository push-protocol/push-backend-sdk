"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var axios_1 = require("./config/axios");
exports.default = {
    sendOffchainNotification: function (signingContract, payload, channelPrivateKey, recipientAddr, channelAddress) { return __awaiter(void 0, void 0, void 0, function () {
        var chainId, verifyingContract, wallet, DOMAIN, TYPE, MESSAGE, signature, backendPayload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, signingContract.contract.chainID()];
                case 1:
                    chainId = (_a.sent()).toString();
                    verifyingContract = signingContract.contract.address;
                    wallet = new ethers_1.ethers.Wallet(channelPrivateKey);
                    DOMAIN = {
                        name: 'EPNS COMM V1',
                        chainId: 1,
                        verifyingContract: verifyingContract
                    };
                    TYPE = {
                        Data: [
                            { name: "acta", type: "string" },
                            { name: "aimg", type: "string" },
                            { name: "amsg", type: "string" },
                            { name: "asub", type: "string" },
                            { name: "type", type: "string" },
                            { name: "secret", type: "string" },
                        ],
                    };
                    MESSAGE = __assign({}, payload.data);
                    return [4 /*yield*/, wallet._signTypedData(DOMAIN, TYPE, MESSAGE)];
                case 2:
                    signature = _a.sent();
                    backendPayload = {
                        channel: channelAddress,
                        recipient: recipientAddr,
                        signature: signature,
                        type: MESSAGE.type,
                        deployedContract: verifyingContract,
                        chainId: chainId,
                        payload: payload,
                        op: 'write'
                    };
                    return [2 /*return*/, (0, axios_1.postReq)('/payloads/add_manual_payload', __assign({}, backendPayload))
                            .then(function (_a) {
                            var data = _a.data;
                            return data;
                        })
                            .catch(function (err) {
                            return err.message;
                        })
                        // make api request
                    ];
            }
        });
    }); },
    // Upload to IPFS
    uploadToIPFS: function (payload, logger, ipfsGateway, simulate) { return __awaiter(void 0, void 0, void 0, function () {
        var enableLogs;
        return __generator(this, function (_a) {
            enableLogs = 1;
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
                    var jsonizedPayload, create, ipfsLocal, ipfsInfura, ipfsURL, ipfs, ipfsUpload, cid, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (simulate &&
                                    (typeof simulate == 'boolean' ||
                                        (simulate &&
                                            typeof simulate == 'object' &&
                                            simulate.hasOwnProperty('payloadMode') &&
                                            simulate.payloadMode == 'Simulated'))) {
                                    logger.verbose('######## SIMULATED IPFS PAYLOAD ########');
                                    logger.simulate('\n%o\n', payload);
                                    logger.verbose('################################');
                                    resolve('[SimulatedIPFSHash]');
                                    // nothing to do in simulation
                                    return [2 /*return*/];
                                }
                                jsonizedPayload = JSON.stringify(payload);
                                create = require('ipfs-http-client').create;
                                ipfsLocal = '/ip4/0.0.0.0/tcp/5001';
                                ipfsInfura = 'https://ipfs.infura.io:5001';
                                ipfsURL = ipfsGateway ? ipfsGateway : (ipfsLocal ? ipfsLocal : ipfsInfura);
                                try {
                                    ipfs = create(ipfsURL);
                                }
                                catch (err) {
                                    //eg: when url = abcd (invalid)
                                    if (enableLogs)
                                        logger.info("[" + new Date(Date.now()) + "]- Couldn't connect to ipfs url: %o | Error: %o ", ipfsURL, err);
                                    ipfsURL = ipfsInfura;
                                    ipfs = create(ipfsURL);
                                    if (enableLogs)
                                        logger.info("[" + new Date(Date.now()) + "]-Switching to : %o ", ipfsURL);
                                }
                                ipfsUpload = function () { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, ipfs
                                                    .add(jsonizedPayload)
                                                    .then(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                if (enableLogs)
                                                                    logger.info("[" + new Date(Date.now()) + "]-Success --> uploadToIPFS(): %o ", data);
                                                                if (enableLogs)
                                                                    logger.info("[" + new Date(Date.now()) + "] - \uD83D\uDE80 CID: %o", data.cid.toString());
                                                                return [4 /*yield*/, ipfs.pin.add(data.cid)
                                                                        .then(function (pinCid) {
                                                                        if (enableLogs)
                                                                            logger.info("[" + new Date(Date.now()) + "]- \uD83D\uDE80 pinCid: %o", pinCid.toString());
                                                                        resolve(pinCid.toString());
                                                                    })
                                                                        .catch(function (err) {
                                                                        if (enableLogs)
                                                                            logger.error("[" + new Date(Date.now()) + "]-!!!Error --> ipfs.pin.add(): %o", err);
                                                                        reject(err);
                                                                    })];
                                                            case 1:
                                                                _a.sent();
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); })
                                                    .catch(function (err) { return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                //eg: when url = /ip4/0.0.0.0/tcp/5001 and local ipfs node is not running
                                                                if (enableLogs)
                                                                    logger.info("[" + new Date(Date.now()) + "]- Couldn't connect to ipfs url: %o | ipfs.add() error: %o", ipfsURL, err);
                                                                if (!(ipfsURL !== ipfsInfura)) return [3 /*break*/, 2];
                                                                ipfsURL = ipfsInfura;
                                                                ipfs = create(ipfsURL);
                                                                if (enableLogs)
                                                                    logger.info("[" + new Date(Date.now()) + "]-Switching to : %o ", ipfsURL);
                                                                return [4 /*yield*/, ipfsUpload()
                                                                        .then(function (cid) {
                                                                        resolve(cid);
                                                                    })
                                                                        .catch(function (err) {
                                                                        if (enableLogs)
                                                                            logger.error("[" + new Date(Date.now()) + "]-!!!Error --> ipfsUpload(): %o", err);
                                                                        reject(err);
                                                                    })];
                                                            case 1:
                                                                _a.sent();
                                                                return [3 /*break*/, 3];
                                                            case 2:
                                                                reject(err);
                                                                _a.label = 3;
                                                            case 3: return [2 /*return*/];
                                                        }
                                                    });
                                                }); })];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, ipfsUpload()];
                            case 2:
                                cid = _a.sent();
                                resolve(cid);
                                return [3 /*break*/, 4];
                            case 3:
                                err_1 = _a.sent();
                                if (enableLogs)
                                    logger.error("[" + new Date(Date.now()) + "]-!!!Error --> ipfsUpload(): %o", err_1);
                                reject(err_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    }); },
    // Get Interactable Contracts
    getInteractableContracts: function (network, apiKeys, walletPK, deployedContract, deployedContractABI) {
        var enableLogs = 0;
        var provider = ethers_1.ethers.getDefaultProvider(network, {
            etherscan: apiKeys.etherscanAPI ? apiKeys.etherscanAPI : null,
            infura: apiKeys.infuraAPI
                ? { projectId: apiKeys.infuraAPI.projectID, projectSecret: apiKeys.infuraAPI.projectSecret }
                : null,
            alchemy: apiKeys.alchemyAPI ? apiKeys.alchemyAPI : null,
            quorum: 1
        });
        var contract = new ethers_1.ethers.Contract(deployedContract, deployedContractABI, provider);
        var contractWithSigner = null;
        if (walletPK) {
            var wallet = new ethers_1.ethers.Wallet(walletPK, provider);
            contractWithSigner = contract.connect(wallet);
        }
        return {
            provider: provider,
            contract: contract,
            signingContract: contractWithSigner,
        };
    },
    // Send Notification to EPNS Contract
    sendNotification: function (signingContract, channel, recipientAddr, notificationType, notificationStorageType, notificationStoragePointer, waitForTx, logger, simulate) { return __awaiter(void 0, void 0, void 0, function () {
        var enableLogs;
        return __generator(this, function (_a) {
            enableLogs = 1;
            // SIMULATE OBJECT CHECK
            if (simulate && typeof simulate == 'object' && simulate.hasOwnProperty('txOverride') && simulate.txOverride.mode) {
                if (simulate.txOverride.hasOwnProperty('recipientAddr'))
                    recipientAddr = simulate.txOverride.recipientAddr;
                if (simulate.txOverride.hasOwnProperty('notificationType'))
                    notificationType = simulate.txOverride.notificationType;
                if (simulate.txOverride.hasOwnProperty('notificationStorageType'))
                    notificationStorageType = simulate.txOverride.notificationStorageType;
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    // Create Transaction
                    var identity = notificationType + '+' + notificationStoragePointer;
                    var identityBytes = ethers_1.ethers.utils.toUtf8Bytes(identity);
                    // Ensure Backward Compatibility
                    if (simulate &&
                        (typeof simulate == 'boolean' ||
                            (typeof simulate == 'object' && simulate.hasOwnProperty('txMode') && simulate.txMode == 'Simulated'))) {
                        // Log the notification out
                        var txSimulated = {
                            recipientAddr: recipientAddr,
                            notificationType: notificationType,
                            notificationStoragePointer: notificationStoragePointer,
                            pushType: 1,
                            hash: 'SimulatedTransaction!!!',
                        };
                        logger.debug('######## SIMULATED TRANSACTION ########');
                        logger.debug('\n%o\n', txSimulated);
                        logger.debug('################################');
                        resolve(txSimulated);
                        // nothing to do in simulation
                        return;
                    }
                    var txPromise = signingContract.sendNotification(channel, recipientAddr, identityBytes);
                    txPromise
                        .then(function (tx) {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (enableLogs)
                                            logger.info('Transaction sent: %o', tx);
                                        if (!waitForTx) return [3 /*break*/, 2];
                                        return [4 /*yield*/, tx.wait(waitForTx)];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        if (enableLogs)
                                            logger.info('Transaction mined: %o | Notification Sent', tx.hash);
                                        resolve(tx);
                                        return [2 /*return*/];
                                }
                            });
                        });
                    })
                        .catch(function (err) {
                        if (enableLogs)
                            logger.error('Unable to complete transaction, error: %o', err);
                        reject("Unable to complete transaction, error: " + err);
                    });
                })];
        });
    }); },
    // Prepare Payload for Notification
    preparePayload: function (recipientAddr, payloadType, title, body, payloadTitle, payloadMsg, payloadCTA, payloadImg) { return __awaiter(void 0, void 0, void 0, function () {
        var enableLogs;
        return __generator(this, function (_a) {
            enableLogs = 0;
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var ntitle = title.toString();
                    var nbody = body.toString();
                    var dtype = payloadType.toString();
                    var dsecret = '';
                    var dsub = payloadTitle ? payloadTitle.toString() : '';
                    var dmsg = payloadMsg ? payloadMsg.toString() : '';
                    var dcta = payloadCTA ? payloadCTA.toString() : '';
                    var dimg = payloadImg ? payloadImg.toString() : '';
                    var payload = {
                        notification: {
                            title: ntitle,
                            body: nbody,
                        },
                        data: {
                            type: dtype,
                            secret: dsecret,
                            asub: dsub,
                            amsg: dmsg,
                            acta: dcta,
                            aimg: dimg,
                        },
                    };
                    resolve(payload);
                })];
        });
    }); },
};
