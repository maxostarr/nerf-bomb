import { command, query } from '$app/server';
import { Effect, Schema } from 'effect';
import { panSchema } from './audio';
import { connect, write } from './io';
import { playAudio } from './audio';
import { SerialPort } from 'serialport';

const panOn = {
	left: 'L',
	right: 'R'
} as const;

const panOff = {
	left: 'l',
	right: 'r'
} as const;

export const enableAndPlayAudio = command(Schema.standardSchemaV1(panSchema), async (pan) => {
	return Effect.runPromise(
		Effect.gen(function* () {
			yield* Effect.log(`Enabling pan ${pan}`);
			yield* write(panOn[pan]);
			yield* Effect.sleep('500 millis');
			yield* Effect.log(`Playing audio with pan ${pan}`);
			yield* playAudio(pan);
			yield* Effect.log(`Disabling pan ${pan}`);
			yield* write(panOff[pan]);
		})
	);
});

export const getSerialPorts = query(async () => {
	return Effect.runPromise(
		Effect.gen(function* () {
			yield* Effect.log(`Getting serial ports`);
			const ports = yield* Effect.promise(SerialPort.list);
			yield* Effect.log(`Found ${ports.length} serial ports`, ports);
			return ports;
		})
	);
});

export const connectToSerialPort = command(
	Schema.standardSchemaV1(Schema.String),
	async (portName) => {
		return Effect.runPromise(
			Effect.gen(function* () {
				yield* Effect.log(`Connecting to serial port ${portName}`);
				yield* connect(portName);
				yield* Effect.log(`Connected to serial port ${portName}`);
			})
		);
	}
);
