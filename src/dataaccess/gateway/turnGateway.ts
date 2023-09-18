import mysql from "mysql2/promise";
import { TurnRecord } from "@/dataaccess/record/turnRecord";

export class TurnGateway {
    async findForGameIdAndTurnCount(
        connect: mysql.Connection,
        gameId: number,
        turnCount: number
    ): Promise<TurnRecord | undefined> {
        const turnRecords = await connect.execute<mysql.RowDataPacket[]>(
            "select id, game_id, turn_count, next_disc, end_at from turns where game_id = ? and turn_count = ?",
            [gameId, turnCount]
        );
        const record = turnRecords[0][0];

        if (!record) return undefined;

        return new TurnRecord(
            record["id"],
            record["game_id"],
            record["turn_count"],
            record["next_disc"],
            record["end_at"]
        );
    }

    async insert(
        connect: mysql.Connection,
        gameId: number,
        turnCount: number,
        nextDisc: number,
        endAt: Date
    ): Promise<TurnRecord> {
        const turnRecord = await connect.execute<mysql.ResultSetHeader>(
            "insert into turns (game_id, turn_count, next_disc, end_at) values (?, ?, ?, ?)",
            [gameId, turnCount, nextDisc, endAt]
        );
        const turnId = turnRecord[0].insertId;

        return new TurnRecord(turnId, gameId, turnCount, nextDisc, endAt);
    }
}
