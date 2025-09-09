import pino from 'pino';

const __dirname = import.meta.dirname;

// Set up file logging and OTEL transport logger
const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: `${__dirname}/ecommerce-app.log` },
    },
    {
      target: 'pino/file', // logs to the standard output by default
    },
  ],
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);

export default logger;