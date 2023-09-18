import express from "express";

export const gameRouter = express.Router();
import { connectMySQL } from "@/dataaccess/connection";
import { EMPTY, DARK, LIGHT, INITIAL_BOARD } from "@/application/constants";

import { GameGateway } from "@/dataaccess/gateway/gameGateway";
import { TurnGateway } from "@/dataaccess/gateway/turnGateway";
// import { MoveGateway } from "@/dataaccess/gateway/moveGateway";
import { SquareGateway } from "@/dataaccess/gateway/squareGateway";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
// const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

export class GameService {
    async startNewGame() {
        const now = new Date();

        const connect = await connectMySQL();

        try {
            await connect.beginTransaction();

            const gameRecord = await gameGateway.insert(connect, now);
            const turnRecord = await turnGateway.insert(
                connect,
                gameRecord.id,
                0,
                DARK,
                now
            );

            await squareGateway.insertAll(
                connect,
                turnRecord.id,
                INITIAL_BOARD
            );

            await connect.commit();
        } finally {
            await connect.end();
        }
    }
}
