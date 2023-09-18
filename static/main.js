const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;


const INITIAL_BOARD = [
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
]

const boardEl = document.getElementById("board")

async function showBoard() {
    while (boardEl.firstChild) {
        boardEl.removeChild(boardEl.firstChild)
    }

    INITIAL_BOARD.forEach((line, y) => {
        line.forEach((square, x) => {
            // <div class="square">
            const squareEl = document.createElement("div")
            squareEl.className = 'square'

            if (square !== EMPTY) {
                // <div class="square dark" >
                const color = square === DARK ? "dark" : "light";
                squareEl.classList.add(color);
            }

            squareEl.innerHTML = `<i>${y + 1} , ${x + 1}</i>`

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

async function main() {
    await registerGame()
    await showBoard()
}

main()