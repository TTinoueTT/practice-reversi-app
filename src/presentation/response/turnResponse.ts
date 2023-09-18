export interface TurnGetResponseBody {
    turnCount: number;
    board: number[][];
    nextDisc: number | null;
    winnerDisc: number | null;
}
