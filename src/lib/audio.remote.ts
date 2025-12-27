import { command, query } from '$app/server';
import { Effect, Schema } from 'effect';
import * as audioLib from './audio';
import { error } from '@sveltejs/kit';

export const playAudio = command(Schema.standardSchemaV1(audioLib.panSchema), async (pan) => {
	return Effect.runPromise(audioLib.playAudio(pan)).catch(({ message }) => {
		return error(500, message);
	});
});

export const getAudioPlaybackDevices = query(async () => {
	return Effect.runPromise(audioLib.getAudioPlaybackDevices()).catch(({ message }) => {
		return error(500, message);
	});
});

export const setAudioPlaybackDevice = command(
	Schema.standardSchemaV1(Schema.String),
	async (deviceId) => {
		await Effect.runPromise(audioLib.setAudioPlaybackDevice(deviceId)).catch(({ message }) => {
			return error(500, message);
		});
	}
);
