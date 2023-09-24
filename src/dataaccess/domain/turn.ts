import { Board } from "@/dataaccess/domain/board";
import { Disc } from "@/dataaccess/domain/disc";
import { Move } from "@/dataaccess/domain/move";

export class Turn {
    constructor(
        private _gameId: number,
        private _turnCount: number,
        private _nextDisc: Disc,
        private _move: Move | undefined,
        private _board: Board,
        private _endAt: Date
    ) {}
}
