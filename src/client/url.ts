const isLocal = true;
const serverWsUrn = isLocal ? 'localhost:2222' : 'ws-battleship.herokuapp.com';
const serverHttpUrn = isLocal ? 'localhost:4200' : 'battleship.williamritson.com'
const serverWs = isLocal ? 'ws' : 'wss';
const serverHttp = isLocal ? 'http' : 'https';

export const urls  ={
    ws: serverWs + '://' + serverWsUrn,
    http: serverHttp + '://' + serverHttpUrn
}