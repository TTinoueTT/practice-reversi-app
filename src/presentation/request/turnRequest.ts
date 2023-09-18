export interface TurnPostRequestsBody {
    turnCount: number;
    move: {
        disc: number;
        x: number;
        y: number;
    };
}
