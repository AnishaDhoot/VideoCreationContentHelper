"use client";

import React from "react";
import styles from "./Storyboard.module.css";

interface StoryboardItem {
  time: string;
  visual: string;
  sfx: string;
}

interface StoryboardProps {
  storyboard: StoryboardItem[];
}

export default function Storyboard({ storyboard }: StoryboardProps) {
  return (
    <div className={styles.storyboardContainer}>
      <h4 className={styles.boardTitle}>Cinematic Storyboard & Audio Cues</h4>

      <div className={styles.timeline}>
        {storyboard && storyboard.length > 0 ? (
          storyboard.map((item, idx) => (
            <div key={idx} className={styles.timelineItem}>
              {/* Timeline dot */}
              <div className={styles.timelineMarker}>
                <div className={styles.markerInner}></div>
              </div>

              {/* Storyboard card */}
              <div className={styles.storyCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.timeBadge}>{item.time}</span>
                  <span className={styles.frameLabel}>FRAME #{idx + 1}</span>
                </div>
                
                <div className={styles.cardContent}>
                  {/* Visual cue section */}
                  <div className={styles.cueSection}>
                    <div className={styles.cueHeader} style={{ color: "var(--secondary)" }}>
                      <svg className={styles.cueIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 7l-7 5 7 5V7z"></path>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                      Visual Trigger & B-Roll
                    </div>
                    <p className={styles.cueText}>{item.visual}</p>
                  </div>

                  {/* Sound FX cue section */}
                  <div className={styles.cueSection}>
                    <div className={styles.cueHeader} style={{ color: "var(--accent)" }}>
                      <svg className={styles.cueIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4"></path>
                      </svg>
                      Audio FX & SFX
                    </div>
                    <p className={styles.cueText}>{item.sfx}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.placeholder}>
            Storyboard timeline is idle. Execute the pipeline to synthesize cues!
          </div>
        )}
      </div>
    </div>
  );
}
