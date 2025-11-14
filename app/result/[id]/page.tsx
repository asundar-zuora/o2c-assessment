import { sql } from "@vercel/postgres";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const { rows } = await sql`SELECT * FROM submissions WHERE id = ${params.id} LIMIT 1`;
  if (!rows.length) return <main className="mx-auto max-w-2xl p-6">Result not found.</main>;

  const r = rows[0] as any;
  const scores = r.scores as Record<string, number>;

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Results</h1>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p><b>Total Score:</b> {r.total_score}%</p>
        <p><b>Tier:</b> {r.tier}</p>
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-medium">Per-question (percent)</h2>
        <ul className="space-y-2">
          {Object.entries(scores).map(([k, v]) => (
            <li key={k} className="flex items-center gap-3">
              <span className="w-20 text-sm font-medium">{k.toUpperCase()}</span>
              <div className="h-2 flex-1 rounded bg-slate-200">
                <div className="h-2 rounded bg-slate-900" style={{ width: `${v}%` }}/>
              </div>
              <span className="text-sm w-12 text-right">{v}%</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
