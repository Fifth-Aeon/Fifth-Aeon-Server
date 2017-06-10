import { Server } from './server';

const port = process.env.PORT || 2222;

console.log('Starting Server');
let server = new Server(port);
