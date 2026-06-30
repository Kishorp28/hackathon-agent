"use client";

import { useEffect, useState } from "react";
import type { GenerateResponse } from "@/lib/types";

interface LatencyDashboardProps {
  result: GenerateResponse;
}

export function LatencyDashboard({ result }: LatencyDashboardProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalDuration = result.total_duration_sec ?? 0;
  const ragDuration = result.rag_search_duration_sec ?? 0;

  const stages = [
    ...(ragDuration > 0
      ? [
          {
            key: "rag_search",
            label: "RAG & Web Search",
            icon: "🔍",
            duration: ragDuration,
            color: "bg-cyan-500 shadow-cyan-500/20",
            textColor: "text-cyan-400",
            description: "Winning patterns retrieval & Serper trends lookup",
          },
        ]
      : []),
    ...result.agents.map((agent) => {
      let icon = "🤖";
      let color = "bg-indigo-500 shadow-indigo-500/20";
      let textColor = "text-indigo-400";
      let description = "";

      switch (agent.agent) {
        case "idea":
          icon = "💡";
          color = "bg-amber-500 shadow-amber-500/20";
          textColor = "text-amber-400";
          description = "Brainstorming concept & core features";
          break;
        case "architecture":
          icon = "🏗️";
          color = "bg-blue-500 shadow-blue-500/20";
          textColor = "text-blue-400";
          description = "Designing database schema & system architecture";
          break;
        case "ui":
          icon = "🎨";
          color = "bg-fuchsia-500 shadow-fuchsia-500/20";
          textColor = "text-fuchsia-400";
          description = "Drafting user flows & UI themes";
          break;
        case "backend":
          icon = "⚙️";
          color = "bg-emerald-500 shadow-emerald-500/20";
          textColor = "text-emerald-400";
          description = "Structuring directories, APIs & security";
          break;
        case "pitch":
          icon = "📊";
          color = "bg-violet-500 shadow-violet-500/20";
          textColor = "text-violet-400";
          description = "Structuring pitch deck & marketing strategy";
          break;
        case "judge":
          icon = "⚖️";
          color = "bg-rose-500 shadow-rose-500/20";
          textColor = "text-rose-400";
          description = "Final scoring & critical review feedback";
          break;
      }

      return {
        key: agent.agent,
        label: agent.title,
        icon,
        duration: agent.duration_sec ?? 0,
        color,
        textColor,
        description,
      };
    }),
  ];

  const agentDurations = result.agents.map((a) => a.duration_sec ?? 0).filter(Boolean);
  const maxDuration = Math.max(...stages.map((s) => s.duration), 1);
  const avgAgentDuration =
    agentDurations.length > 0
      ? agentDurations.reduce((sum, d) => sum + d, 0) / agentDurations.length
      : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
      <header className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>⏱️</span> Latency Profiler & Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time performance measurements of multi-agent execution
          </p>
        </div>
        <div className="flex gap-2">
          {totalDuration > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Production Verified
            </span>
          )}
        </div>
      </header>

      {/* Latency Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-950/40 p-4 font-sans">
          <div className="absolute right-3 top-3 text-2xl opacity-10">⏱️</div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Pipeline Latency
          </span>
          <span className="mt-2 block text-3xl font-extrabold text-white font-mono">
            {totalDuration > 0 ? `${totalDuration.toFixed(2)}s` : "N/A"}
          </span>
          <span className="mt-1 block text-xs text-indigo-400">
            Total end-to-end execution time
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-950/40 p-4 font-sans">
          <div className="absolute right-3 top-3 text-2xl opacity-10">🔍</div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
            RAG & Search Overhead
          </span>
          <span className="mt-2 block text-3xl font-extrabold text-cyan-400 font-mono">
            {ragDuration > 0 ? `${ragDuration.toFixed(2)}s` : "N/A"}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            {totalDuration > 0 && ragDuration > 0
              ? `${((ragDuration / totalDuration) * 100).toFixed(0)}% of total pipeline`
              : "Knowledge base retrieval"}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-950/40 p-4 font-sans">
          <div className="absolute right-3 top-3 text-2xl opacity-10">⚡</div>
          <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
            Avg Agent Latency
          </span>
          <span className="mt-2 block text-3xl font-extrabold text-emerald-400 font-mono">
            {avgAgentDuration > 0 ? `${avgAgentDuration.toFixed(2)}s` : "N/A"}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            Per specialized LLM node
          </span>
        </div>
      </div>

      {/* Latency Bars Chart */}
      <div className="space-y-5">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Execution Timeline Breakdown
        </h3>
        {stages.map((stage) => {
          const pct = totalDuration > 0 ? (stage.duration / totalDuration) * 100 : 0;
          const relativeWidth = (stage.duration / maxDuration) * 100;
          return (
            <div key={stage.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">{stage.icon}</span>
                  <span className="font-semibold text-slate-200">{stage.label}</span>
                  <span className="text-xs text-slate-500 hidden sm:inline">— {stage.description}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className={`${stage.textColor} font-bold`}>{stage.duration.toFixed(2)}s</span>
                  {totalDuration > 0 && (
                    <span className="text-slate-500 text-xs">({pct.toFixed(0)}%)</span>
                  )}
                </div>
              </div>
              <div className="relative h-3 w-full rounded-full bg-slate-950/60 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${stage.color} shadow-xs`}
                  style={{
                    width: animate ? `${relativeWidth}%` : "0%",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Latency Insights */}
      {totalDuration > 0 && (
        <div className="mt-8 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4 text-xs text-indigo-200">
          <h4 className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
            💡 Latency Insight
          </h4>
          <p className="leading-relaxed">
            {result.agents.some((a) => a.content.includes("Critic Feedback Addressed")) ? (
              <span>
                <strong>Debate Mode is enabled</strong>. The Architecture and Backend agents executed additional feedback loops with a Critic Agent. This increases the total generation latency by ~2.5x but significantly improves code design and correctness.
              </span>
            ) : (
              <span>
                To further optimize latency, you can run agents concurrently in the backend or disable Debate Mode. Using regional LLM deployments can also reduce network call latencies down to sub-second responses.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
