"use client";

import React from "react";
import styles from "./NodeGraph.module.css";

interface NodeGraphProps {
  activeStage: "idle" | "editor" | "scriptwriter" | "translator" | "analyzer" | "completed";
  statuses: {
    editor: "idle" | "running" | "completed" | "failed";
    scriptwriter: "idle" | "running" | "completed" | "failed";
    translator: "idle" | "running" | "completed" | "failed";
    analyzer: "idle" | "running" | "completed" | "failed";
  };
  onSelectNode: (node: "editor" | "scriptwriter" | "translator" | "analyzer") => void;
}

export default function NodeGraph({ activeStage, statuses, onSelectNode }: NodeGraphProps) {
  const nodes = [
    { id: "start", label: "START", type: "system", status: "completed" as const },
    { id: "editor", label: "EDITOR Node", type: "worker", status: statuses.editor },
    { id: "scriptwriter", label: "SCRIPTWRITER Node", type: "worker", status: statuses.scriptwriter },
    { id: "translator", label: "TRANSLATOR Node", type: "worker", status: statuses.translator },
    { id: "analyzer", label: "ANALYZER Node", type: "worker", status: statuses.analyzer },
    { id: "end", label: "END", type: "system", status: activeStage === "completed" ? "completed" as const : "idle" as const },
  ];

  return (
    <div className={styles.graphContainer}>
      <div className={styles.nodesRow}>
        {nodes.map((node, index) => {
          const isWorker = node.type === "worker";
          const nodeStatus = node.status;
          
          return (
            <React.Fragment key={node.id}>
              {/* Connection Line */}
              {index > 0 && (
                <div 
                  className={`${styles.connectorLine} ${
                    nodeStatus === "completed" || nodeStatus === "running"
                      ? styles.connectorLineActive
                      : ""
                  } ${nodeStatus === "running" ? styles.connectorLineFlowing : ""}`}
                >
                  <div className={styles.flowParticle}></div>
                </div>
              )}

              {/* Node Card */}
              <div
                className={`${styles.nodeCard} ${styles[node.id]} ${
                  styles[nodeStatus]
                } ${activeStage === node.id ? styles.activeNode : ""} ${
                  isWorker ? styles.clickable : ""
                }`}
                onClick={() => {
                  if (isWorker) {
                    onSelectNode(node.id as "editor" | "scriptwriter" | "translator" | "analyzer");
                  }
                }}
              >
                <div className={styles.glowBg}></div>
                <div className={styles.nodeIcon}>
                  {nodeStatus === "running" && <div className={styles.spinner}></div>}
                  {nodeStatus === "completed" && <span className={styles.checkIcon}>✓</span>}
                  {nodeStatus === "failed" && <span className={styles.failIcon}>✕</span>}
                  {nodeStatus === "idle" && <span className={styles.idleIcon}>○</span>}
                </div>
                <div className={styles.nodeMeta}>
                  <div className={styles.nodeLabel}>{node.label}</div>
                  {isWorker && (
                    <div className={styles.nodeSubtext}>
                      {nodeStatus === "idle" && "Idle"}
                      {nodeStatus === "running" && "Analyzing..."}
                      {nodeStatus === "completed" && "Completed"}
                      {nodeStatus === "failed" && "Failed"}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
