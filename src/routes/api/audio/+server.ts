import { getAudioPlaybackDevices, playAudio, setAudioPlaybackDevice } from '$lib/audio';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  const devices = await getAudioPlaybackDevices();

  return json(devices);
}

export const PUT: RequestHandler = async ({ request }) => {
  const { hwId } = await request.json();

  setAudioPlaybackDevice(hwId);

  return json({ success: true });
}

export const POST: RequestHandler = async ({ request }) => {
  const { pan } = await request.json();

  playAudio(pan)

  return json({ success: true });
}
