import express from "express";
export const turnRouter = express.Router();
import { TurnService } from "@/application/service/turnService";
import { TurnGetResponseBody } from "@/presentation/response/turnResponse";
import { TurnPostRequestsBody } from "@/presentation/request/turnRequest";

const turnService = new TurnService();

turnRouter.get(
    "/api/games/latest/turns/:turnCount",
    async (req, res: express.Response<TurnGetResponseBody>) => {
        const turnCount = parseInt(req.params.turnCount);
        const dto = await turnService.findLatestGameTurnByTurnCount(turnCount);

        const responseBody = {
            turnCount: dto.turnCount,
            board: dto.board,
            nextDisc: dto.nextDisc ?? null,
            winnerDisc: dto.winnerDisc ?? null,
        };
        res.json(responseBody);
    }
);

turnRouter.post(
    "/api/games/latest/turns",
    async (req: express.Request<{}, {}, TurnPostRequestsBody>, res) => {
        const turnCount = req.body.turnCount;
        const disc = req.body.move.disc;
        const x = req.body.move.x;
        const y = req.body.move.y;
        console.log(`${turnCount}, ${disc}, ${x}, ${y}`);

        await turnService.registerTurn(turnCount, disc, x, y);

        res.status(201).end();
    }
);
