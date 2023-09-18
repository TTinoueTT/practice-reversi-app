import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql from "mysql2/promise";

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

        const gameInsertResult = await connect.execute<mysql.ResultSetHeader>(
            "insert into games (started_at) values (?)",
            [now]
        );
        const gameId = gameInsertResult[0].insertId; // insertId はインサートされた 主キーを取得

        const turnInsertResult = await connect.execute<mysql.ResultSetHeader>(
            "insert into turns (game_id, turn_count, next_disc, end_at) values (?,?,?, ?)",
            [gameId, 0, DARK, now]
        );
        const turnId = turnInsertResult[0].insertId;

        const squareCount = INITIAL_BOARD.map((line) => line.length).reduce(
            (v1, v2) => v1 + v2,
            0
        );

        const squaresInsertSql =
            "insert into squares (turn_id, x, y, disc) values " +
            Array.from(Array(squareCount))
                .map(() => "(?, ?, ?, ?)")
                .join(", ");

        const squaresInsertValues: any[] = [];
        INITIAL_BOARD.forEach((line, y) => {
            line.forEach((disc, x) => {
                squaresInsertValues.push(turnId);
                squaresInsertValues.push(x);
                squaresInsertValues.push(y);
                squaresInsertValues.push(disc);
            });
        });

        await connect.execute(squaresInsertSql, squaresInsertValues);

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
        const gameSelectResult = await connect.execute<mysql.RowDataPacket[]>(
            "select id, started_at from games order by id desc limit 1"
        );
        const game = gameSelectResult[0][0];

        const turnSelectResult = await connect.execute<mysql.RowDataPacket[]>(
            "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ? ",
            [game["id"], turnCount]
        );
        const turn = turnSelectResult[0][0];

        // prettier-ignore
        const squaresSelectResult = await connect.execute<mysql.RowDataPacket[]>(
            "select id, turn_id, x, y, disc from squares where turn_id = ? ",
            [ turn["id"]]
        );
        const squares = squaresSelectResult[0];
        const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
        squares.forEach((s) => {
            board[s.y][s.x] = s.disc;
        });

        const responseBody = {
            turnCount,
            board,
            nextDisc: turn["next_disc"],
            // TODO 決着がついている場合、game_results テーブルから取得する
            winnerDisc: null,
        };

        res.json(responseBody);
    } finally {
        await connect.end();
    }
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
