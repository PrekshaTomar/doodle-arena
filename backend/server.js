const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let players = [];
let currentDrawer = null;
let currentWord = "";
let timer = 60;
let interval;

const words = ["apple", "car", "dog", "house", "tree"];

function startRound() {
  if (players.length === 0) return;

  if (interval) clearInterval(interval); // 🔥 FIX

  currentDrawer = players[Math.floor(Math.random() * players.length)];
  currentWord = words[Math.floor(Math.random() * words.length)];

  io.to(currentDrawer.id).emit("your-turn", currentWord);
  io.emit("word-hint", "_ ".repeat(currentWord.length));

  timer = 60;

  interval = setInterval(() => {
    timer--;
    io.emit("timer", timer);

    if (timer <= 0) {
      clearInterval(interval);
      startRound();
    }
  }, 1000);
}

io.on("connection", (socket) => {

  console.log("New user connected:", socket.id);

  socket.on("join-game", ({ username }) => {
    console.log("Joining:", username);

    const player = {
      id: socket.id,
      name: username,
      score: 0
    };

    players.push(player);

    console.log("Players:", players);

    io.emit("players", players);

    // ✅ allow even 1 player (for testing)
    if (players.length >= 1) {
      startRound();
    }
  });

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("chat", (msg) => {
    const player = players.find(p => p.id === socket.id);

    if (!player) return;

    if (msg === currentWord) {
      player.score += 10;

      io.emit("chat", {
        msg: `${player.name} guessed correctly! 🎉`
      });

      io.emit("players", players);

      clearInterval(interval);
      startRound();
    } else {
      io.emit("chat", {
        msg: `${player.name}: ${msg}`
      });
    }
  });

  socket.on("clear", () => {
    io.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    players = players.filter(p => p.id !== socket.id);

    io.emit("players", players);
  });

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
const path = require("path");

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Catch all routes (IMPORTANT FIX)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});