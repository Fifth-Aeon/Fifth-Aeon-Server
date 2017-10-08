import { Document, Schema, Model, model, connect, ConnectionOptions } from "mongoose";
import { Account } from '../account';
import { AccountModel } from './accountModel';
import { DeckList } from '../game_model/deckList';

// Connect mongoose to mongodb
const mongoData = {
    url: process.env.MONGO_URL || 'mongodb://localhost/test',
    password: process.env.MONGO_PASSWORD  as String || '',
    user: process.env.MONGO_USER || ''
}

const opts:ConnectionOptions = {
    user: mongoData.user,
    auth: mongoData.password,
    useMongoClient: true,
    promiseLibrary: global.Promise
}

console.log(mongoData.url, opts);

connect('mongodb://localhost/test', opts).then(() => {
    console.log('Connected to Mongo at', mongoData.url);
}).catch(err => {
    console.error('Failed to connect to Mongo');
    console.error(err);
});

class Database {
    public saveAccount(account: Account) {
        let model = new AccountModel(account);
        model.save()
            .catch(console.error);
    }
}
