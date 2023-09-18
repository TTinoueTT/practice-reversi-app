export class FindLatestGameTurnByTurnCountDto {
    constructor(
        private _turnCount: number,
        private _board: number[][],
        private _nextDisc: number | undefined,
        private _winnerDisc: number | undefined
    ) {}

    public get turnCount(): number {
        return this._turnCount;
    }
    public get board(): number[][] {
        return this._board;
    }
    public get nextDisc(): number | undefined {
        return this._nextDisc;
    }
    public get winnerDisc(): number | undefined {
        return this._winnerDisc;
    }
}
