"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import NodeGraph from "@/components/NodeGraph";
import DiffViewer from "@/components/DiffViewer";
import Teleprompter from "@/components/Teleprompter";
import HinglishViewer from "@/components/HinglishViewer";

// Define presets for the user
const PRESETS = [
  {
    name: "Tech Explainer",
    text: "In the rapidly evolving landscape of technology, staying ahead of the curve is not just an advantage; it's a necessity. The integration of artificial intelligence, machine learning, and data analytics into our daily operations is no longer a futuristic concept but a present reality. Embracing these advancements allows us to streamline processes and drive growth. However, it is imperative that we approach these technologies with a critical eye, ensuring ethical considerations are at the forefront of our strategies.",
  },
  {
    name: "Product Launch",
    text: "Today we are incredibly excited to introduce the next generation Smart-Band X9. This is not just another wearable; it is your ultimate personal health companion. Packed with advanced biometric sensors, sleep tracking algorithms, and a battery that lasts an astonishing 10 days on a single charge, it changes how you interact with your body. Best of all, it has an integrated AI coach that analyses your activity in real-time, giving you personalized fitness advice to keep you motivated.",
  },
  {
    name: "Growth Mindset",
    text: "Success is not an overnight event; it is the result of compounding small daily improvements. In a world that is changing at an exponential rate, the ability to unlearn, relearn, and adapt is your most valuable skill. If you stay in your comfort zone, you are actually moving backward. Embrace challenges, view failures not as setbacks but as data points for learning, and cultivate a mindset geared towards perpetual self-improvement. The future belongs to the curious.",
  },
];

export default function Home() {
  const [rawInput, setRawInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState<"idle" | "editor" | "scriptwriter" | "translator" | "completed">("idle");
  
  const [statuses, setStatuses] = useState<{
    editor: "idle" | "running" | "completed" | "failed";
    scriptwriter: "idle" | "running" | "completed" | "failed";
    translator: "idle" | "running" | "completed" | "failed";
  }>({
    editor: "idle",
    scriptwriter: "idle",
    translator: "idle",
  });

  const [editorResult, setEditorResult] = useState("");
  const [scriptwriterResult, setScriptwriterResult] = useState("");
  const [translatorResult, setTranslatorResult] = useState("");

  const [logs, setLogs] = useState<{ time: string; msg: string; type: "info" | "success" | "error" | "node" }[]>([]);
  const [selectedTab, setSelectedTab] = useState<"editor" | "scriptwriter" | "translator">("editor");

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const addLog = (msg: string, type: "info" | "success" | "error" | "node" = "info") => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev, { time, msg, type }]);
  };

  const handlePresetClick = (text: string) => {
    if (isProcessing) return;
    setRawInput(text);
    addLog(`Loaded preset template. Text length: ${text.length} characters.`, "info");
  };

  const triggerPipeline = async () => {
    if (isProcessing) return;
    if (!rawInput.trim()) {
      addLog("Cannot run pipeline: raw input text is empty.", "error");
      alert("Please enter or select some text first!");
      return;
    }

    // Reset state
    setIsProcessing(true);
    setActiveStage("editor");
    setStatuses({
      editor: "running",
      scriptwriter: "idle",
      translator: "idle",
    });
    setEditorResult("");
    setScriptwriterResult("");
    setTranslatorResult("");
    setSelectedTab("editor");
    setLogs([]);

    addLog("Compiling StateGraph pipeline flow...", "info");
    addLog("START node executed. Dispatching state to Editor Node.", "info");

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: rawInput }),
      });

      if (!response.ok) {
        throw new Error(`API failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream body available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          const lines = part.split("\n");
          let event = "";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              event = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.substring(6).trim();
            }
          }

          if (dataStr) {
            const data = JSON.parse(dataStr);

            if (event === "stage_start") {
              const stage = data.stage as "editor" | "scriptwriter" | "translator";
              setActiveStage(stage);
              setSelectedTab(stage);
              setStatuses((prev) => ({ ...prev, [stage]: "running" }));
              addLog(`Node [${stage.toUpperCase()}] status: RUNNING`, "node");
              addLog(data.message, "info");
            } else if (event === "chunk") {
              const stage = data.stage;
              const text = data.text;
              if (stage === "editor") {
                setEditorResult((prev) => prev + text);
              } else if (stage === "scriptwriter") {
                setScriptwriterResult((prev) => prev + text);
              } else if (stage === "translator") {
                setTranslatorResult((prev) => prev + text);
              }
            } else if (event === "stage_complete") {
              const stage = data.stage as "editor" | "scriptwriter" | "translator";
              setStatuses((prev) => ({ ...prev, [stage]: "completed" }));
              
              if (stage === "editor") {
                setEditorResult(data.result);
                addLog("Editor Node completed grammar review and tone tuning.", "success");
              } else if (stage === "scriptwriter") {
                setScriptwriterResult(data.result);
                addLog("Scriptwriter Node completed hook composition.", "success");
              } else if (stage === "translator") {
                setTranslatorResult(data.result);
                addLog("Translator Node completed Hinglish localization.", "success");
              }
              
              addLog(`Node [${stage.toUpperCase()}] status: COMPLETED`, "success");
            } else if (event === "pipeline_complete") {
              setActiveStage("completed");
              setIsProcessing(false);
              addLog("END node executed. Pipeline flow finished successfully.", "success");
              addLog(data.message, "success");
            } else if (event === "error") {
              setIsProcessing(false);
              const active = activeStage === "idle" || activeStage === "completed" ? "editor" : activeStage;
              setStatuses((prev) => ({ ...prev, [active]: "failed" }));
              addLog(`Error during pipeline processing: ${data.message}`, "error");
            }
          }
        }
      }
    } catch (err: any) {
      setIsProcessing(false);
      const active = activeStage === "idle" || activeStage === "completed" ? "editor" : activeStage;
      setStatuses((prev) => ({ ...prev, [active]: "failed" }));
      addLog(`Execution pipeline aborted: ${err.message || err}`, "error");
    }
  };

  return (
    <main className={styles.mainContainer}>
      {/* Header section */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <span className={styles.logoText}>SEQUENTIA</span>
          <span className={styles.logoBadge}>AI Engine</span>
        </div>
        <div className={styles.headerStatus}>
          <span className={styles.statusIndicatorDot} style={{
            background: isProcessing ? "var(--secondary)" : activeStage === "completed" ? "var(--success)" : "rgba(255, 255, 255, 0.2)"
          }}></span>
          <span className={styles.statusText}>
            {isProcessing ? "Processing Pipeline..." : activeStage === "completed" ? "Idle (Last run successful)" : "Ready"}
          </span>
        </div>
      </header>

      {/* Main Workspace grid */}
      <div className={styles.workspaceGrid}>
        
        {/* Left column: input, presets, logs */}
        <section className={styles.controlColumn}>
          <div className={`${styles.card} glass-panel`}>
            <h2 className={styles.cardTitle}>Raw Content Feed</h2>
            <p className={styles.cardDescription}>Input your raw draft text or choose a pre-configured scenario preset below.</p>
            
            {/* Presets */}
            <div className={styles.presetsRow}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset.text)}
                  disabled={isProcessing}
                  className={styles.presetBtn}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className={styles.inputWrapper}>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Type or paste your raw tech/business draft text here..."
                className={styles.textarea}
              />
              <div className={styles.textareaStats}>
                <span>{rawInput.length} chars</span>
                <span>{rawInput.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              onClick={triggerPipeline}
              disabled={isProcessing}
              className={`${styles.triggerBtn} ${isProcessing ? styles.triggerBtnRunning : ""}`}
            >
              <div className={styles.btnGlow}></div>
              <span>{isProcessing ? "Synthesizing Pipeline Flow..." : "Execute Sequential Pipeline"}</span>
            </button>
          </div>

          {/* Terminal Console Log */}
          <div className={`${styles.card} ${styles.consoleCard} glass-panel`}>
            <div className={styles.consoleHeader}>
              <h2 className={styles.cardTitle}>Agent Execution Terminal</h2>
              <span className={styles.consoleBlink}>LOGS_STREAM: ACTIVE</span>
            </div>
            <div className={styles.consoleContent}>
              {logs.length === 0 ? (
                <div className={styles.consolePlaceholder}>
                  Console idle. Press "Execute Sequential Pipeline" to trigger agent logs.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`${styles.consoleLine} ${styles[log.type]}`}>
                    <span className={styles.logTime}>[{log.time}]</span>{" "}
                    <span className={styles.logMsg}>{log.msg}</span>
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </section>

        {/* Right column: node graph and tabs output */}
        <section className={styles.displayColumn}>
          {/* Node Graph Panel */}
          <div className={`${styles.card} ${styles.graphCard} glass-panel`}>
            <h2 className={styles.cardTitle}>LangGraph Pipeline Sequence</h2>
            <NodeGraph 
              activeStage={activeStage} 
              statuses={statuses} 
              onSelectNode={(node) => setSelectedTab(node)}
            />
          </div>

          {/* Tab Outputs Panel */}
          <div className={`${styles.card} ${styles.outputsCard} glass-panel`}>
            {/* Tabs selector */}
            <div className={styles.tabsRow}>
              <button
                onClick={() => setSelectedTab("editor")}
                className={`${styles.tabBtn} ${selectedTab === "editor" ? styles.activeTab : ""} ${statuses.editor === "completed" ? styles.completedTab : ""}`}
              >
                1. Editor Output
                {statuses.editor === "running" && <span className={styles.tabSpinner}></span>}
              </button>
              <button
                onClick={() => setSelectedTab("scriptwriter")}
                className={`${styles.tabBtn} ${selectedTab === "scriptwriter" ? styles.activeTab : ""} ${statuses.scriptwriter === "completed" ? styles.completedTab : ""}`}
              >
                2. YouTuber Hook
                {statuses.scriptwriter === "running" && <span className={styles.tabSpinner}></span>}
              </button>
              <button
                onClick={() => setSelectedTab("translator")}
                className={`${styles.tabBtn} ${selectedTab === "translator" ? styles.activeTab : ""} ${statuses.translator === "completed" ? styles.completedTab : ""}`}
              >
                3. Hinglish Script
                {statuses.translator === "running" && <span className={styles.tabSpinner}></span>}
              </button>
            </div>

            {/* Tab content panel */}
            <div className={styles.tabContentPanel}>
              {selectedTab === "editor" && (
                <DiffViewer original={rawInput} edited={editorResult} />
              )}
              {selectedTab === "scriptwriter" && (
                <Teleprompter script={scriptwriterResult} />
              )}
              {selectedTab === "translator" && (
                <HinglishViewer text={translatorResult} />
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
