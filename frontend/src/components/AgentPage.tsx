"use client";

import { useHackathon } from "@/context/HackathonContext";
import { AGENT_ROUTES } from "@/lib/types";
import { AgentContent } from "@/components/AgentContent";
import Link from "next/link";

interface AgentPageProps {
  agentKey: keyof typeof AGENT_ROUTES;
}

export function AgentPage({ agentKey }: AgentPageProps) {
  const { result } = useHackathon();
  const route = AGENT_ROUTES[agentKey];

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="mb-4 text-slate-400">No hackathon plan generated yet.</p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Start on Home
        </Link>
      </div>
    );
  }

  const agent = result.agents.find((a) => a.agent === agentKey);

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-400">
        Agent output not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <AgentContent
        title={agent.title}
        icon={route.icon}
        content={agent.content}
        durationSec={agent.duration_sec}
      />
    </div>
  );
}
