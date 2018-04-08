require('make-promises-safe');
import { Server } from './server';
import { nameGenerator } from './nameGenerator';

const port = process.env.PORT || 2222;

console.log('Starting Server');
let server = new Server(port);
