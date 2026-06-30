"use client";

import { useState } from "react";
import Link from "next/link";
import { useHackathon } from "@/context/HackathonContext";
import { downloadPdfReport } from "@/lib/api";
import { ScoreGauge } from "@/components/ScoreGauge";
import { AgentContent } from "@/components/AgentContent";

export default function ReportPage() {
  const { result } = useHackathon();
  const [downloading, setDownloading] = useState(false);

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 text-slate-400">Generate a plan first to see the judge report.</p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  const judge = result.judge;
  const judgeAgent = result.agents.find((a) => a.agent === "judge");

  async function handleDownload() {
    if (!result) return;
    setDownloading(true);
    try {
      const blob = await downloadPdfReport(result);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Hackathon_Report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF download failed. Is the backend running?");
    } finally {
      setDownloading(false);
    }
  }

  const avgScore = judge
    ? (judge.innovation + judge.impact + judge.technical + judge.scalability) / 4
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Judge Report</h1>
          <p className="mt-1 text-slate-400">{result.problem_statement}</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {downloading ? "Generating PDF…" : "Download Hackathon_Report.pdf"}
        </button>
      </div>

      {judge && (
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Overall Scores</h2>
            <div className="rounded-full bg-indigo-600/20 px-4 py-1 text-lg font-bold text-indigo-300">
              {avgScore.toFixed(1)}/10
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <ScoreGauge label="Innovation" score={judge.innovation} />
            <ScoreGauge label="Impact" score={judge.impact} />
            <ScoreGauge label="Technical" score={judge.technical} />
            <ScoreGauge label="Scalability" score={judge.scalability} />
          </div>
          <div className="mt-6 rounded-xl border border-white/5 bg-slate-950/50 p-4">
            <h3 className="mb-2 text-sm font-medium text-slate-400">Judge Feedback</h3>
            <p className="text-sm leading-relaxed text-slate-300">{judge.feedback}</p>
          </div>
        </section>
      )}

      {judgeAgent && (
        <AgentContent
          title="Full Judge Evaluation"
          icon="⚖️"
          content={judgeAgent.content}
          durationSec={judgeAgent.duration_sec}
        />
      )}
    </div>
  );
}
