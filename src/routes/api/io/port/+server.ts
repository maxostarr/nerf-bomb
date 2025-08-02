import { connect } from '$lib/io';
import { json, type RequestHandler } from '@sveltejs/kit';
import { SerialPort } from 'serialport';

export const GET: RequestHandler = async () => {
  const ports = await SerialPort.list();

  return json( ports );
}

export const POST: RequestHandler = async ( request ) => {
  const { path } = await request.request.json();
  console.log( 'Connecting to port', path );

  return await connect( path )
    .then( ( param ) => {
      console.log( 'server - connect success', param )
      return json( { success: true } )
    } )
    .catch( error => {
      console.log( 'server - connect error', error )
      return json( { success: false, error: error.toString() } )
    } )
}