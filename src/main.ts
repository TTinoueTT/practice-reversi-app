import express from "express";

const PORT = 3021;
const app = express();

app.get("/api/hello", async (req, res) => {
    res.json({
        message: "Hello Express",
    });
});

app.listen(PORT, () => {
    console.log(`Reversi app started: http://localhost:${PORT}`);
});
