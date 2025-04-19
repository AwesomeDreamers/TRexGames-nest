import { formatInTimeZone } from 'date-fns-tz';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as winstonDaily from 'winston-daily-rotate-file';

const env = process.env.NODE_ENV;

const apeendTimestamp = winston.format((info, opts: { tz: string }) => {
  if (opts.tz) {
    info.timestamp = formatInTimeZone(
      new Date(),
      opts.tz,
      'yyyy-MM-dd HH:mm:ss',
    );
  }
  return info;
});

const dailyOptions = {
  level: 'http',
  datePattern: 'YYYY-MM-DD',
  dirname: __dirname + '/../../../logs',
  filename: `${process.env.PROJECT_NAME}.log.%DATE%`,
  maxFiles: 30,
  zippedArchive: true,
  colorize: false,
  handleExceptions: true,
  json: false,
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === 'production' ? 'http' : 'silly',
      format:
        env === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp(),
              utilities.format.nestLike(process.env.APP_NAME, {
                prettyPrint: true,
              }),
            ),
    }),
    new winstonDaily(dailyOptions),
  ],
  format: winston.format.combine(
    apeendTimestamp({ tz: 'Asia/Seoul' }),
    winston.format.json(),
    winston.format.printf((info) => {
      return `${info.timestamp} - ${info.level} [${process.pid}] : ${info.message}`;
    }),
  ),
});
