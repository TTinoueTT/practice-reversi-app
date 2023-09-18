import mysql from "mysql2/promise";
import { GameRecord } from "@/dataaccess/record/gameRecord";

export class GameGateway {
    async findLatest(
        connect: mysql.Connection
    ): Promise<GameRecord | undefined> {
        const gameRecords = await connect.execute<mysql.RowDataPacket[]>(
            "select id, started_at from games order by id desc limit 1" // 最新の game を取得
        );
        const record = gameRecords[0][0];

        if (!record) return undefined;

        return new GameRecord(record["id"], record["started_at"]);
    }

    async insert(
        connect: mysql.Connection,
        startedAt: Date
    ): Promise<GameRecord> {
        const gameInsertResult = await connect.execute<mysql.ResultSetHeader>(
            "insert into games (started_at) values (?)",
            [startedAt]
        );
        const gameId = gameInsertResult[0].insertId;

        return new GameRecord(gameId, startedAt);
    }
}
