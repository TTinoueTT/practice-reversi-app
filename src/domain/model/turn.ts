import { Board } from "@/domain/model/board";
import { Disc } from "@/domain/model/disc";
import { Move } from "@/domain/model/move";
import { Point } from "@/domain/model/point";

export class Turn {
    constructor(
        private _gameId: number,
        private _turnCount: number,
        private _nextDisc: Disc,
        private _move: Move | undefined,
        private _board: Board,
        private _endAt: Date
    ) {}

    public get gameId(): number {
        return this._gameId;
    }

    public get turnCount(): number {
        return this._turnCount;
    }

    public get nextDisc(): Disc {
        return this._nextDisc;
    }

    public get board(): Board {
        return this._board;
    }

    public get endAt(): Date {
        return this._endAt;
    }

    placeNext(disc: Disc, point: Point): Turn {
        // 打とうとした石が、次の石ではない場合、置くことはできない
        if (disc !== this._nextDisc) {
            throw new Error("Invalid disc");
        }

        const move = new Move(disc, point);

        const nextBoard = this._board.place(move);

        // TODO 次の石が置けない場合はスキップする処理
        const nextDisc = disc === Disc.Dark ? Disc.Light : Disc.Dark;

        return new Turn(this._gameId, this._turnCount + 1, nextDisc, move, nextBoard, new Date());
    }
}
