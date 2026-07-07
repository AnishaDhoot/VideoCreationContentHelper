"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./HinglishViewer.module.css";

interface HinglishViewerProps {
  text: string;
}

interface ElevenVoice {
  voice_id: string;
  name: string;
  lang: string;
  isEleven: boolean;
}

// Common Romanized Hindi words
const HINDI_WORDS = new Set([
  "dosto", "aaj", "hum", "aap", "tum", "main", "mujhe", "apna", "apni", "apne", "mera", "meri", "mere",
  "hai", "hain", "tha", "the", "thi", "ho", "bhi", "hi", "na", "ne", "se", "ka", "ki", "ke", "ko", "par",
  "aur", "toh", "ya", "lekin", "magar", "parantu", "kuch", "ek", "do", "tin", "char", "sab", "sabhi",
  "kya", "kyun", "kab", "ab", "jab", "tab", "kaise", "kahan", "kis", "kise", "kisko", "kiske",
  "karna", "kar", "karte", "karta", "karti", "karke", "kiya", "kiye", "kiyi", "hona", "hota", "hotaa", "hoti", "hote",
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
  const [elevenVoices, setElevenVoices] = useState<ElevenVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load ElevenLabs voices dynamically from account
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch("/api/voices");
        if (res.ok) {
          const data = await res.json();
          if (data.voices && data.voices.length > 0) {
            setElevenVoices(data.voices);
            setSelectedVoiceName(data.voices[0].voice_id);
          }
        }
      } catch (err) {
        console.error("Failed to load ElevenLabs voices list", err);
      }
    };
    
    fetchVoices();
  }, []);

  // Initialize Speech Synthesis & Load Browser Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        
        const filtered = allVoices.filter(v => 
          v.lang.startsWith("hi") || v.lang.startsWith("en")
        );

        const sorted = [...filtered].sort((a, b) => {
          const isANatural = /natural|online|google|neural/i.test(a.name);
          const isBNatural = /natural|online|google|neural/i.test(b.name);
          if (isANatural && !isBNatural) return -1;
          if (!isANatural && isBNatural) return 1;
          return 0;
        });
        
        setVoices(sorted.length > 0 ? sorted : allVoices);

        // Set default browser voice if ElevenLabs voices are empty
        if (selectedVoiceName === "" && elevenVoices.length === 0 && sorted.length > 0) {
          const hiVoice = sorted.find(v => v.lang.startsWith("hi"));
          const enInVoice = sorted.find(v => v.lang.toLowerCase().includes("en-in"));
          setSelectedVoiceName(hiVoice?.name || enInVoice?.name || sorted[0].name);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      stopAllAudio();
    };
  }, [elevenVoices, selectedVoiceName]);

  // Stop playback on text changes
  useEffect(() => {
    stopAllAudio();
  }, [text]);

  const stopAllAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setErrorMessage(null);
  };

  const speakWithBrowserFallback = () => {
    if (!synthRef.current || !text) return;
    
    const hiVoice = voices.find(v => v.lang.startsWith("hi"));
    const enInVoice = voices.find(v => v.lang.toLowerCase().includes("en-in"));
    const fallbackVoice = hiVoice || enInVoice || voices[0] || null;

    synthRef.current.cancel();

    const cleanText = text.replace(/[*_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (fallbackVoice) {
      utterance.voice = fallbackVoice;
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

  const handlePlay = async () => {
    if (!text) return;
    setErrorMessage(null);

    const isElevenVoiceSelected = elevenVoices.some(v => v.voice_id === selectedVoiceName);

    // If currently playing, perform pause/stop
    if (isPlaying) {
      if (isElevenVoiceSelected && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (synthRef.current) {
        synthRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    // Resume if paused
    if (isElevenVoiceSelected && audioRef.current && audioRef.current.paused && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    } else if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
      return;
    }

    stopAllAudio();

    // 1. ELEVENLABS SCENARIO
    if (isElevenVoiceSelected) {
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text, voice_id: selectedVoiceName }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to synthesize speech via ElevenLabs API");
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          setErrorMessage("Failed to play synthesized audio. Falling back to local browser voice...");
          speakWithBrowserFallback();
        };

        audioRef.current = audio;
        audio.play();
      } catch (err: any) {
        setErrorMessage(err.message || "ElevenLabs synthesis failed. Falling back to browser's free online voice...");
        speakWithBrowserFallback();
      }
    } 
    // 2. LOCAL BROWSER SCENARIO
    else {
      const browserVoice = voices.find(v => v.name === selectedVoiceName);
      if (!synthRef.current) return;

      const cleanText = text.replace(/[*_`]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      if (browserVoice) {
        utterance.voice = browserVoice;
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
    }
  };

  const handleStop = () => {
    stopAllAudio();
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy script", err);
    }
  };

  const handleDownload = () => {
    if (!text) return;
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "youtube_hinglish_script.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const analyzedWords = useMemo(() => {
    if (!text) return [];

    const words = text.split(/(\s+)/);

    return words.map((token) => {
      if (/^\s+$/.test(token)) {
        return { text: token, type: "space" as const };
      }

      const cleanWord = token.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, "");

      if (cleanWord === "") {
        return { text: token, type: "neutral" as const };
      }

      if (HINDI_WORDS.has(cleanWord)) {
        return { text: token, type: "hindi" as const };
      }

      if (ENGLISH_WORDS.has(cleanWord) || cleanWord.length > 5 && !cleanWord.endsWith("na") && !cleanWord.endsWith("ta")) {
        return { text: token, type: "english" as const };
      }

      return { text: token, type: "neutral" as const };
    });
  }, [text]);

  const isElevenVoiceActive = useMemo(() => {
    return elevenVoices.some(v => v.voice_id === selectedVoiceName);
  }, [elevenVoices, selectedVoiceName]);

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

          <div className={styles.actionDivider}></div>

          {/* Quick Actions (Copy & Export) */}
          <button
            onClick={handleCopy}
            disabled={!text}
            className={`${styles.iconActionBtn} ${copied ? styles.copySuccess : ""}`}
            title="Copy Hinglish Script to Clipboard"
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
            disabled={!text}
            className={styles.iconActionBtn}
            title="Download Hinglish Script as .txt file"
          >
            <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
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
              value={selectedVoiceName}
              onChange={(e) => {
                setSelectedVoiceName(e.target.value);
                stopAllAudio();
              }}
              disabled={!text}
              className={styles.voiceSelect}
            >
              {elevenVoices.map((voice) => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </option>
              ))}
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
              disabled={!text || isElevenVoiceActive}
              onChange={(e) => setRate(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>
      </div>

      {/* Error / Fallback Warning Message */}
      {errorMessage && (
        <div className={styles.warningMessage}>
          <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path>
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

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
