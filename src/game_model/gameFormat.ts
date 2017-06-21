import { Resource } from './resource';

export class GameFormat {
    public name: string = "Standard";
    public zoneNames: ["Board", "Hand", "Crypt"];

    // General Gameplay
    public boardSize: number = 16;
    public playerCount: number = 2; // Number of players in format
    public rarityNames: string[] = ["Common", "Rare", "Epic", "Legendary"];
    public resourceNames: string[] = ["Astral", "Primeval", "Necrotic", "Radiant"];
    public basicResources: Map<string, Resource> = new Map<string, Resource>();

    // Starting Values
    public initialDraw: number[] = [3, 3]; // Number of cards each player draws on turn 1
    public initialLife: number[] = [25, 25]; // Number of life each player gets on turn 1
    public initalResource: Resource[] = [new Resource(2), new Resource(3)];

    // Deckbuilding rules
    public minDeckSize = 20;
    public maxDeckSize = 50;
    public cardsOfRarity = [3, 3, 2, 1];

    constructor() {
        this.basicResources.set('basic', new Resource(1));
        for (let resourceName of this.resourceNames) {
            this.basicResources.set(resourceName, new Resource(0, new Map<string, number>([[resourceName, 1]])));
        }
    }
}