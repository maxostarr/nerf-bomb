import { getAudioPlaybackDevices, setAudioPlaybackDevice } from '$lib/audio.remote';
import { connectToSerialPort, enableAndPlayAudio } from '$lib/io.remote';

export const devices = $state({
	serial: [] as PortOption[],
	audio: [] as AudioDeviceDetails[]
});

export interface PortOption {
	label: string;
	path: string;
}

export interface AudioDeviceDetails {
	cardNumber: number;
	cardName: string;
	cardShortName: string;
	deviceNumber: number;
	deviceType: string;
	deviceName: string;
	id: string;
}

export async function fetchSerialPorts() {
	const response = await get(`io/port`).catch(() => null);

	if (!response) {
		throw new Error('Failed to fetch serial ports');
	}

	devices.serial = response.map((port: { path: string; manufacturer?: string }) => ({
		label: `${port.path} - ${port.manufacturer}`,
		path: port.path
	}));
}

export async function setSerialPort(port: PortOption) {
	connectToSerialPort(port.path);
}

export async function fetchAudioDevices() {
	console.log('Fetching audio devices...');
	const devicesRes = await getAudioPlaybackDevices();
	console.log('Audio devices:', devicesRes);

	devices.audio = devicesRes;
	return devices;
}

// export async function setAudioDevice(deviceId: string) {
// 	return setAudioPlaybackDevice(`hw:${deviceId}`);
// }

export async function testAudio(pan: 'left' | 'right') {
	return enableAndPlayAudio(pan);
}
