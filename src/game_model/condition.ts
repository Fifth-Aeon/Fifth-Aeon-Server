export class Condition {
    params: Map<string, any>;
    evaluate: () => boolean;
}