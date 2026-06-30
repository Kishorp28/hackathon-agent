interface AgentContentProps {
  title: string;
  icon?: string;
  content: string;
  durationSec?: number;
}

function formatContent(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<h3 class="text-lg font-semibold text-indigo-300 mt-6 mb-2">$1</h3>')
    .replace(/^### (.+)$/gm, '<h4 class="text-base font-medium text-slate-200 mt-4 mb-1">$1</h4>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-medium">$1</strong>')
    .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-3">')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-indigo-300">$1</code>');
}

export function AgentContent({ title, icon, content, durationSec }: AgentContentProps) {
  const formatted = formatContent(content);
  const html = `<p class="text-slate-300 leading-relaxed mb-3">${formatted}</p>`;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
      <header className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          {icon && <span className="text-3xl">{icon}</span>}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {durationSec !== undefined && durationSec > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/20">
            <span>⚡ latency:</span>
            <span>{durationSec.toFixed(2)}s</span>
          </div>
        )}
      </header>
      <div
        className="prose-agent max-w-none text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
