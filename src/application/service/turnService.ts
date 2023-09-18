import express from "express";

export const turnRouter = express.Router();
import { connectMySQL } from "@/dataaccess/connection";
import { EMPTY, DARK, LIGHT, INITIAL_BOARD } from "@/application/constants";

import { GameGateway } from "@/dataaccess/gateway/gameGateway";
import { TurnGateway } from "@/dataaccess/gateway/turnGateway";
import { MoveGateway } from "@/dataaccess/gateway/moveGateway";
import { SquareGateway } from "@/dataaccess/gateway/squareGateway";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class TurnService {
    async findLatestGameTurnByTurnCount(turnCount: number) {
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

            const squareRecords = await squareGateway.findForTurnId(
                connect,
                turnRecord.id
            );

            const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
            squareRecords.forEach((s) => {
                board[s.y][s.x] = s.disc;
            });

            return {
                turnCount,
                board,
                nextDisc: turnRecord.nextDisc,
                // TODO 決着がついている場合、game_results テーブルから取得する
                winnerDisc: null,
            };
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

            const previousTurnRecord =
                await turnGateway.findForGameIdAndTurnCount(
                    connect,
                    gameRecord.id,
                    previousTurnCount
                );
            if (!previousTurnRecord) {
                throw new Error("Specified turn not found");
            }

            const squareRecords = await squareGateway.findForTurnId(
                connect,
                previousTurnRecord.id
            );

            const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
            squareRecords.forEach((s) => {
                board[s.y][s.x] = s.disc;
            });

            // TODO: 盤面に置けるかチェック

            // 石を置く
            board[y][x] = disc;
            console.log(board);

            // TODO: ひっくり返す

            // ターンを保存する
            const nextDisc = disc === DARK ? LIGHT : DARK;
            const now = new Date();
            const turnRecord = await turnGateway.insert(
                connect,
                gameRecord.id,
                turnCount,
                nextDisc,
                now
            );

            await squareGateway.insertAll(connect, turnRecord.id, board);

            await moveGateway.insert(connect, turnRecord.id, disc, x, y);

            await connect.commit();
        } finally {
            await connect.end();
        }
    }
}
