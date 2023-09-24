import mysql from "mysql2/promise";
import { Turn } from "@/domain/model/turn";

import { GameGateway } from "@/dataaccess/gateway/gameGateway";
import { TurnGateway } from "@/dataaccess/gateway/turnGateway";
import { MoveGateway } from "@/dataaccess/gateway/moveGateway";
import { SquareGateway } from "@/dataaccess/gateway/squareGateway";
import { toDisc } from "@/domain/model/disc";
import { Move } from "@/domain/model/move";
import { Point } from "@/domain/model/point";
import { Board } from "@/domain/model/board";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnRepository {
    async findForGameIdAndTurnCount(
        connect: mysql.Connection,
        gameId: number,
        turnCount: number
    ): Promise<Turn> {
        const turnRecord = await turnGateway.findForGameIdAndTurnCount(connect, gameId, turnCount);

        if (!turnRecord) {
            throw new Error("Specified turn not found");
        }

        const squareRecords = await squareGateway.findForTurnId(connect, turnRecord.id);

        const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
        squareRecords.forEach((s) => {
            board[s.y][s.x] = s.disc;
        });

        const moveRecord = await moveGateway.findForTurnId(connect, turnRecord.id);
        let move: Move | undefined;
        if (moveRecord) {
            move = new Move(toDisc(moveRecord.disc), new Point(moveRecord.x, moveRecord.y));
        }

        return new Turn(
            gameId,
            turnCount,
            toDisc(turnRecord.nextDisc),
            move,
            new Board(board),
            turnRecord.endAt
        );
    }

    async save(connect: mysql.Connection, turn: Turn) {
        const turnRecord = await turnGateway.insert(
            connect,
            turn.gameId,
            turn.turnCount,
            turn.nextDisc,
            turn.endAt
        );

        await squareGateway.insertAll(connect, turnRecord.id, turn.board.discs);

        if (turn.move) {
            await moveGateway.insert(
                connect,
                turnRecord.id,
                turn.move.disc,
                turn.move.point.x,
                turn.move.point.y
            );
        }
    }
}
