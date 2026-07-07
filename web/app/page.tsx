"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import NodeGraph from "@/components/NodeGraph";
import DiffViewer from "@/components/DiffViewer";
import Teleprompter from "@/components/Teleprompter";
import HinglishViewer from "@/components/HinglishViewer";
import ScoreBoard from "@/components/ScoreBoard";
import Storyboard from "@/components/Storyboard";

// Define presets for the user
const PRESETS = [
  {
    name: "Tech AI Explainer",
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
  {
    name: "Finance & Coding",
    text: "Passive income is the holy grail of financial freedom, but most people approach it all wrong. They think it means sitting on a beach while money falls from the sky. In reality, building a passive revenue stream requires massive active work upfront. Whether you are coding a SaaS product, writing an e-book, or launching a YouTube channel, you have to build an asset that solves a real problem for real people. Focus on value creation first, and financial return will follow naturally.",
  },
  {
    name: "Cybersecurity Tips",
    text: "Your personal data is being traded like a commodity, and most passwords are breached in under three seconds. Relying on simple passwords or reusing them across accounts is an open invitation to identity theft. In this digital era, enabling multi-factor authentication, utilizing a secure password manager, and understanding how to spot phishing links are basic hygiene skills. Don't wait for a data breach to take your cybersecurity seriously. Lock down your digital life today.",
  },
];

interface AnalyzerData {
  scores: { retention: number; pacing: number; resonance: number };
  tips: string[];
  storyboard: { time: string; visual: string; sfx: string }[];
}

export default function Home() {
  const [rawInput, setRawInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStage, setActiveStage] = useState<"idle" | "editor" | "scriptwriter" | "translator" | "analyzer" | "completed">("idle");
  
  const [statuses, setStatuses] = useState<{
    editor: "idle" | "running" | "completed" | "failed";
    scriptwriter: "idle" | "running" | "completed" | "failed";
    translator: "idle" | "running" | "completed" | "failed";
    analyzer: "idle" | "running" | "completed" | "failed";
  }>({
    editor: "idle",
    scriptwriter: "idle",
    translator: "idle",
    analyzer: "idle",
  });

  const [editorResult, setEditorResult] = useState("");
  const [scriptwriterResult, setScriptwriterResult] = useState("");
  const [translatorResult, setTranslatorResult] = useState("");
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerData | null>(null);

  const [logs, setLogs] = useState<{ time: string; msg: string; type: "info" | "success" | "error" | "node" }[]>([]);
  const [selectedTab, setSelectedTab] = useState<"editor" | "scriptwriter" | "translator" | "analyzer">("editor");
  const [rightPanelTab, setRightPanelTab] = useState<"analytics" | "storyboard">("analytics");

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
      analyzer: "idle",
    });
    setEditorResult("");
    setScriptwriterResult("");
    setTranslatorResult("");
    setAnalyzerResult(null);
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
              const stage = data.stage as "editor" | "scriptwriter" | "translator" | "analyzer";
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
              const stage = data.stage as "editor" | "scriptwriter" | "translator" | "analyzer";
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
              } else if (stage === "analyzer") {
                setAnalyzerResult(data.result);
                addLog("Analyzer Node completed performance metrics scoring and storyboarding.", "success");
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
              <button
                onClick={() => setSelectedTab("analyzer")}
                className={`${styles.tabBtn} ${selectedTab === "analyzer" ? styles.activeTab : ""} ${statuses.analyzer === "completed" ? styles.completedTab : ""}`}
              >
                4. AI Analysis
                {statuses.analyzer === "running" && <span className={styles.tabSpinner}></span>}
              </button>
            </div>

            {/* Tab content panel */}
            <div className={styles.tabContentPanel}>
              {selectedTab === "editor" && (
                <div className={styles.singleTabWrapper}>
                  <DiffViewer original={rawInput} edited={editorResult} />
                </div>
              )}
              
              {selectedTab === "scriptwriter" && (
                <div className={styles.splitTabWrapper}>
                  {/* Left: Teleprompter */}
                  <div className={styles.leftContentPane}>
                    <Teleprompter script={scriptwriterResult} />
                  </div>
                  {/* Right: Sub-tabbed Analytics */}
                  <div className={styles.rightAnalyticsPane}>
                    <div className={styles.subTabsHeader}>
                      <button
                        onClick={() => setRightPanelTab("analytics")}
                        className={`${styles.subTabBtn} ${rightPanelTab === "analytics" ? styles.activeSubTab : ""}`}
                      >
                        AI Scores
                      </button>
                      <button
                        onClick={() => setRightPanelTab("storyboard")}
                        className={`${styles.subTabBtn} ${rightPanelTab === "storyboard" ? styles.activeSubTab : ""}`}
                      >
                        B-Roll Cues
                      </button>
                    </div>
                    <div className={styles.subTabContent}>
                      {analyzerResult ? (
                        rightPanelTab === "analytics" ? (
                          <ScoreBoard scores={analyzerResult.scores} tips={analyzerResult.tips} />
                        ) : (
                          <Storyboard storyboard={analyzerResult.storyboard} />
                        )
                      ) : (
                        <div className={styles.analyticsPlaceholder}>
                          {statuses.analyzer === "running" ? (
                            <div className={styles.analyzingLoader}>
                              <div className={styles.spinner}></div>
                              <p>Generating AI Hook Analytics & Storyboard Cues...</p>
                            </div>
                          ) : (
                            <p>No analytics data loaded. Execute the content pipeline to trigger analysis.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTab === "translator" && (
                <div className={styles.splitTabWrapper}>
                  {/* Left: Hinglish script + TTS audio player */}
                  <div className={styles.leftContentPane}>
                    <HinglishViewer text={translatorResult} />
                  </div>
                  {/* Right: Sub-tabbed Analytics */}
                  <div className={styles.rightAnalyticsPane}>
                    <div className={styles.subTabsHeader}>
                      <button
                        onClick={() => setRightPanelTab("analytics")}
                        className={`${styles.subTabBtn} ${rightPanelTab === "analytics" ? styles.activeSubTab : ""}`}
                      >
                        AI Scores
                      </button>
                      <button
                        onClick={() => setRightPanelTab("storyboard")}
                        className={`${styles.subTabBtn} ${rightPanelTab === "storyboard" ? styles.activeSubTab : ""}`}
                      >
                        B-Roll Cues
                      </button>
                    </div>
                    <div className={styles.subTabContent}>
                      {analyzerResult ? (
                        rightPanelTab === "analytics" ? (
                          <ScoreBoard scores={analyzerResult.scores} tips={analyzerResult.tips} />
                        ) : (
                          <Storyboard storyboard={analyzerResult.storyboard} />
                        )
                      ) : (
                        <div className={styles.analyticsPlaceholder}>
                          {statuses.analyzer === "running" ? (
                            <div className={styles.analyzingLoader}>
                              <div className={styles.spinner}></div>
                              <p>Generating AI Hook Analytics & Storyboard Cues...</p>
                            </div>
                          ) : (
                            <p>No analytics data loaded. Execute the content pipeline to trigger analysis.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === "analyzer" && (
                <div className={styles.singleTabWrapper}>
                  {analyzerResult ? (
                    <div className={styles.fullAnalysisGrid}>
                      <div className={styles.gridCol}>
                        <ScoreBoard scores={analyzerResult.scores} tips={analyzerResult.tips} />
                      </div>
                      <div className={styles.gridCol}>
                        <Storyboard storyboard={analyzerResult.storyboard} />
                      </div>
                    </div>
                  ) : (
                    <div className={styles.analyticsPlaceholder}>
                      {statuses.analyzer === "running" ? (
                        <div className={styles.analyzingLoader}>
                          <div className={styles.spinner}></div>
                          <p>Synthesizing AI Engagement Metrics & Storyboards...</p>
                        </div>
                      ) : (
                        <p>No analytics data loaded. Execute the content pipeline to trigger analysis.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
