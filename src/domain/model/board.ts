import { Disc } from "@/domain/model/disc";
import { Move } from "@/domain/model/move";

export class Board {
    constructor(private _discs: Disc[][]) {}

    public get discs(): Disc[][] {
        return this._discs;
    }

    place(move: Move): Board {
        // TODO 盤面に置けるかチェック

        // 盤面をコピー、現在の盤面を直接編集せずに新しい盤面を作成していく
        const newDiscs = this._discs.map((line) => {
            return line.map((disc) => {
                return disc;
            });
        });

        // 石を置く
        newDiscs[move.point.y][move.point.x] = move.disc;

        // TODO ひっくり返す

        return new Board(newDiscs);
    }
}
