import { MessageType } from "./message";
import { ServerMessenger } from "./messenger";

export enum ErrorType {
    GameActionError,
    AuthError,
    InvalidIdError,
    QueueError,
    DeckError
}

export interface ClientErrorData {
    message: string;
    type: ErrorType;
}

export class ErrorHandler {
    constructor(private messenger: ServerMessenger) {}

    public clientError(client: string, type: ErrorType, message?: string) {
        const msg = "Error of type: " + ErrorType[type] + " - " + message;
        this.messenger.sendMessageTo(
            MessageType.ClientError,
            {
                message: msg,
                type: type
            } as ClientErrorData,
            client
        );
    }
}
