import { createLogger, format, transports } from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';
import { resolve } from 'path';

const { Console } = transports;
const { combine, timestamp, printf, json, colorize } = format;

const consoleFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [GScrap] ${level}: ${message}`;
})

const logTxtPath = resolve(process.cwd(), './logs/logs-%DATE%.txt');
const logNdjsonPath = resolve(process.cwd(), 'logs/logs-%DATE%.ndjson');

export const logger = createLogger({
  level: 'info',
  transports: [
    new Console({ 
      format: combine(colorize(), timestamp(), consoleFormat)
    }),
    new DailyRotateFile({ 
      filename: logTxtPath, 
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        consoleFormat
      ) 
    }),
    new DailyRotateFile({ 
      filename: logNdjsonPath, 
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        json({ space: 4 })
      ) 
    })
  ]
})