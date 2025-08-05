<script lang="ts">
	import { onMount } from 'svelte';
	import { addToast } from '../lib/frontend/toastStore';
	import * as io from '../lib/frontend/io.svelte';
	import Reload from '../components/icons/reload.svelte';

	let loadingPorts = false;
	let loadingAudio = false;
	let port: io.PortOption | null = null;
	let audioDevice: io.AudioDeviceDetails | null;

	const testAudio = async (pan: 'left' | 'right') => {
		await io.testAudio(pan);
	};

	const setAudioDevice = async () => {
		if (!audioDevice) return;

		const res = await io.setAudioDevice(audioDevice.id);

		if (res.success) {
			addToast({
				message: 'Set audio device successfully',
				type: 'success',
				dismissible: true
			});
		} else {
			addToast({
				message: `Failed to set audio device`,
				type: 'error',
				dismissible: true,
				timeout: null
			});
		}
	};

	const getAudioDevices = async () => {
		loadingAudio = true;

		await io.fetchAudioDevices();

		loadingAudio = false;
	};

	const getSerialPorts = async () => {
		loadingPorts = true;

		await io.fetchSerialPorts();

		loadingPorts = false;
	};

	const setSerialPort = async () => {
		if (!port) {
			return;
		}

		const res = await io.setSerialPort(port);

		if (res.success) {
			addToast({
				message: 'Connected to device successfully',
				type: 'success',
				dismissible: true
			});
		} else {
			addToast({
				message: `Failed to connect ${res.error}`,
				type: 'error',
				dismissible: true,
				timeout: null
			});
		}
	};

	onMount(() => {
		getSerialPorts();
		getAudioDevices();
	});
</script>

<aside class="card">
	<h2 class="card-title">Testing Utilities</h2>

	<div class="card-body">
		<div class="join join-horizontal">
			<button class="btn btn-outline btn-primary join-item" on:click={() => testAudio('left')}
				>Test Audio Left Channel</button
			>

			<button class="btn btn-outline btn-primary join-item" on:click={() => testAudio('right')}
				>Test Audio Right Channel</button
			>
		</div>

		<div class="join join-horizontal">
			<select
				class="join-item select select-bordered w-full max-w-xs"
				bind:value={port}
				on:change={(e) => setSerialPort()}
			>
				<option disabled selected>Select Port</option>
				{#each io.devices.serial as port}
					<option value={port}>{port.label}</option>
				{/each}
			</select>
			<button class="btn btn-primary join-item" on:click={getSerialPorts}>
				<span class:loading-spin={loadingPorts}>
					<Reload />
				</span>
			</button>
		</div>

		<div class="join join-horizontal">
			<select
				class="join-item select select-bordered w-full max-w-xs"
				bind:value={audioDevice}
				on:change={(e) => setAudioDevice()}
			>
				<option disabled selected>Audio Device</option>
				{#each io.devices.audio as device}
					<option value={device}>{device.cardName} - {device.deviceName}</option>
				{/each}
			</select>
			<button class="btn btn-primary join-item" on:click={getAudioDevices}>
				<span class:loading-spin={loadingAudio}>
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
