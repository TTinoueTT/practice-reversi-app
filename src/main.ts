import express from "express";
import morgan from "morgan";
import "express-async-errors";

import { gameRouter } from "@/presentation/router/gameRouter";
import { turnRouter } from "@/presentation/router/turnRouter";

const PORT = 3021;
const app = express();
app.use(morgan("dev"));
app.use(express.static("static", { extensions: ["html"] }));
app.use(express.json());

app.use(gameRouter);
app.use(turnRouter);

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
