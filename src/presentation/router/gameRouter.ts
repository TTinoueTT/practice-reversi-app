import express from "express";
export const gameRouter = express.Router();
import { GameService } from "@/application/service/gameService";

const gameService = new GameService();

gameRouter.post("/api/games", async (req, res) => {
    await gameService.startNewGame();

    res.status(201).end();
});
