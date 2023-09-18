const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const boardEl = document.getElementById("board")

async function showBoard(turnCount) {
    const response = await fetch(`/api/games/latest/turns/${turnCount}`)
    const responseBody = await response.json()
    const board = responseBody.board
    const nextDisc = responseBody.nextDisc


    while (boardEl.firstChild) {
        boardEl.removeChild(boardEl.firstChild)
    }

    board.forEach((line, y) => {
        line.forEach((square, x) => {
            // <div class="square">
            const squareEl = document.createElement("div")
            squareEl.className = 'square'

            if (square !== EMPTY) {
                // <div class="square dark" >
                const color = square === DARK ? "dark" : "light";
                squareEl.classList.add(color);
            } else {
                squareEl.addEventListener("click", async () => {
                    // console.log("clicked");
                    const nextTurnCount = turnCount + 1
                    await registerTurn(nextTurnCount, nextDisc, x, y)
                    await showBoard(nextTurnCount)
                })
            }

            squareEl.innerHTML = `<i>${y} , ${x + 1}</i>`
            boardEl.appendChild(squareEl)
            // console.log(`${y + 1} , ${x + 1}`);
        })
    })
}

async function registerGame() {
    await fetch("/api/games", {
        method: "POST"
    })
}

async function registerTurn(turnCount, disc, x, y) {
    const requestBody = {
        turnCount,
        move: {
            disc,
            x,
            y
        }
    }

    await fetch("/api/games/latest/turns", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
}

async function main() {
    await registerGame()
    await showBoard(0)
}

main()