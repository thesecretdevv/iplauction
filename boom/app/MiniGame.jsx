"use client";

import { useState, useEffect, useRef } from "react";

export default function MiniGame() {
  const [gameState, setGameState] = useState("idle"); // idle, playing, over
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const timerRef = useRef(null);
  
  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameState("playing");
    moveTarget();
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState("over");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const moveTarget = () => {
    // keeping it inside the bounding box (10% to 90%)
    const x = Math.floor(Math.random() * 80) + 10;
    const y = Math.floor(Math.random() * 80) + 10;
    setTargetPos({ x, y });
  };
  
  const handleTargetClick = (e) => {
    e.stopPropagation();
    if (gameState === "playing") {
      setScore(s => s + 1);
      moveTarget();
    }
  };
  
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);
  
  return (
    <div style={{
      marginTop: "2.5rem",
      borderTop: "1px solid #222",
      paddingTop: "2rem"
    }}>
      <h3 style={{
        fontSize: "1rem",
        fontWeight: 500,
        color: "#ffffff",
        marginBottom: "0.5rem",
      }}>
        Wait, don't leave just yet!
      </h3>
      <p style={{
        fontSize: "0.9375rem",
        color: "#a1a1aa",
        lineHeight: 1.6,
        marginBottom: "1.5rem"
      }}>
        Test your aim while you wait. Click the yellow dot as many times as you can in 15 seconds.
      </p>
      
      <div style={{
        width: "100%",
        height: "240px",
        backgroundColor: "#0a0a0a",
        border: "1px solid #222",
        borderRadius: "8px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: gameState === "playing" ? "crosshair" : "default"
      }}>
        
        {gameState === "idle" && (
          <button 
            onClick={startGame}
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "opacity 0.2s ease"
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.8}
            onMouseOut={e => e.currentTarget.style.opacity = 1}
          >
            Start Aim Trainer
          </button>
        )}
        
        {gameState === "playing" && (
          <>
            <div style={{
              position: "absolute",
              top: "12px",
              left: "16px",
              color: "#888",
              fontSize: "0.8125rem",
              fontWeight: 500,
              userSelect: "none"
            }}>
              Time: <span style={{ color: timeLeft <= 5 ? "#ef4444" : "#fff" }}>{timeLeft}s</span>
            </div>
            <div style={{
              position: "absolute",
              top: "12px",
              right: "16px",
              color: "#888",
              fontSize: "0.8125rem",
              fontWeight: 500,
              userSelect: "none"
            }}>
              Score: <span style={{ color: "#fff" }}>{score}</span>
            </div>
            <div 
              onClick={handleTargetClick}
              style={{
                position: "absolute",
                top: `${targetPos.y}%`,
                left: `${targetPos.x}%`,
                width: "28px",
                height: "28px",
                backgroundColor: "#eab308",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                boxShadow: "0 0 15px rgba(234, 179, 8, 0.3)"
              }}
            />
          </>
        )}
        
        {gameState === "over" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.25rem", color: "#fff", marginBottom: "0.5rem" }}>
              Time's up!
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#a1a1aa", marginBottom: "1.25rem" }}>
              Your Score: <span style={{ color: "#eab308", fontWeight: 600 }}>{score}</span> hits
            </div>
            <button 
              onClick={startGame}
              style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
