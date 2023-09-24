import express from "express";

export const turnRouter = express.Router();
import { connectMySQL } from "@/dataaccess/connection";
import { EMPTY, DARK, LIGHT, INITIAL_BOARD } from "@/application/constants";
import { FindLatestGameTurnByTurnCountDto } from "@/application/dto/turnDto";

import { GameGateway } from "@/dataaccess/gateway/gameGateway";
import { TurnGateway } from "@/dataaccess/gateway/turnGateway";
import { MoveGateway } from "@/dataaccess/gateway/moveGateway";
import { SquareGateway } from "@/dataaccess/gateway/squareGateway";
import { Board } from "@/domain/model/board";
import { Turn } from "@/domain/model/turn";
import { toDisc } from "@/domain/model/disc";
import { Point } from "@/domain/model/point";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnService {
    async findLatestGameTurnByTurnCount(
        turnCount: number
    ): Promise<FindLatestGameTurnByTurnCountDto> {
        const connect = await connectMySQL();
        try {
            const gameRecord = await gameGateway.findLatest(connect);
            if (!gameRecord) {
                throw new Error("Latest game not found");
            }

            const turnRecord = await turnGateway.findForGameIdAndTurnCount(
                connect,
                gameRecord.id,
                turnCount
            );

            if (!turnRecord) {
                throw new Error("Specified turn not found");
            }

            const squareRecords = await squareGateway.findForTurnId(connect, turnRecord.id);

            const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
            squareRecords.forEach((s) => {
                board[s.y][s.x] = s.disc;
            });

            return new FindLatestGameTurnByTurnCountDto(
                turnCount,
                board,
                turnRecord.nextDisc,
                // TODO 決着がついている場合、game_results テーブルから取得する
                undefined
            );
        } finally {
            await connect.end();
        }
    }

    async registerTurn(turnCount: number, disc: number, x: number, y: number) {
        const connect = await connectMySQL();
        try {
            // 1つ前のターンを取得する
            await connect.beginTransaction();
            const gameRecord = await gameGateway.findLatest(connect);
            if (!gameRecord) {
                throw new Error("Latest game not found");
            }

            const previousTurnCount = turnCount - 1;

            const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
                connect,
                gameRecord.id,
                previousTurnCount
            );
            if (!previousTurnRecord) {
                throw new Error("Specified turn not found");
            }

            const squareRecords = await squareGateway.findForTurnId(connect, previousTurnRecord.id);

            const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
            squareRecords.forEach((s) => {
                board[s.y][s.x] = s.disc;
            });

            const previousTurn = new Turn(
                gameRecord.id,
                previousTurnCount,
                toDisc(previousTurnRecord.nextDisc),
                undefined,
                new Board(board),
                previousTurnRecord.endAt
            );

            // 石を置く
            const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

            // ターンを保存する
            const turnRecord = await turnGateway.insert(
                connect,
                newTurn.gameId,
                newTurn.turnCount,
                newTurn.nextDisc,
                newTurn.endAt
            );

            await squareGateway.insertAll(connect, turnRecord.id, newTurn.board.discs);

            await moveGateway.insert(connect, turnRecord.id, disc, x, y);

            await connect.commit();
        } finally {
            await connect.end();
        }
    }
}
