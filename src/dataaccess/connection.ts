import mysql from "mysql2/promise";
export async function connectMySQL() {
    return await mysql.createConnection({
        host: "localhost",
        database: "reversi",
        port: 3321,
        user: "reversi",
        password: "password",
    });
}
