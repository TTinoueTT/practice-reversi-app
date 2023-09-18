import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql from "mysql2/promise";

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
    const startedAt = new Date();

    const connect = await mysql.createConnection({
        host: "localhost",
        database: "reversi",
        port: 3321,
        user: "reversi",
        password: "password",
    });

    try {
        await connect.beginTransaction();

        await connect.execute("insert into games (started_at) values (?)", [
            startedAt,
        ]);
        await connect.commit();
    } finally {
        await connect.end();
    }

    res.status(201).end();
});

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
