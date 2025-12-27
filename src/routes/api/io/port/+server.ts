import { connect } from '$lib/io';
import { json, type RequestHandler } from '@sveltejs/kit';
import { SerialPort } from 'serialport';
import { Effect } from 'effect';

export const GET: RequestHandler = async () => {
	const ports = await SerialPort.list();
	return json(ports);
};

export const POST: RequestHandler = async (request) => {
	const { path } = await request.request.json();

	const effect = Effect.gen(function* () {
		console.log('Connecting to port', path);
		try {
			const result = yield* Effect.promise(() => connect(path));
			console.log('server - connect success', result);
			return { success: true };
		} catch (error) {
			console.log('server - connect error', error);
			return { success: false, error: String(error) };
		}
	});

	const result = await Effect.runPromise(effect);
	return json(result);
};
