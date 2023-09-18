import fs from "fs";
import util from "util";

const promisifyReadFile = util.promisify(fs.readFile);

// await を使うには async 修飾子をつける
async function main() {
    const data = await promisifyReadFile("package.json");
    // readFile を実行するのを待って以降の処理
    const fileContent = data.toString();
    console.log(fileContent);
}

main();
