<script lang="ts">
	import { addToast } from '../lib/frontend/toastStore';
	import * as io from '../lib/frontend/io.svelte';
	import Reload from '../components/icons/reload.svelte';
	import { getAudioPlaybackDevices, setAudioPlaybackDevice } from '$lib/audio.remote';
	import { connectToSerialPort, getSerialPorts } from '$lib/io.remote';

	let port: io.PortOption | null = $state(null);
	let audioDevice: io.AudioDeviceDetails | null = $state();
	const deviceQuery = getAudioPlaybackDevices();
	const serialQuery = getSerialPorts();

	const testAudio = async (pan: 'left' | 'right') => {
		await io.testAudio(pan);
	};

	const setAudioDevice = async () => {
		if (!audioDevice) return;

		await setAudioPlaybackDevice(audioDevice.id)
		.then(() => {
			addToast({
				message: 'Set audio device successfully',
				type: 'success',
				dismissible: true
			});
		})
		.catch((e) => {
			addToast({
				message: `Failed to set audio device: ${e.body.message}`,
				type: 'error',
				dismissible: true,
				timeout: null
			});
		})
	};

	const setSerialPort = async () => {
		if (!port) {
			return;
		}

		await connectToSerialPort(port.path)
		.then(() => {
			addToast({
				message: 'Connected to device successfully',
				type: 'success',
				dismissible: true
			});
		})
		.catch((e) => {
			addToast({
				message: e.body.message,
				type: 'error',
				dismissible: true,
				timeout: null
			});
		})
	};
</script>

<aside class="card">
	<h2 class="card-title">Testing Utilities</h2>

	<div class="card-body">
		<div class="join join-horizontal">
			<button class="btn btn-outline btn-primary join-item" onclick={() => testAudio('left')}
				>Test Audio Left Channel</button
			>

			<button class="btn btn-outline btn-primary join-item" onclick={() => testAudio('right')}
				>Test Audio Right Channel</button
			>
		</div>

		<div class="join join-horizontal">
			<select
				class="join-item select select-bordered w-full max-w-xs"
				bind:value={port}
				onchange={() => setSerialPort()}
			>
				<option disabled selected>Select Port</option>
				{#each serialQuery.current as port}
					<option value={port}>{port.path}{port.manufacturer ? " - " : ""}{port.manufacturer}</option>
				{/each}
			</select>
			<button class="btn btn-primary join-item" onclick={() => serialQuery.refresh()}>
				<span class:loading-spin={serialQuery.loading}>
					<Reload />
				</span>
			</button>
		</div>

		<div class="join join-horizontal">
			<select
				class="join-item select select-bordered w-full max-w-xs"
				bind:value={audioDevice}
				onchange={() => setAudioDevice()}
			>
				<option disabled selected>Audio Device</option>
				{#each deviceQuery.current as device}
					<option value={device}>{device.cardName} - {device.deviceName}</option>
				{/each}
			</select>
			<button class="btn btn-primary join-item" onclick={() => deviceQuery.refresh()}>
				<span class:loading-spin={deviceQuery.loading}>
					<Reload />
				</span>
			</button>
		</div>
	</div>
</aside>

<style>
	/* Loading animation */
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-spin {
		animation: spin 1s linear infinite;
	}
</style>
