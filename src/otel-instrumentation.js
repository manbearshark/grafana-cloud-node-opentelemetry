const opentelemetry = require("@opentelemetry/api");
const { resourceFromAttributes, emptyResource, defaultResource } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-proto");
const { MeterProvider, PeriodicExportingMetricReader, AggregationTemporality } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { LoggerProvider, BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { logs, SeverityNumber } = require('@opentelemetry/api-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');

const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT; // TODO: Provide your managed URL here

// ===== GENERAL SETUP =====

registerInstrumentations({
  instrumentations: [ getNodeAutoInstrumentations() ],
});

const resource =
  defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "js-agent",
      [ATTR_SERVICE_VERSION]: "0.1.0",
    }));


// ===== TRACING SETUP =====

const exporter = new OTLPTraceExporter({
    url: OTEL_ENDPOINT + '/v1/traces',
    //headers: { Authorization: 'Api-Token ' + DT_API_TOKEN }
});

const processor = new BatchSpanProcessor(exporter);

const provider = new NodeTracerProvider({
    resource: resource,
    spanProcessors: [ processor ]
});

provider.register();


// ===== METRIC SETUP =====

const metricExporter = new OTLPMetricExporter({
    url: OTEL_ENDPOINT + '/v1/metrics',
    //headers: { Authorization: 'Api-Token ' + DT_API_TOKEN },
    //temporalityPreference: AggregationTemporality.DELTA
});

const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 3000
});

const meterProvider = new MeterProvider({
    resource: resource,
    readers: [ metricReader ]
});

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

// ===== LOGGING SETUP =====
const collectorOptions = {
  url: OTEL_ENDPOINT + '/v1/logs', // url is optional and can be omitted - default is http://localhost:4318/v1/logs
  concurrencyLimit: 1, // an optional limit on pending requests
};

const logExporter = new OTLPLogExporter(collectorOptions);
const loggerProvider = new LoggerProvider({
  processors: [new BatchLogRecordProcessor(logExporter)]
});

logs.setGlobalLoggerProvider(loggerProvider);