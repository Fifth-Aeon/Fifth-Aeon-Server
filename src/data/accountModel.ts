import { Document, Schema, model } from "mongoose";
import { Account } from '../account';

interface AccountDoc extends Account, Document {
    username: string
}

const AccountSchema = new Schema({
    username: String,
    deck: Object
})

export const AccountModel = model<AccountDoc>('Account', AccountSchema);