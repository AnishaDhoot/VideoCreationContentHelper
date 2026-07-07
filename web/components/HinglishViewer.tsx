"use client";

import React, { useMemo } from "react";
import styles from "./HinglishViewer.module.css";

interface HinglishViewerProps {
  text: string;
}

// Common Romanized Hindi words
const HINDI_WORDS = new Set([
  "dosto", "aaj", "hum", "aap", "tum", "main", "mujhe", "apna", "apni", "apne", "mera", "meri", "mere",
  "hai", "hain", "tha", "the", "thi", "ho", "bhi", "hi", "na", "ne", "se", "ka", "ki", "ke", "ko", "par",
  "aur", "toh", "ya", "lekin", "magar", "parantu", "kuch", "ek", "do", "tin", "char", "sab", "sabhi",
  "kya", "kyun", "kab", "ab", "jab", "tab", "kaise", "kahan", "kis", "kise", "kisko", "kiske",
  "karna", "kar", "karte", "karta", "karti", "karke", "kiya", "kiye", "kiyi", "hona", "hota", "hoti", "hote",
  "raha", "rahe", "rahi", "gaya", "gaye", "gayi", "chahiye", "sakte", "sakta", "sakti", "sako", "sake",
  "log", "logon", "baat", "kaam", "naam", "vakt", "samay", "soch", "sochna", "samajh", "samajhna",
  "bana", "banana", "chal", "chalna", "de", "dena", "le", "lena", "aao", "aana", "jaao", "jaana",
  "bol", "bolna", "kah", "kahna", "sun", "sunna", "dekh", "dekhna", "likh", "likhna", "padh", "padhna",
  "bahut", "kam", "zyaada", "kam", "bilkul", "thoda", "poora", "adhura", "sach", "jhooth", "nayan",
  "bhai", "behen", "dost", "yaar", "guru", "shishya"
]);

// Common English tech and business words typically used in tech Hinglish
const ENGLISH_WORDS = new Set([
  "ai", "technology", "future", "learning", "data", "analytics", "growth", "responsibility",
  "adapt", "innovate", "integration", "machine", "operations", "concept", "reality", "advancements",
  "streamline", "processes", "enhance", "decision", "making", "power", "ethical", "considerations",
  "forefront", "strategies", "fostering", "culture", "continuous", "adaptability", "harness",
  "potential", "technological", "innovation", "mitigating", "risks", "conclusion", "mindset",
  "perpetual", "improvement", "change", "leverage", "cutting", "edge", "tools", "cultivate",
  "youtube", "video", "creator", "hook", "script", "intro", "outro", "subscribe", "like", "share"
]);

export default function HinglishViewer({ text }: HinglishViewerProps) {
  const analyzedWords = useMemo(() => {
    if (!text) return [];

    // Split by words and keep punctuation attached for display
    const words = text.split(/(\s+)/);

    return words.map((token) => {
      // Check if it is whitespace
      if (/^\s+$/.test(token)) {
        return { text: token, type: "space" as const };
      }

      // Strip punctuation to classify
      const cleanWord = token.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "");

      if (cleanWord === "") {
        return { text: token, type: "neutral" as const };
      }

      if (HINDI_WORDS.has(cleanWord)) {
        return { text: token, type: "hindi" as const };
      }

      if (ENGLISH_WORDS.has(cleanWord) || cleanWord.length > 5 && !cleanWord.endsWith("na") && !cleanWord.endsWith("ta")) {
        // Assume longer non-typical Hindi ending words are English in this context
        return { text: token, type: "english" as const };
      }

      return { text: token, type: "neutral" as const };
    });
  }, [text]);

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.viewerHeader}>
        <h3 className={styles.title}>Linguistic Translation Analyzer</h3>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotHindi}`}></span> Hindi Connectives
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotEnglish}`}></span> English/Tech Terms
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.dotNeutral}`}></span> General Phrases
          </span>
        </div>
      </div>

      <div className={styles.contentArea}>
        {text ? (
          <div className={styles.textContent}>
            {analyzedWords.map((item, idx) => {
              if (item.type === "space") {
                return item.text;
              }
              if (item.type === "hindi") {
                return (
                  <span key={idx} className={styles.hindiWord}>
                    {item.text}
                  </span>
                );
              }
              if (item.type === "english") {
                return (
                  <span key={idx} className={styles.englishWord}>
                    {item.text}
                  </span>
                );
              }
              return <span key={idx}>{item.text}</span>;
            })}
          </div>
        ) : (
          <div className={styles.placeholder}>
            Translation node output has not been synthesized yet. Start the pipeline to see it!
          </div>
        )}
      </div>
    </div>
  );
}
