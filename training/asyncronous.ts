import fs from "fs";

function main() {
    let fileContent: string = "Not loaded";

    // ファイルの読み込みをする処理、非同期
    fs.readFile("package.json", (err, data) => {
        fileContent = data.toString();
        console.log(fileContent);
    });

    console.log(fileContent); // Not loaded
}

main();
