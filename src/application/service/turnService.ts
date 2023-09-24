import express from "express";

export const turnRouter = express.Router();
import { connectMySQL } from "@/dataaccess/connection";
// import { EMPTY, DARK, LIGHT, INITIAL_BOARD } from "@/application/constants";
import { FindLatestGameTurnByTurnCountDto } from "@/application/dto/turnDto";

import { GameGateway } from "@/dataaccess/gateway/gameGateway";
// import { TurnGateway } from "@/dataaccess/gateway/turnGateway";
// import { MoveGateway } from "@/dataaccess/gateway/moveGateway";
// import { SquareGateway } from "@/dataaccess/gateway/squareGateway";
// import { Board } from "@/domain/model/board";
// import { Turn } from "@/domain/model/turn";
import { toDisc } from "@/domain/model/disc";
import { Point } from "@/domain/model/point";
import { TurnRepository } from "@/domain/repository/turnRepository";

const gameGateway = new GameGateway();
// const turnGateway = new TurnGateway();
// const moveGateway = new MoveGateway();
// const squareGateway = new SquareGateway();

const turnRepository = new TurnRepository();

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

            const turn = await turnRepository.findForGameIdAndTurnCount(
                connect,
                gameRecord.id,
                turnCount
            );

            return new FindLatestGameTurnByTurnCountDto(
                turnCount,
                turn.board.discs,
                turn.nextDisc,
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
            const previousTurn = await turnRepository.findForGameIdAndTurnCount(
                connect,
                gameRecord.id,
                previousTurnCount
            );

            // 石を置く
            const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

            // ターンを保存する
            await turnRepository.save(connect, newTurn);

            await connect.commit();
        } finally {
            await connect.end();
        }
    }
}
