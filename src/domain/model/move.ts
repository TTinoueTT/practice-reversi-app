import { Disc } from "@/domain/model/disc";
import { Point } from "@/domain/model/point";

export class Move {
    constructor(private _disc: Disc, private _point: Point) {}

    public get disc(): Disc {
        return this._disc;
    }

    public get point(): Point {
        return this._point;
    }
}
