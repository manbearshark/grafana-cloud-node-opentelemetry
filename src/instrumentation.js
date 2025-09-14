// instrumentation.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

//////////////////////////////////////////////////////////////////
// Set up the OpenTelemetry SDK with Node auto-instrumentations
// This file is loaded at runtime from the start command in package.json

const sdk = new NodeSDK({
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // Configure the OTLP endpoint of your OpenTelemetry Collector
      url: 'http://alloy:4318/v1/metrics', // Default OTLP HTTP endpoint for metrics
      headers: {}, // Optional: Add custom headers if needed
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()], // Auto-instrument common Node.js libraries
});

sdk.start();