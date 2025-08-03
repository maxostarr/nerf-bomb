<script lang="ts">
	import { onMount } from 'svelte';
	import { addToast } from '../lib/frontend/toastStore';
	import * as io from '../lib/frontend/io.svelte';

	let loadingPorts = false;
	let loadingAudio = false;
	let port: io.PortOption | null = null;
	let audioDevice: io.AudioDeviceDetails | null;

	const testAudio = async (pan: 'left' | 'right') => {
		fetch('/api/io/control', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ pan })
		});
	};

	const setAudioDevice = async () => {
		if (!audioDevice) return;

		await io.setAudioDevice(audioDevice.id);
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

<!-- using tailwind -->
<main class="container mx-auto flex flex-col items-center justify-center">
	<h1>Nerf Game</h1>

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
					<!-- Refresh Icon -->

					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
						class:loading-spin={loadingPorts}
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
						/>
					</svg>
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
					<!-- Refresh Icon -->

					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
						class:loading-spin={loadingAudio}
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
						/>
					</svg>
				</button>
			</div>
		</div>
	</aside>
</main>

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
