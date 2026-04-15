import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function Game() {

  const location = useLocation();
  const { username } = location.state || {};

  const [wordHint, setWordHint] = useState("Waiting...");
  const [timer, setTimer] = useState(60);

  const colorRef = useRef("black");
  const sizeRef = useRef(3);

  const changeColor = (color) => {
    colorRef.current = color;
  };

  const changeSize = (size) => {
    sizeRef.current = size;
  };

  const clearCanvas = () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
  };

  // ================= SOCKET =================
  useEffect(() => {

    socket.emit("join-game", { username });

    // 🔥 CLEAR OLD LISTENERS
    socket.off("players");
    socket.off("chat");
    socket.off("word-hint");
    socket.off("timer");

    // 👥 PLAYERS
    socket.on("players", (players) => {
  const list = document.getElementById("players");
  if (!list) return;

  list.innerHTML = "";

  players.forEach((p, index) => {

    const li = document.createElement("li");

    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.padding = "10px";
    li.style.borderRadius = "12px";
    li.style.margin = "6px 0";
    li.style.background = "#fff";
    li.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

    // 👤 Avatar
    const img = document.createElement("img");
    img.src = `/avatar${(index % 3) + 1}.png`;
    img.style.width = "35px";
    img.style.borderRadius = "50%";

    // 🧑 Name
    const name = document.createElement("span");
    name.innerText = p.name;
    name.style.marginLeft = "10px";
    name.style.fontWeight = "bold";

    // 🏆 Score
    const score = document.createElement("span");
    score.innerText = "🏆 " + p.score;
    score.style.marginLeft = "auto";

    // 👑 Crown for top player
    if (p.score === Math.max(...players.map(pl => pl.score))) {
      name.innerText += " 👑";
    }

    li.appendChild(img);
    li.appendChild(name);
    li.appendChild(score);

    list.appendChild(li);
  });
});

    // 💬 CHAT
    socket.on("chat", (data) => {
      const div = document.createElement("div");
      div.innerText = data.msg;

      document.getElementById("chat").appendChild(div);
    });

    socket.on("word-hint", setWordHint);
    socket.on("timer", setTimer);

  }, [username]);

  // ================= CANVAS =================
  useEffect(() => {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 700;
    canvas.height = 400;

    let drawing = false;

    canvas.onmousedown = () => drawing = true;

    canvas.onmouseup = () => {
      drawing = false;
      ctx.beginPath();
    };

    canvas.onmousemove = (e) => {
      if (!drawing) return;

      const data = { x: e.offsetX, y: e.offsetY };

      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = sizeRef.current;
      ctx.lineCap = "round";

      ctx.lineTo(data.x, data.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);

      socket.emit("draw", data);
    };

    socket.on("draw", (data) => {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    });

    socket.on("clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

  }, []);

  // ================= CHAT =================
  const sendMessage = (e) => {
    if (e.key === "Enter") {
      socket.emit("chat", e.target.value);
      e.target.value = "";
    }
  };

  return (
    <div className="game-container">

      <div className="top-bar">
        <h2>🎨 Doodle Arena ✨💖</h2>
        <div>{wordHint}</div>
        <div className="timer">
          ⏳ {timer > 0 ? timer : "Time's up!"}
        </div>
      </div>

      <div className="game-main">

        <div className="players-box">
          <h3>👥 Players</h3>
          <ul id="players"></ul>
        </div>

        <div className="canvas-box">
          <canvas id="canvas"></canvas>

          <div className="colors">
            <button style={{background:"red"}} onClick={()=>changeColor("red")}></button>
            <button style={{background:"blue"}} onClick={()=>changeColor("blue")}></button>
            <button style={{background:"green"}} onClick={()=>changeColor("green")}></button>
            <button style={{background:"black"}} onClick={()=>changeColor("black")}></button>

            <button onClick={clearCanvas}>🧹</button>

            <input 
              type="range" 
              min="1" 
              max="10" 
              defaultValue="3"
              onChange={(e) => changeSize(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-box">
          <h3>💬 Chat</h3>
          <div id="chat"></div>
          <input onKeyDown={sendMessage} placeholder="Guess the word..." />
        </div>

      </div>

    </div>
  );
}

export default Game;