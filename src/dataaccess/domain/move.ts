import { Disc } from "@/dataaccess/domain/disc";
import { Point } from "@/dataaccess/domain/point";

export class Move {
    constructor(private _disc: Disc, private _point: Point) {}
}
