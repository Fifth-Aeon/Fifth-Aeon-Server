import { sample } from 'lodash';
import { passwords } from './passwords';
import { db } from './db';


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

    private generateGuestUsername() {
        let guestName = sample(this.guestNames);
        let adj1 = '', adj2 = '', name = '';

        while (adj1 === adj2 || name.length > 30) {
            adj1 = sample(this.positiveAdjectives);
            adj2 = sample(this.positiveAdjectives);
            name = this.properCase(`${adj1} ${adj2} ${guestName}`);
        }

        return name;
    }

    private properCase(word: string) {
        return word.replace(/\w\S*/g, (text) => {
            return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
        });
    }

    private async isUniqueUsername(name: string) {
        const result = await db.query(`SELECT accountID 
            FROM CCG.Account 
            WHERE LOWER(username) = LOWER($1);` , [name]);
        return result.rowCount === 0;
    }

    private guestNames = ['guest', 'visitor', 'visitant', 'sojourner']

    private positiveAdjectives = [
        'ADAPTABLE', 'ADVENTUROUS', 'AFFABLE', 'AGREEABLE', 'ALTRUISTIC',
        'AMAZING', 'AMBITIOUS', 'AMIABLE', 'AMICABLE',
        'AMUSING', 'ANGELIC', 'APPRECIATED',
        'APPRECIATIVE', 'AUTHENTIC', 'AWARE', 'AWESOME',
        'BALANCED', 'BEAUTIFUL', 'BELOVED', -'FABULOUS', 'BLISSFUL',
        'BOLD', 'BRAVE', 'BREATHTAKING', 'BRIGHT', 'BRILLIANT',
        'CALM', 'CAPABLE', 'CAREFUL', 'CARING',
        'CENTERED', 'CHAMPION', 'CHARISMATIC', 'CHARMING',
        'CHEERFUL', 'CHERISHED', 'COMFORTABLE', 'COMMUNICATIVE',
        'CONFIDENT', 'CONSCIENTIOUS', 'CONSIDERATE',
        'CONTENT', 'CONVIVIAL', 'COURAGEOUS', 'COURTEOUS', 'CREATIVE',
        'DANDY', 'DARING', 'DAZZLED', 'DECISIVE', 'DEDICATED',
        'DELIGHTFUL', 'DETERMINED', 'DILIGENT',
        'DIPLOMATIC', 'DYNAMIC', 'EAGER', 'EASYGOING',
        'EMPOWERED', 'ENCHANTED', 'ENDLESS', 'ENERGETIC',
        'ENERGIZED', 'ENLIGHTENED', 'ENLIVENED', 'ENOUGH',
        'ENTHUSIASTIC', 'ETERNAL', 'EXCELLENT', 'EXCITED',
        'EXHILARATED', 'EXPANDED', 'EXPANSIVE', 'EXQUISITE',
        'EXTRAORDINARY', 'EXUBERANT',
        'FABULOUS', 'FAITHFUL', 'FANTASTIC', 'FAVORABLE',
        'FEARLESS', 'FLOURISHED', 'FLOWING', 'FOCUSED', 'FORCEFUL',
        'FORGIVING', 'FORTUITOUS', 'FRANK', 'FREE',
        'FREESPIRITED', 'FRIENDLY', 'FULFILLED',
        'GENEROUS', 'GENIAL', 'GENIUS', 'GENTLE', 'GENUINE',
        'GIVING', 'GLAD', 'GLORIOUS', 'GLOWING', 'GODDESS', 'GOOD',
        'GRACEFUL', 'GRACIOUS', 'GRATEFUL', 'GREAT', 'GREGARIOUS', 'GROUNDED',
        'HAPPY', 'HARMONIOUS', 'HEALTHY', 'HEARTFULL', 'HEARTWARMING',
        'HELPFUL', 'HONEST', 'HOPEFUL', 'HUMOROUS',
        'ILLUMINATED', 'IMAGINATIVE', 'IMPARTIAL', 'INCOMPARABLE',
        'INCREDIBLE', 'INDEPENDENT', 'INEFFABLE', 'INNOVATIVE',
        'INSPIRATIONAL', 'INSPIRED', 'INTELLECTUAL', 'INTELLIGENT',
        'INTUITIVE', 'INVENTIVE', 'INVIGORATED', 'INVOLVED', 'IRRESISTIBLE',
        'JAZZED', 'JOLLY', 'JOVIAL', 'JOYFUL', 'JOYOUS', 'JUBILANT', 'JUST',
        'KIND', 'KNOWINGLY', 'KNOWLEDGEABLE',
        'LIVELY', 'LOYAL', 'LUCKY', 'LUXURIOUS',
        'MAGICAL', 'MAGNIFICENT', 'MARVELOUS', 'MEMORABLE', 'MINDFUL',
        'MIRACLE', 'MIRACULOUS', 'MIRTHFUL', 'MODEST',
        'NEAT', 'NICE', 'NOBLE',
        'OPTIMISTIC', 'OPULENT', 'ORIGINAL', 'OUTSTANDING',
        'PASSIONATE', 'PATIENT', 'PEACEFUL', 'PERFECT', 'PERSISTENT',
        'PHILOSOPHICAL', 'PIONEERING', 'PLACID', 'PLAYFUL', 'PLUCKY',
        'POLITE', 'POSITIVE', 'POWERFUL', 'PRACTICAL',
        'PRECIOUS', 'PROPITIOUS', 'PROSPEROUS',
        'RADIANT', 'RATIONAL', 'READY', 'RECEPTIVE',
        'REFRESHED', 'REJUVENATED', 'RELAXED', 'RELIABLE',
        'RELIEVED', 'REMARKABLE', 'RENEWED', 'RESERVED',
        'RESILIENT', 'RESOURCEFUL',
        'SAFE', 'SATISFIED', 'SECURED',
        'SENSATIONAL', 'SENSIBLE', 'SENSITIVE',
        'SERENE', 'SHINING', 'SHY', 'SINCERE',
        'SMART', 'SOCIABLE', 'SOULFUL', 'SPECTACULAR',
        'SPLENDID', 'STELLAR', 'STRAIGHTFORWARD', 'STRONG',
        'STUPENDOUS', 'SUCCESSFUL', 'SUPER', 'SUSTAINED', 'SYMPATHETIC',
        'THANKFUL', 'THOUGHTFUL', 'THRILLED', 'THRIVING',
        'TIDY', 'TOUGH', 'TRANQUIL', 'TRIUMPHANT', 'TRUSTING',
        'ULTIMATE', 'UNASSUMING', 'UNBELIEVABLE',
        'UNDERSTANDING', 'UNIQUE', 'UNLIMITED', 'UNREAL', 'UPLIFTED',
        'VALUABLE', 'VERSATILE', 'VIBRANT', 'VICTORIOUS', 'VIVACIOUS',
        'WARM', 'WARMHEARTED', 'WEALTHY', 'WELCOMED', 'WHOLE',
        'WHOLEHEARTEDLY', 'WILLING', 'WISE', 'WITTY', 'WONDERFUL', 'WONDROUS', 'WORTHY',
        'YOUTHFUL', 'ZAPPY', 'ZESTFUL'
    ] as string[]
}

export const nameGenerator = new NameGenerator();
