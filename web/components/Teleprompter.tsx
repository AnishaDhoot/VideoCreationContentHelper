"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Teleprompter.module.css";

interface TeleprompterProps {
  script: string;
}

export default function Teleprompter({ script }: TeleprompterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3); // 1 to 10
  const [fontSize, setFontSize] = useState(24); // px
  
  // Auto-scroll loop
  useEffect(() => {
    if (!isPlaying) return;

    let frameId: number;
    const container = containerRef.current;
    if (!container) return;

    const scroll = () => {
      // scroll speed step
      container.scrollTop += (speed * 0.4);

      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
        setIsPlaying(false);
      } else {
        frameId = requestAnimationFrame(scroll);
      }
    };

    frameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  return (
    <div className={styles.prompterContainer}>
      {/* Settings bar */}
      <div className={styles.controlBar}>
        <div className={styles.controlsLeft}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`${styles.actionBtn} ${isPlaying ? styles.pauseBtn : styles.playBtn}`}
          >
            {isPlaying ? "Pause" : "Start Play"}
          </button>
          <button onClick={handleReset} className={styles.resetBtn}>
            Reset
          </button>
        </div>

        <div className={styles.controlsRight}>
          {/* Speed slider */}
          <div className={styles.controlItem}>
            <label className={styles.label}>Speed: {speed}x</label>
            <input
              type="range"
              min="1"
              max="10"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Font size controller */}
          <div className={styles.controlItem}>
            <label className={styles.label}>Font: {fontSize}px</label>
            <input
              type="range"
              min="16"
              max="40"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>
      </div>

      {/* Script display box */}
      <div className={styles.viewportWrapper}>
        <div className={styles.focusLine}></div>
        <div 
          ref={containerRef} 
          className={styles.scrollViewport}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className={styles.paddingTop}></div>
          <div className={styles.scriptText}>
            {script ? (
              script.split("\n\n").map((para, idx) => (
                <p key={idx} className={styles.paragraph}>
                  {para}
                </p>
              ))
            ) : (
              <span className={styles.placeholder}>
                Scriptwriter output will appear here. Press 'Start Play' to scroll!
              </span>
            )}
          </div>
          <div className={styles.paddingBottom}></div>
        </div>
      </div>
    </div>
  );
}
