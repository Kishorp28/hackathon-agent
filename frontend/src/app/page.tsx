"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useHackathon } from "@/context/HackathonContext";
import { generateHackathonPlan } from "@/lib/api";
import { AGENT_ROUTES } from "@/lib/types";
import { LatencyDashboard } from "@/components/LatencyDashboard";

const EXAMPLE_PROMPT =
  "Build an AI-powered road safety system for smart cities.";

export default function HomePage() {
  const {
    result,
    setResult,
    preferences,
    setPreferences,
    isGenerating,
    setIsGenerating,
    error,
    setError,
  } = useHackathon();

  const [problemStatement, setProblemStatement] = useState("");
  const [useDebate, setUseDebate] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isGenerating) {
      setElapsedTime(0);
      intervalId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGenerating]);

  async function handleGenerate() {
    const statement = problemStatement.trim() || EXAMPLE_PROMPT;
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateHackathonPlan(statement, preferences, useDebate);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  const stages = useDebate
    ? [
        { name: "RAG & Web Search", icon: "🔍", threshold: 4 },
        { name: "Idea Agent", icon: "💡", threshold: 10 },
        { name: "Architecture Agent (Debate Mode)", icon: "🏗️", threshold: 25 },
        { name: "UI/UX Agent", icon: "🎨", threshold: 32 },
        { name: "Backend Agent (Debate Mode)", icon: "⚙️", threshold: 48 },
        { name: "Pitch Agent", icon: "📊", threshold: 54 },
        { name: "Judge Evaluation & Scoring", icon: "⚖️", threshold: 9999 },
      ]
    : [
        { name: "RAG & Web Search", icon: "🔍", threshold: 4 },
        { name: "Idea Agent", icon: "💡", threshold: 10 },
        { name: "Architecture Agent", icon: "🏗️", threshold: 18 },
        { name: "UI/UX Agent", icon: "🎨", threshold: 25 },
        { name: "Backend Agent", icon: "⚙️", threshold: 33 },
        { name: "Pitch Agent", icon: "📊", threshold: 39 },
        { name: "Judge Evaluation & Scoring", icon: "⚖️", threshold: 9999 },
      ];

  const currentStage = stages.find((s) => elapsedTime < s.threshold) || stages[stages.length - 1];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
          Multi-Agent AI System
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Your AI Hackathon Team
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-400">
          Enter a problem statement and let 6 specialized AI agents collaborate to
          produce a complete hackathon solution — idea, architecture, UI, backend,
          pitch deck, and judge evaluation.
        </p>
      </section>

      <section className="mb-10 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur">
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Problem Statement
        </label>
        <textarea
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
          placeholder={EXAMPLE_PROMPT}
          rows={3}
          className="mb-4 w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Team Size</label>
            <input
              type="number"
              min={1}
              max={10}
              value={preferences.team_size}
              onChange={(e) =>
                setPreferences({ ...preferences, team_size: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Hackathon Type</label>
            <select
              value={preferences.hackathon_type}
              onChange={(e) =>
                setPreferences({ ...preferences, hackathon_type: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option className="bg-slate-900 text-slate-100" value="AI">AI / ML</option>
              <option className="bg-slate-900 text-slate-100" value="Web">Web App</option>
              <option className="bg-slate-900 text-slate-100" value="IoT">IoT</option>
              <option className="bg-slate-900 text-slate-100" value="Blockchain">Blockchain</option>
              <option className="bg-slate-900 text-slate-100" value="Social">Social Impact</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Preferred Stack</label>
            <select
              value={preferences.preferred_stack}
              onChange={(e) =>
                setPreferences({ ...preferences, preferred_stack: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option className="bg-slate-900 text-slate-100" value="MERN">MERN</option>
              <option className="bg-slate-900 text-slate-100" value="Python+React">Python + React</option>
              <option className="bg-slate-900 text-slate-100" value="Next.js">Next.js Full-Stack</option>
              <option className="bg-slate-900 text-slate-100" value="Flutter">Flutter + Firebase</option>
            </select>
          </div>
        </div>

        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={useDebate}
            onChange={(e) => setUseDebate(e.target.checked)}
            className="rounded border-white/20 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
          />
          Enable debate mode (Critic → Improvement for Architecture & Backend)
        </label>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Running 6 agents…
            </span>
          ) : (
            "Generate Hackathon Plan"
          )}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        {isGenerating && (
          <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 backdrop-blur-md">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-indigo-400" />
                  Orchestrating AI Hackathon Team...
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calling 6 specialized agent nodes in sequence
                </p>
              </div>
              <div className="font-mono text-sm text-indigo-300 font-bold bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                Elapsed Time: {elapsedTime}s
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {stages.map((stage, idx) => {
                const stageIndex = stages.indexOf(currentStage);
                const isCompleted = idx < stageIndex;
                const isActive = idx === stageIndex;

                return (
                  <div
                    key={stage.name}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      isCompleted ? "opacity-100" : isActive ? "opacity-100 font-semibold" : "opacity-30"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-slate-950 border border-white/10">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : isActive ? (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="text-sm text-slate-200">
                        {stage.icon} {stage.name}
                      </span>
                      {isActive && (
                        <span className="text-xs text-indigo-400 uppercase tracking-widest animate-pulse font-sans font-medium">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {!isGenerating && !result && (
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(AGENT_ROUTES).map(([key, route]) => (
            <div
              key={key}
              className="rounded-xl border border-white/10 bg-slate-900/40 p-5 transition-colors hover:border-indigo-500/30"
            >
              <span className="text-2xl">{route.icon}</span>
              <h3 className="mt-2 font-semibold text-white">{route.label}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {key === "idea" && "Problem, solution, features, innovation score"}
                {key === "architecture" && "System design, APIs, database, deployment"}
                {key === "ui" && "Screens, user flow, wireframes, theme"}
                {key === "backend" && "Folder structure, endpoints, schema, security"}
                {key === "pitch" && "Elevator pitch, market, revenue, competition"}
                {key === "judge" && "Innovation, impact, technical scores & feedback"}
              </p>
            </div>
          ))}
        </section>
      )}

      {result && (
        <div className="space-y-10 mt-10">
          <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <p className="mb-4 text-emerald-300 font-medium">
              🎉 Solution generated successfully! Click below to view each agent&apos;s deliverable:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(AGENT_ROUTES).map(([key, route]) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:border-indigo-500/50 hover:bg-indigo-600/20"
                >
                  {route.icon} {route.label}
                </Link>
              ))}
            </div>
          </section>

          <LatencyDashboard result={result} />
        </div>
      )}
    </div>
  );
}

