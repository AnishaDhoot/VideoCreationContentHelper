"use client";

import React from "react";
import styles from "./ScoreBoard.module.css";

interface ScoreBoardProps {
  scores: {
    retention: number;
    pacing: number;
    resonance: number;
  };
  tips: string[];
}

export default function ScoreBoard({ scores, tips }: ScoreBoardProps) {
  // SVG circular properties
  const radius = 30;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;

  const scoreItems = [
    {
      id: "retention",
      label: "Retention Hook",
      desc: "First 3-sec interest grasp",
      score: scores?.retention || 0,
      color: "var(--secondary)",
    },
    {
      id: "pacing",
      label: "Word Pacing",
      desc: "Economy & speed flow",
      score: scores?.pacing || 0,
      color: "var(--primary)",
    },
    {
      id: "resonance",
      label: "Linguistic Charm",
      desc: "Hinglish code-switch quality",
      score: scores?.resonance || 0,
      color: "var(--accent)",
    },
  ];

  return (
    <div className={styles.scoreboardContainer}>
      <h4 className={styles.boardTitle}>Performance Metrics</h4>

      {/* Progress Circles Grid */}
      <div className={styles.circlesGrid}>
        {scoreItems.map((item) => {
          const strokeDashoffset = circumference - (item.score / 100) * circumference;
          
          return (
            <div key={item.id} className={styles.circleCard}>
              <div className={styles.svgWrapper}>
                <svg className={styles.svg} width="80" height="80" viewBox="0 0 80 80">
                  {/* Background track circle */}
                  <circle
                    className={styles.circleTrack}
                    cx="40"
                    cy="40"
                    r={radius}
                    strokeWidth={strokeWidth}
                  />
                  {/* Glowing progress circle */}
                  <circle
                    className={styles.circleProgress}
                    cx="40"
                    cy="40"
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    stroke={item.color}
                    style={{ filter: `drop-shadow(0 0 4px ${item.color})` }}
                  />
                </svg>
                <div className={styles.scoreText} style={{ color: item.color }}>
                  {item.score}%
                </div>
              </div>
              <div className={styles.meta}>
                <div className={styles.label}>{item.label}</div>
                <div className={styles.desc}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Feedback Bullet Tips */}
      <div className={styles.tipsPanel}>
        <div className={styles.tipsHeader}>
          <svg className={styles.tipIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            <circle cx="12" cy="12" r="4"></circle>
          </svg>
          <span className={styles.tipsTitle}>Actionable Improvements</span>
        </div>
        <ul className={styles.tipsList}>
          {tips && tips.length > 0 ? (
            tips.map((tip, idx) => (
              <li key={idx} className={styles.tipItem}>
                <span className={styles.tipBullet}></span>
                <span className={styles.tipText}>{tip}</span>
              </li>
            ))
          ) : (
            <li className={styles.tipItemPlaceholder}>No feedback generated. Run the pipeline to get metrics.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
