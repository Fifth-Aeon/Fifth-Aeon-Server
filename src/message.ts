export enum MessageType {
    // General
    Info,
    ClientError,
    Connect,
    Ping,

    // Accounts
    AnonymousLogin,
    LoginResponce,
    SetDeck,

    // Queuing
    JoinQueue,
    ExitQueue,
    QueueJoined,
    StartGame,
    NewPrivateGame,
    JoinPrivateGame,
    CancelPrivateGame,
    PrivateGameReady,

    // In Game
    GameEvent,
    GameAction
}

export interface Message {
    source: string;
    type: MessageType;
    data: any;
}

export interface LoginResponceData {
    username: string;
    token: string;
}
