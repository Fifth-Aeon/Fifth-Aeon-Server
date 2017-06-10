import { ServerMessenger } from './messenger';
import { Message, MessageType } from './message';


export enum ErrorType {
    GameActionError, AuthError, InvalidIdError, QueueError
}

export interface ClientErrorData {
    message: string,
    type: ErrorType
}

export class ErrorHandeler {

    constructor(private messenger: ServerMessenger) { }

    public clientError(client: string, type: ErrorType, message?: string) {
        let msg = 'Error of type: ' + ErrorType[type] + ' - ' + message;
        this.messenger.sendMessageTo(MessageType.ClientError, {
            message: msg,
            type: type
        } as ClientErrorData, client)
    }

}