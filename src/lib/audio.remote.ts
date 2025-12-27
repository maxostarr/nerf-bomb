import { command, query } from '$app/server';
import { Effect, Schema } from 'effect';
import * as audioLib from './audio';

export const playAudio = command(Schema.standardSchemaV1(audioLib.panSchema), async (pan) => {
	const audio = await Effect.runPromise(audioLib.playAudio(pan));
	return audio;
});

export const getAudioPlaybackDevices = query(async () => {
	const devices = await Effect.runPromise(audioLib.getAudioPlaybackDevices());
	return devices;
});

export const setAudioPlaybackDevice = command(
	Schema.standardSchemaV1(Schema.String),
	async (deviceId) => {
		await Effect.runPromise(audioLib.setAudioPlaybackDevice(deviceId));
	}
);
