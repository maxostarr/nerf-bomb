import { Data, Effect } from 'effect';
import { SerialPort } from 'serialport';

let port: SerialPort | null = null;

class PortCloseError extends Data.TaggedError('PortCloseError')<Error> {}
class PortOpenError extends Data.TaggedError('PortOpenError')<Error> {}
class PortWriteError extends Data.TaggedError('PortWriteError')<Error> {}

class PortNotConnectedError extends Data.TaggedError('PortNotConnectedError')<{
	message?: string;
}> {
	message: string = 'Port not connected';
}

const createNewSerialPort = (options: ConstructorParameters<typeof SerialPort>['0']) => {
	return Effect.async<SerialPort, PortOpenError>((resume) => {
		const newPort = new SerialPort(options, (err) => {
			if (err) {
				resume(Effect.fail(new PortOpenError(err)));
			} else {
				resume(Effect.succeed(newPort));
			}
		});
	}).pipe(Effect.withSpan('createNewSerialPort'));
};

const closePort = (port: SerialPort) => {
	return Effect.async<SerialPort, PortCloseError>((resume) => {
		port.close((err) => {
			if (err) {
				resume(Effect.fail(new PortCloseError(err)));
			} else {
				resume(Effect.succeed(port));
			}
		});
	}).pipe(Effect.withSpan('closePort'));
};

const openPort = (port: SerialPort) => {
	return Effect.async<SerialPort, PortOpenError>((resume) => {
		port.open((err) => {
			if (err) {
				resume(Effect.fail(new PortOpenError(err)));
			} else {
				resume(Effect.succeed(port));
			}
		});
	}).pipe(Effect.withSpan('openPort'));
};

const writeToPort = (port: SerialPort, data: string) => {
	return Effect.async<SerialPort, PortWriteError>((resume) => {
		port.write(data, (err) => {
			if (err) {
				resume(Effect.fail(new PortWriteError(err)));
			} else {
				resume(Effect.succeed(port));
			}
		});
	}).pipe(Effect.withSpan('writeToPort'));
};

export const connect = (path: string) =>
	Effect.gen(function* () {
		yield* Effect.log(`Connecting to port ${path}`);

		if (port && port.isOpen) {
			yield* closePort(port);
		}

		port = yield* createNewSerialPort({
			path,
			baudRate: 9600,
			autoOpen: true
		});

		return port;
	}).pipe(
		Effect.tapError((error) => Effect.logError(`Failed to connect to port ${path}: ${error}`)),
		Effect.withSpan('connect')
	);

export const write = (data: string) =>
	Effect.gen(function* () {
		yield* Effect.log(`Writing data: ${data}`);

		if (!port) {
			yield* Effect.log('Port not connected');
			return yield* Effect.fail(new PortNotConnectedError({}));
		}

		yield* writeToPort(port, data);
	}).pipe(
		Effect.tapError((error) => Effect.logError(`Failed to write data: ${error}`)),
		Effect.withSpan('write')
	);

export const listPorts = Effect.promise(() => SerialPort.list());

export const disconnect = Effect.gen(function* () {
	yield* Effect.log('Disconnecting port');

	if (!port) {
		yield* Effect.log('Port not connected');
		return yield* Effect.fail(new PortNotConnectedError({}));
	}

	yield* closePort(port);
}).pipe(
	Effect.tapError((error) => Effect.logError(`Failed to disconnect port: ${error}`)),
	Effect.withSpan('disconnect')
);

export const reconnect = Effect.gen(function* () {
	yield* Effect.log('Reconnecting port');

	if (!port) {
		yield* Effect.log('Port not connected');
		return yield* Effect.fail(new PortNotConnectedError({}));
	}

	yield* closePort(port);
	yield* openPort(port);
}).pipe(
	Effect.tapError((error) => Effect.logError(`Failed to reconnect port: ${error}`)),
	Effect.withSpan('reconnect')
);
