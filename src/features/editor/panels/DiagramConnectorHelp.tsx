import { diagramConnectorTools } from "@/features/editor/library/library-constants";

export function DiagramConnectorHelp() {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Conectores</h3>
      <div className="space-y-2">
        {diagramConnectorTools.map((tool) => (
          <div key={tool.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <tool.icon size={16} strokeWidth={1.7} />
              {tool.label}
            </div>
            <p className="mt-1 text-xs text-slate-500">{tool.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
