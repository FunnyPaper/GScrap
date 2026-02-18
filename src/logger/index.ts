import { createLogger, format, transports } from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';

const { Console } = transports;
const { combine, timestamp, printf, json, colorize, simple } = format;

const consoleFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [GScrap] ${level}: ${message}`;
})

export const logger = createLogger({
  level: 'info',
  transports: [
    new Console({ 
      format: combine(colorize(), timestamp(), consoleFormat)
    }),
    new DailyRotateFile({ 
      filename: 'logs/logs-%DATE%.txt', 
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
      filename: 'logs/logs-%DATE%.ndjson', 
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