require('make-promises-safe');
import { Server } from './server';

const port = parseInt(process.env.PORT || '') || 2222;

console.log('Starting Server on port', port);
let server = new Server(port);
