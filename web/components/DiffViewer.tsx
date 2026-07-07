"use client";

import React, { useState, useMemo } from "react";
import styles from "./DiffViewer.module.css";

interface DiffViewerProps {
  original: string;
  edited: string;
}

export default function DiffViewer({ original, edited }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<"split" | "inline">("split");
  const [copied, setCopied] = useState(false);

  // Copy polished text to clipboard
  const handleCopy = async () => {
    if (!edited) return;
    try {
      await navigator.clipboard.writeText(edited);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  // Calculate word-level diff using LCS algorithm
  const diffItems = useMemo(() => {
    if (!original) return [{ type: "added" as const, text: edited }];
    if (!edited) return [{ type: "removed" as const, text: original }];

    const oldWords = original.split(/(\s+)/); // keep whitespace
    const newWords = edited.split(/(\s+)/);

    const oldFiltered = oldWords.filter(w => w !== "");
    const newFiltered = newWords.filter(w => w !== "");

    const dp: number[][] = Array(oldFiltered.length + 1)
      .fill(0)
      .map(() => Array(newFiltered.length + 1).fill(0));

    for (let i = 1; i <= oldFiltered.length; i++) {
      for (let j = 1; j <= newFiltered.length; j++) {
        if (oldFiltered[i - 1] === newFiltered[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    let i = oldFiltered.length;
    let j = newFiltered.length;
    const result: { type: "added" | "removed" | "common"; text: string }[] = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldFiltered[i - 1] === newFiltered[j - 1]) {
        result.unshift({ type: "common", text: oldFiltered[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: "added", text: newFiltered[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
        result.unshift({ type: "removed", text: oldFiltered[i - 1] });
        i--;
      }
    }

    return result;
  }, [original, edited]);

  return (
    <div className={styles.diffContainer}>
      <div className={styles.diffHeader}>
        <h3 className={styles.title}>Editing Stage Output</h3>
        <div className={styles.headerActions}>
          <div className={styles.toggleButtons}>
            <button
              onClick={() => setViewMode("split")}
              className={`${styles.modeBtn} ${viewMode === "split" ? styles.activeMode : ""}`}
            >
              Split Screen
            </button>
            <button
              onClick={() => setViewMode("inline")}
              className={`${styles.modeBtn} ${viewMode === "inline" ? styles.activeMode : ""}`}
            >
              Inline Diff
            </button>
          </div>
          
          <button
            onClick={handleCopy}
            disabled={!edited}
            className={`${styles.copyBtn} ${copied ? styles.copySuccess : ""}`}
            title="Copy Polished Text to Clipboard"
          >
            {copied ? (
              <>
                <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Polished
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === "split" ? (
        <div className={styles.splitView}>
          <div className={styles.pane}>
            <div className={styles.paneLabel} style={{ borderColor: "var(--accent)" }}>
              ORIGINAL RAW INPUT
            </div>
            <div className={styles.paneContent}>{original || "Waiting for input..."}</div>
          </div>
          <div className={styles.pane}>
            <div className={styles.paneLabel} style={{ borderColor: "var(--success)" }}>
              POLISHED TEXT
            </div>
            <div className={`${styles.paneContent} ${styles.polished}`}>
              {edited || "Editor stage has not completed yet."}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.inlineView}>
          <div className={styles.inlineContent}>
            {!original && !edited && <span className={styles.placeholder}>Waiting for execution...</span>}
            {diffItems.map((item, idx) => {
              if (item.type === "added") {
                return (
                  <ins key={idx} className={styles.addedWord}>
                    {item.text}
                  </ins>
                );
              }
              if (item.type === "removed") {
                return (
                  <del key={idx} className={styles.removedWord}>
                    {item.text}
                  </del>
                );
              }
              return <span key={idx}>{item.text}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
