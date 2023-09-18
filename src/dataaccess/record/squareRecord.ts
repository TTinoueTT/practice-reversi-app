export class SquareRecord {
    constructor(
        private _id: number,
        private _turnid: number,
        private _disc: number,
        private _x: number,
        private _y: number
    ) {}

    public get disc(): number {
        return this._disc;
    }
    public get x(): number {
        return this._x;
    }
    public get y(): number {
        return this._y;
    }
}
