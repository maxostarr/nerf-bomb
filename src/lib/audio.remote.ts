import { command, query } from '$app/server';
import { Effect, Schema } from 'effect';
import * as audioLib from './audio';
import { error } from '@sveltejs/kit';
import { NodeSdkLive } from './telemetry';

export const playAudio = command(Schema.standardSchemaV1(audioLib.panSchema), async (pan) => {
	return Effect.runPromise(
		audioLib.playAudio(pan).pipe(
			Effect.tapError((error) => Effect.logError(`Failed to play audio: ${error}`)),
			Effect.withSpan('remote/playAudio'),
			Effect.provide(NodeSdkLive)
		)
	).catch(({ message }) => {
		return error(500, message);
	});
});

export const getAudioPlaybackDevices = query(async () => {
	return Effect.runPromise(
		audioLib.getAudioPlaybackDevices().pipe(
			Effect.tapError((error) => Effect.logError(`Failed to get audio playback devices: ${error}`)),
			Effect.withSpan('remote/getAudioPlaybackDevices'),
			Effect.provide(NodeSdkLive)
		)
	).catch(({ message }) => {
		return error(500, message);
	});
});

export const setAudioPlaybackDevice = command(
	Schema.standardSchemaV1(Schema.String),
	async (deviceId) => {
		await Effect.runPromise(
			audioLib.setAudioPlaybackDevice(deviceId).pipe(
				Effect.tapError((error) =>
					Effect.logError(`Failed to set audio playback device: ${error}`)
				),
				Effect.withSpan('remote/setAudioPlaybackDevice'),
				Effect.provide(NodeSdkLive)
			)
		);
	}
);
