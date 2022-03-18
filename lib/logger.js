"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = __importDefault(require("winston"));
// import 'winston-daily-rotate-file';
var moment = require('moment'); // time library
var customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        simulate: 4,
        input: 5,
        saved: 6,
        verbose: 7,
        debug: 8,
        silly: 9,
    },
    colors: {
        info: 'green',
        simulate: 'white bold dim',
        input: 'inverse bold',
        saved: 'italic white',
        debug: 'yellow',
    },
};
var options = {
    file: {
        level: 'verbose',
        filename: __dirname + "/../../logs/app.log",
        handleExceptions: true,
        json: true,
        maxSize: '5m',
        maxFiles: '5d',
        // colorize: true,
    },
};
var parser = function (param) {
    if (!param) {
        return '';
    }
    if (typeof param === 'string') {
        return param;
    }
    return Object.keys(param).length ? JSON.stringify(param, undefined, 2) : '';
};
var formatter = winston_1.default.format.combine(winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.printf(function (info) {
    var timestamp = info.timestamp, level = info.level, message = info.message, meta = info.meta;
    var ts = moment(timestamp).local().format('HH:MM:ss');
    var metaMsg = meta ? ": " + parser(meta) : '';
    return ts + " " + level + "    " + parser(message) + " " + metaMsg;
}), winston_1.default.format.colorize({
    all: true,
}));
// var transport = new winston.transports.DailyRotateFile(options.file);
// transport.on('rotate', function (oldFilename, newFilename) {
//   // do something fun
//   console.log('login rotated from: %o | %o', oldFilename, newFilename);
// });
var transports = [];
transports.push(new winston_1.default.transports.Console({
    format: formatter,
}));
var LoggerInstance = winston_1.default.createLogger({
    level: 'debug',
    levels: customLevels.levels,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    transports: transports,
});
winston_1.default.addColors(customLevels.colors);
exports.default = LoggerInstance;
