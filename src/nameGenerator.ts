import { db } from "./db";
const namor = require("namor");

export class NameGenerator {
    public async getGuestName() {
        let guestName = this.generateGuestUsername();
        let ok = await this.isUniqueUsername(guestName);

        while (!ok) {
            guestName = this.generateGuestUsername();
            ok = await this.isUniqueUsername(guestName);
        }

        return guestName;
    }

    private generateGuestUsername(): string {
        const name: string = namor.generate({
            words: 2,
            numbers: 0,
            char: " "
        });

        if (name.length > 30) { return this.generateGuestUsername(); }
        return this.properCase(name);
    }

    private properCase(word: string) {
        return word.replace(/\w\S*/g, text => {
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        });
    }

    private async isUniqueUsername(name: string) {
        const result = await db.query(
            `SELECT accountID
            FROM CCG.Account
            WHERE LOWER(username) = LOWER($1);`,
            [name]
        );
        return result.rowCount === 0;
    }


}

export const nameGenerator = new NameGenerator();
