export class MoveRecord {
    constructor(
        private _id: number,
        private _turnid: number,
        private _disc: number,
        private _x: number,
        private _y: number
    ) {}

    public get id(): number {
        return this._id;
    }
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
