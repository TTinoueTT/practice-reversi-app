import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql from "mysql2/promise";

import { GameGateway } from "@/dataaccess/gateway/gameGateway";
import { TurnGateway } from "@/dataaccess/gateway/turnGateway";
import { MoveGateway } from "@/dataaccess/gateway/moveGateway";
import { SquareGateway } from "@/dataaccess/gateway/squareGateway";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const INITIAL_BOARD = [
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const PORT = 3021;
const app = express();
app.use(morgan("dev"));
app.use(express.static("static", { extensions: ["html"] }));
app.use(express.json());

app.get("/api/hello", async (req, res) => {
    res.json({
        message: "Hello Express!!!!!!",
    });
});

app.get("/api/error", async (req, res) => {
    throw new Error("Error endpoint");
});

app.post("/api/games", async (req, res) => {
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

        await squareGateway.insertAll(connect, turnRecord.id, INITIAL_BOARD);

        await connect.commit();
    } finally {
        await connect.end();
    }

    res.status(201).end();
});

app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
    const turnCount = parseInt(req.params.turnCount);

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

        const responseBody = {
            turnCount,
            board,
            nextDisc: turnRecord.nextDisc,
            // TODO 決着がついている場合、game_results テーブルから取得する
            winnerDisc: null,
        };

        res.json(responseBody);
    } finally {
        await connect.end();
    }
});

app.post("/api/games/latest/turns", async (req, res) => {
    const turnCount = parseInt(req.body.turnCount);
    const disc = parseInt(req.body.move.disc);
    const x = parseInt(req.body.move.x);
    const y = parseInt(req.body.move.y);
    console.log(`${turnCount}, ${disc}, ${x}, ${y}`);

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

    res.status(201).end();
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Reversi app started: http://localhost:${PORT}`);
});

function errorHandler(
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
) {
    console.error("Unexpected error occurred", err);
    res.status(500).send({
        message: "Unexpected error occurred",
    });
}

async function connectMySQL() {
    return await mysql.createConnection({
        host: "localhost",
        database: "reversi",
        port: 3320,
        user: "reversi",
        password: "password",
    });
}
