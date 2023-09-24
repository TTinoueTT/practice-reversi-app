export class TurnRecord {
    constructor(
        private _id: number,
        private _gameid: number,
        private _turnCount: number,
        private _nextDisc: number,
        private _endAt: Date
    ) {}

    public get id(): number {
        return this._id;
    }

    public get nextDisc(): number {
        return this._nextDisc;
    }

    public get endAt(): Date {
        return this._endAt;
    }
}
