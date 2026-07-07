"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  "bahut", "kam", "zyaada", "zyaadaa", "bilkul", "thoda", "poora", "adhura", "sach", "jhooth", "nayan",
  "bhai", "behen", "dost", "yaar", "guru", "shishya", "namaste", "shuruaat", "shuru", "khatam"
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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis & Load Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        
        // Filter primarily for Hindi (hi) and Indian English (en-IN) / global English (en) voices
        const filtered = allVoices.filter(v => 
          v.lang.startsWith("hi") || v.lang.startsWith("en")
        );
        
        setVoices(filtered.length > 0 ? filtered : allVoices);

        // Heuristically pick the best default voice
        // 1. A Hindi voice (e.g. hi-IN)
        // 2. An Indian English voice (en-IN)
        // 3. Any English voice (en-US)
        const hiVoice = filtered.find(v => v.lang.startsWith("hi"));
        const enInVoice = filtered.find(v => v.lang.toLowerCase().includes("en-in"));
        const enVoice = filtered.find(v => v.lang.startsWith("en"));
        
        setSelectedVoice(hiVoice || enInVoice || enVoice || allVoices[0] || null);
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Listen to text changes to reset audio state
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  }, [text]);

  const handlePlay = () => {
    if (!synthRef.current || !text) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // Resume if paused
    if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
      return;
    }

    // Start fresh synthesis
    synthRef.current.cancel();
    
    // Web Speech synthesis handles plain text. We clean some markdown/special chars if present
    const cleanText = text.replace(/[*_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  const analyzedWords = useMemo(() => {
    if (!text) return [];

    // Split by words and keep whitespace attached for display
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
      {/* Header Panel */}
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

      {/* Audio TTS controls bar */}
      <div className={styles.audioBar}>
        <div className={styles.audioControlsLeft}>
          <button
            onClick={handlePlay}
            disabled={!text}
            className={`${styles.audioBtn} ${isPlaying ? styles.pauseBtn : styles.playBtn}`}
          >
            {isPlaying ? "Pause Audio" : "Listen to Script"}
          </button>
          <button
            onClick={handleStop}
            disabled={!text}
            className={styles.stopBtn}
          >
            Stop
          </button>
        </div>

        {/* Waveform Animation */}
        <div className={styles.waveformContainer}>
          <div className={`${styles.waveform} ${isPlaying ? styles.wavePlaying : ""}`}>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
            <span className={styles.waveBar}></span>
          </div>
        </div>

        <div className={styles.audioControlsRight}>
          {/* Voice selector */}
          <div className={styles.controlItem}>
            <label className={styles.label}>Voice:</label>
            <select
              value={selectedVoice?.name || ""}
              onChange={(e) => {
                const v = voices.find(voice => voice.name === e.target.value);
                if (v) setSelectedVoice(v);
              }}
              disabled={!text}
              className={styles.voiceSelect}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed / Rate control */}
          <div className={styles.controlItem}>
            <label className={styles.label}>Speed: {rate}x</label>
            <input
              type="range"
              min="0.6"
              max="1.8"
              step="0.1"
              value={rate}
              disabled={!text}
              onChange={(e) => setRate(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>
      </div>

      {/* Content Panel */}
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
