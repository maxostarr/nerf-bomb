import { spawn } from 'child_process';
import { Console, Context, Data, Effect, Layer, Ref, Schema } from 'effect';

export const PAN_OPTIONS = ['left', 'right', 'center'] as const;
type Pan = (typeof PAN_OPTIONS)[number];

const AUDIO_FILE_PATH = '/home/rezo/Downloads/sample-3s.mp3';

// Create the Ref synchronously when the module loads
const hwIdRef = Effect.runSync(Ref.make('hw:2,0'));

class HwIDState extends Context.Tag('nerf-bomb/lib/audio/HwIDState')<
	HwIDState,
	Ref.Ref<string>
>() {}

// Create a layer from the already-created Ref
export const HwIDStateLive = Layer.succeed(HwIDState, hwIdRef);

export const panSchema = Schema.Union(
	...PAN_OPTIONS.filter((value) => value !== 'center').map((value) => Schema.Literal(value))
);

class AudioPlaybackError extends Data.TaggedError('AudioPlaybackError')<{
	readonly code?: number;
	readonly message: string;
}> {
	message: string = 'Audio playback error';
}
class AudioDeviceParseError extends Data.TaggedError('AudioDeviceParseError')<{
	readonly code?: number;
	readonly message: string;
}> {
	message: string = 'Audio device parse error';
}
class AudioDeviceNotFoundError extends Data.TaggedError('AudioDeviceNotFoundError')<{
	readonly code?: number;
	readonly message: string;
}> {
	message: string = 'Audio device not found';
}

export const playAudio = (pan: Pan) =>
	Effect.gen(function* () {
		const hwIdState = yield* HwIDState;
		const panFilter = getPanFilter(pan);

		// Base ffmpeg parameters with explicit audio format
		const ffmpegParams = [
			'-i',
			AUDIO_FILE_PATH,
			// '-filter_complex', `[0:a]${panFilter}[audio]`,
			'-af',
			panFilter,
			'-acodec',
			'pcm_s16le',
			'-ar',
			'44100',
			'-ac',
			'2',
			'-thread_queue_size',
			'4096',
			'-f',
			'alsa',
			yield* Ref.get(hwIdState)
		];

		yield* Effect.async<void, AudioPlaybackError>((resume) => {
			const player = spawn('ffmpeg', ffmpegParams);

			player.on('exit', (code) => {
				if (code && code !== 0) {
					resume(Effect.fail(new AudioPlaybackError({ code, message: 'Audio playback failed' })));
				} else {
					resume(Effect.succeed(undefined));
				}
			});

			player.on('error', (err) => {
				console.error('Failed to start audio playback:', err);
				resume(Effect.fail(new AudioPlaybackError({ message: err.message })));
			});

			player.stderr.on('data', (data) => {
				console.error(`data: ${data}`);
			});
		}).pipe(Effect.withSpan('playAudioFFMPEG'));
	}).pipe(
		Effect.provide(HwIDStateLive),
		Effect.tapError((error) => Effect.logError(`Failed to start audio playback: ${error}`)),
		Effect.withSpan('playAudio')
	);

function getPanFilter(pan: Pan): string {
	switch (pan) {
		case 'left':
			return 'pan=stereo|c0=c0';
		case 'right':
			return 'pan=stereo|c1=c1';
		default:
			return 'pan=stereo|c0=0.5|c1=0.5';
	}
}

export const parseAudioDevices = (output: string) =>
	Effect.gen(function* () {
		const devices = [];
		const lines = output.toString().split('\n');

		for (const line of lines) {
			const cardMatch = line.match(/card (\d+): (\w+) \[(.*?)\], device (\d+): (.*?) \[(.*?)\]/);

			if (cardMatch) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const [_, cardNum, cardShortName, cardFullName, deviceNum, deviceType, deviceName] =
					cardMatch;

				const device = {
					cardNumber: parseInt(cardNum),
					cardName: cardFullName,
					cardShortName,
					deviceNumber: parseInt(deviceNum),
					deviceType,
					deviceName,
					id: `${cardNum},${deviceNum}`
				};

				devices.push(device);
			}
		}

		return yield* Effect.succeed(devices);
	}).pipe(
		Effect.tapErrorCause((cause) => Console.error('Error parsing audio devices:', cause)),
		Effect.catchAllCause(() =>
			Effect.fail(new AudioDeviceParseError({ message: 'Failed to parse audio devices' }))
		),
		Effect.withSpan('parseAudioDevices')
	);

// Update getAudioPlaybackDevices to use the parser
export const getAudioPlaybackDevices = () =>
	Effect.async<string, AudioDeviceNotFoundError>((resume) => {
		const aplay = spawn('aplay', ['-l']);
		let output = '';

		aplay.stdout.on('data', (data) => {
			output += data.toString();
		});

		aplay.on('exit', (code) => {
			if (code === 0) {
				resume(Effect.succeed(output));
			} else {
				resume(
					Effect.fail(new AudioDeviceNotFoundError({ message: 'Failed to find audio devices' }))
				);
			}
		});

		aplay.on('error', (err) => {
			resume(Effect.fail(new AudioDeviceNotFoundError({ message: err.message })));
		});
	}).pipe(
		Effect.andThen(parseAudioDevices),
		Effect.tapError((error) => Effect.logError(`Failed to parse audio devices: ${error}`)),
		Effect.withSpan('getAudioPlaybackDevices')
	);

export const setAudioPlaybackDevice = (id: string) =>
	Effect.gen(function* () {
		const state = yield* HwIDState;
		yield* Ref.set(state, id);
	}).pipe(
		Effect.provide(HwIDStateLive),
		Effect.tapError((error) => Effect.logError(`Failed to set audio playback device: ${error}`)),
		Effect.withSpan('setAudioPlaybackDevice')
	);
