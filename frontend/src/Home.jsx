import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Home() {

  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username) {
      alert("Enter your name 😤");
      return;
    }

    navigate("/game", {
      state: { username }
    });
  };

  return (
    <div className="home">

      <h1 className="title">🎨 Doodle Arena 💖</h1>

      {/* JOIN SECTION */}
      <div className="join-box">
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={handleJoin}>Play 🎮</button>
      </div>

      {/* ABOUT */}
      <div className="info-box">
        <h2>✨ About the Game</h2>
        <p>
          Doodle Arena is a fun multiplayer drawing and guessing game.
          One player draws and others guess the word.
          The faster you guess, the more points you earn! 🏆
        </p>
      </div>

      {/* HOW TO PLAY */}
      <div className="info-box">
        <h2>🎮 How to Play</h2>
        <ul>
          <li>✏️ One player draws a word</li>
          <li>💬 Others guess in chat</li>
          <li>⏳ Time is limited</li>
          <li>🏆 Correct guess gives points</li>
          <li>👑 Highest score wins</li>
        </ul>
      </div>

    </div>
  );
}

export default Home;