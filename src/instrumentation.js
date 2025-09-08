/*instrumentation.js*/
// Require dependencies
const opentelemetry = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
//const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');

const {
    OTLPMetricExporter,
  } = require('@opentelemetry/exporter-metrics-otlp-proto');
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require('@opentelemetry/sdk-metrics');

const sdk = new NodeSDK({
  //traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTLP_METRIC_EXPORTER_URL || 'http://localhost:4318/v1/metrics', // Default to localhost if env variable is not set
      headers: {
        'Content-Type': 'application/x-protobuf',
      },
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
console.log('Starting OpenTelemetry SDK...');
sdk.start();
