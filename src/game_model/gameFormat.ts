import { Resource } from './resource';

export class GameFormat {
    playerCount: number = 2; // Number of players in format
    initialDraw: number[] = [5, 5]; // Number of cards each player draws on turn 1
    initialLife:number[]  = [25, 25]; // Number of life each player gets on turn 1
    // Amount of rsources each player gets on turn 1
    initalResource:Resource[] = [
        new Resource(),
        new Resource()
    ];
}