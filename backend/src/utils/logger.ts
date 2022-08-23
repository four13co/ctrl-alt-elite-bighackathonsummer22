import config from 'config';
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import WinstonCloudWatch from 'winston-cloudwatch';

// logs dir
const logDir: string = path.join(__dirname, config.get('log.dir'));

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
let logger: winston.Logger;
if (process.env.CLOUDWATCH_ACCESS_KEY_ID && process.env.CLOUDWATCH_SECRET_ACCESS_KEY) {
  logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        //timestamp: true,
        //colorize: true,
      }),
    ],
  });

  const cloudwatchConfig = {
    name: 'cloudwatch config dummy name',
    logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
    logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
    awsAccessKeyId: process.env.CLOUDWATCH_ACCESS_KEY_ID,
    awsSecretKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
    awsRegion: process.env.CLOUDWATCH_REGION,
    messageFormatter: ({ level, message, additionalInfo }) => `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`,
  };

  logger.add(new WinstonCloudWatch(cloudwatchConfig));
} else {
  logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      logFormat,
    ),
    transports: [
      // debug log setting
      new winstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/debug', // log file /logs/debug/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        json: false,
        zippedArchive: true,
      }),
      // error log setting
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error', // log file /logs/error/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        handleExceptions: true,
        json: false,
        zippedArchive: true,
      }),
    ],
  });

  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.splat(), winston.format.colorize()),
    }),
  );
}

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
