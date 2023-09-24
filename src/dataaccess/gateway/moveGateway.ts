import mysql from "mysql2/promise";
import { MoveRecord } from "@/dataaccess/record/moveRecord";

export class MoveGateway {
    async findForTurnId(
        connect: mysql.Connection,
        turnId: number
    ): Promise<MoveRecord | undefined> {
        const moveSelectResult = await connect.execute<mysql.RowDataPacket[]>(
            "select id, turn_id, disc, x, y from moves where turn_id = ?",
            [turnId]
        );

        const record = moveSelectResult[0][0];

        if (!record) {
            return undefined;
        }

        return new MoveRecord(
            record["id"],
            record["turn_id"],
            record["disc"],
            record["x"],
            record["y"]
        );
    }

    async insert(
        connect: mysql.Connection,
        turnId: number,
        disc: number,
        x: number,
        y: number
    ): Promise<MoveRecord> {
        const moveRecords = await connect.execute<mysql.ResultSetHeader>(
            "insert into moves (turn_id, disc, x, y) values (?, ?, ?, ?)",
            [turnId, disc, x, y]
        );
        const moveId = moveRecords[0].insertId;

        return new MoveRecord(moveId, turnId, disc, x, y);
    }
}
