import mysql from "mysql2/promise";
import { MoveRecord } from "@/dataaccess/record/moveRecord";

export class MoveGateway {
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
