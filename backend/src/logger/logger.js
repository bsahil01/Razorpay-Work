import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp: ts }) => {
	return `[${level.toUpperCase()}] [${ts}] ${message}`;
});

const logger = winston.createLogger({
	level: 'debug',
	format: combine(timestamp(), myFormat),
	transports: [new winston.transports.Console()],
});

export default logger;
