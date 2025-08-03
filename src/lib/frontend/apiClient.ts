const BASE = `/api`

export function get ( path: string ) {
  return fetch( `${ BASE }/${ path }`, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  } ).then( res => res.json() )
}

export function post ( path: string, body: object ) {
  return fetch( `${ BASE }/${ path }`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( body )
  } ).then( ( res ) => res.json() )
}

export function put ( path: string, body: object ) {
  return fetch( `${ BASE }/${ path }`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify( body )
  } ).then( ( res ) => res.json() )
}