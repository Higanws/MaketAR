import type { FlowTemplateType } from "@/entities/flow/flow.types";
import type { ProjectKind } from "@/entities/project/project.types";
import type { TemplateType } from "@/entities/wireframe/wireframe.types";
import { TemplateIcon, type DashboardTemplate } from "@/features/dashboard/dashboard-templates";

export function TemplateSection({
  title,
  description,
  templates,
  onCreateTemplate,
}: {
  title: string;
  description: string;
  templates: DashboardTemplate[];
  onCreateTemplate: (name: string, kind: ProjectKind, template?: TemplateType, flowTemplate?: FlowTemplateType) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-600">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">{templates.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.name}
            className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
            onClick={() => onCreateTemplate(template.name, template.kind, template.template, template.flowTemplate)}
          >
            <div className="mb-4 h-32 rounded-md border border-slate-200 bg-[#e8edf5] p-3">
              <div className="h-full rounded border border-slate-300 bg-white p-3">
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-md bg-slate-950 text-white">
                    <TemplateIcon template={template.template} />
                  </div>
                  <div className="h-3 w-20 rounded bg-slate-200" />
                </div>
                {template.flowTemplate ? (
                  <div className="flex items-center gap-1 pt-2">
                    <div className="h-8 w-12 rounded-full border border-blue-200 bg-blue-50" />
                    <div className="h-px w-5 bg-slate-300" />
                    <div className="h-8 w-12 rounded border border-emerald-200 bg-emerald-50" />
                    <div className="h-px w-5 bg-slate-300" />
                    <div className="size-8 rotate-45 rounded border border-amber-200 bg-amber-50" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 rounded bg-blue-100" />
                    <div className="h-12 rounded bg-emerald-100" />
                  </div>
                )}
              </div>
            </div>
            <h4 className="truncate text-sm font-semibold">{template.name}</h4>
            <p className="mt-2 text-xs text-slate-500">{template.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
