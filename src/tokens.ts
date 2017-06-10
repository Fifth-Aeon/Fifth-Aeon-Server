import * as crypto from 'crypto';

export function getToken(bytes:number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
}