"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./Teleprompter.module.css";

interface TeleprompterProps {
  script: string;
}

export default function Teleprompter({ script }: TeleprompterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3); // 1 to 10
  const [fontSize, setFontSize] = useState(24); // px
  const [copied, setCopied] = useState(false);
  
  // Word count calculation
  const wordCount = useMemo(() => {
    if (!script) return 0;
    return script.split(/\s+/).filter(Boolean).length;
  }, [script]);

  // Translate speed (1-10) to Words Per Minute (WPM)
  const estimatedWPM = useMemo(() => {
    return speed * 15 + 75;
  }, [speed]);

  // Read time formatted as MM:SS
  const formattedDuration = useMemo(() => {
    if (wordCount === 0) return "00:00";
    const durationSeconds = Math.ceil((wordCount / estimatedWPM) * 60);
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [wordCount, estimatedWPM]);

  // Auto-scroll loop
  useEffect(() => {
    if (!isPlaying) return;

    let frameId: number;
    const container = containerRef.current;
    if (!container) return;

    const scroll = () => {
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

  const handleCopy = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy script", err);
    }
  };

  const handleDownload = () => {
    if (!script) return;
    const element = document.createElement("a");
    const file = new Blob([script], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "youtube_script_hook.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
          
          {/* Estimated Read-Time Clock */}
          <div className={styles.stopwatchBadge}>
            <svg className={styles.stopwatchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9"></circle>
              <polyline points="12 5 12 12 16 14"></polyline>
              <line x1="12" y1="1" x2="12" y2="3"></line>
            </svg>
            <span className={styles.durationTime}>{formattedDuration}</span>
            <span className={styles.wpmSub}>({wordCount} words)</span>
          </div>

          <div className={styles.actionDivider}></div>

          {/* Quick Actions (Copy & Export) */}
          <button
            onClick={handleCopy}
            disabled={!script}
            className={`${styles.iconActionBtn} ${copied ? styles.copySuccess : ""}`}
            title="Copy Script to Clipboard"
          >
            {copied ? (
              <>
                <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={!script}
            className={styles.iconActionBtn}
            title="Download Script as .txt file"
          >
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
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
