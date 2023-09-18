import mysql from "mysql2/promise";
import { SquareRecord } from "@/dataaccess/record/squareRecord";

export class SquareGateway {
    async findForTurnId(
        connect: mysql.Connection,
        turnId: number
    ): Promise<SquareRecord[]> {
        const squareRecords = await connect.execute<mysql.RowDataPacket[]>(
            "select id, turn_id, x, y, disc from squares where turn_id = ?",
            [turnId]
        );
        const records = squareRecords[0];

        return records.map((record) => {
            return new SquareRecord(
                record["id"],
                record["turn_id"],
                record["disc"],
                record["x"],
                record["y"]
            );
        });
    }

    async insertAll(
        connect: mysql.Connection,
        turnId: number,
        board: number[][]
    ) {
        const squareCount = board
            .map((line) => line.length)
            .reduce((v1, v2) => v1 + v2, 0);

        const squaresInsertSql =
            "insert into squares (turn_id, x, y, disc) values " +
            Array.from(Array(squareCount))
                .map(() => "(?, ?, ?, ?)")
                .join(", ");

        const squaresInsertValues: any[] = [];
        board.forEach((line, y) => {
            line.forEach((disc, x) => {
                squaresInsertValues.push(turnId);
                squaresInsertValues.push(x);
                squaresInsertValues.push(y);
                squaresInsertValues.push(disc);
            });
        });

        await connect.execute(squaresInsertSql, squaresInsertValues);
    }
}
