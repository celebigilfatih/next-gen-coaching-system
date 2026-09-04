"use client";
import React from "react";

export default function PrintPlanPage({ params }: { params: { id: string } }) {
  const [plan, setPlan] = React.useState<any | null>(null);
  React.useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/training-plans/" + params.id)
      .then((r) => r.json())
      .then(setPlan);
  }, [params.id]);

  const grouped = React.useMemo(() => {
    const byPhase: Record<string, any[]> = { WARM_UP: [], TECHNICAL: [], TACTICAL: [], COOL_DOWN: [] };
    for (const d of plan?.drills ?? []) {
      byPhase[d.phase]?.push(d);
    }
    return byPhase;
  }, [plan]);

  const totals = React.useMemo(() => {
    const t: Record<string, number> = { WARM_UP: 0, TECHNICAL: 0, TACTICAL: 0, COOL_DOWN: 0 };
    for (const pd of plan?.drills ?? []) {
      const dur = pd.drill?.durationMin ?? 0;
      t[pd.phase] = (t[pd.phase] ?? 0) + dur;
    }
    return t;
  }, [plan]);

  function print() {
    window.print();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Training Sheet</h1>
        <button className="border px-3 py-1 rounded" onClick={print}>
          Print
        </button>
      </div>
      <div className="text-sm">Title: {plan?.title}</div>
      <div className="text-sm">Date: {plan?.date ? new Date(plan.date).toLocaleDateString() : "-"}</div>
      <div className="grid grid-cols-2 gap-4">
        {(["WARM_UP", "TECHNICAL", "TACTICAL", "COOL_DOWN"] as const).map((p) => (
          <div key={p} className="border p-4 rounded">
            <h2 className="font-semibold mb-2">
              {p} (Total: {totals[p] ?? 0} min)
            </h2>
            <div className="space-y-2">
              {(grouped[p] ?? []).map((pd) => (
                <div key={pd.id} className="border p-2 rounded text-sm">
                  {pd.drill?.title ?? pd.drillId} · {pd.drill?.durationMin ?? "-"}min · Order: {pd.order}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
