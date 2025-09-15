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

const DT_API_URL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT; // TODO: Provide your managed URL here
const DT_API_TOKEN = ''; // TODO: Provide the OpenTelemetry-scoped access token here

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
    url: DT_API_URL + '/v1/traces',
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
    url: DT_API_URL + '/v1/metrics',
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