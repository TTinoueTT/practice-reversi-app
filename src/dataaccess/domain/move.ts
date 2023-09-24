import { Disc } from "@/dataaccess/domain/disc";
import { Point } from "@/dataaccess/domain/point";

export class Move {
    constructor(private _disc: Disc, private _point: Point) {}

    public get disc(): Disc {
        return this._disc;
    }

    public get point(): Point {
        return this._point;
    }
}
