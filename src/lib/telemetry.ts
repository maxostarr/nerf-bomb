import { NodeSdk } from '@effect/opentelemetry';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export const NodeSdkLive = NodeSdk.layer(() => ({
	resource: { serviceName: 'example' },

	spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter())
}));
