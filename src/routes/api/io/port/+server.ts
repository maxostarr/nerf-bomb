import { connect } from '$lib/io';
import { json, type RequestHandler } from '@sveltejs/kit';
import { SerialPort } from 'serialport';

export const GET: RequestHandler = async () => {
  const ports = await SerialPort.list();

  return json(ports);
}

export const POST: RequestHandler = async (request) => {
  const { path } = await request.request.json();

  try {
    connect(path);

    return json({ success: true });
  } catch (e) {
    return json({ success: false, error: e });
  }
}