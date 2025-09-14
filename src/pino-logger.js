import pino from 'pino';
import pinoHTTP from 'pino-http';
import pinoOpenTelemetry from 'pino-opentelemetry-transport';

const __dirname = process.env.PINO_LOGS_DIRECTORY || import.meta.dirname;

// TODO:
// - Test with a debugger
// - Forward to OTEL via their config files

const transportOT = pinoOpenTelemetry({
    serviceInfo: {
        name: 'my-service',
        version: '1.0.0'
    },
    collectorOptions: {
        url: process.env.OTEL_GRPC_COLLECTOR_URL || 'http://alloy:4317/v1/logs',
        headers: {}
    },
    messageKey: 'msg',
    levelKey: 'severity'
});

const otelStreamEntry = {
    level: 'trace',
    write: (msg) => {
    if (transport.stream && typeof transport.stream.write === 'function') {
    transport.stream.write(msg);
    }
}};

// Custom serializers to unpack the req / res objects from Pino HTTP
// These are not compatible with OTEL standard logging

const reqSerializer = (req) => {
  
    return {
      "http.request.method": req.method,
      "url.scheme": req.protocol,
      "user_agent.original": req.headers["user-agent"],
    };
  };
  
  const resSerializer = (res) => {
    return {
      "http.response.status_code": res.statusCode,
    };
  };

// Set up file logging and OTEL transport logger
const transport = pino.transport({
  targets: [
    // {
    //     // Remove this block to stop logging to a local file
    //     target: 'pino/file',
    //     options: { destination: `${__dirname}/ecommerce-app.log` },
    // },
    {
        target: 'pino/file', // logs to the standard output by default - remove to get rid of console logging
    },
    // {
    //     target: 'pino-opentelemetry-transport',
    //     options: {
    //         severityNumberMap: {
    //         10: 1, // TRACE
    //         20: 5, // DEBUG
    //         30: 9, // INFO
    //         40: 13, // WARN
    //         50: 17, // ERROR
    //         60: 21, // FATAL
    //         // Custom mapping for a hypothetical 'alert' level
    //         70: 20 // ALERT (OpenTelemetry does not have a direct 'ALERT' level, so map to a suitable equivalent)
    //     }}
    // }
  ],
});

export const logger = pino(
    { level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime} ,
    transport
);

// Set up pino-http to handle res / req logging appropriately - can add more field mappings here if needed
export const http_logger_middleware = pinoHTTP({
    logger,
    // serializers: {
    //     req: reqSerializer,
    //     res: resSerializer,
    // },
    customLogLevel: (res) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
    if (res.statusCode >= 500) return "error";
    return "info";
    },
});