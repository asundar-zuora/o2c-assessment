"use client";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS } from "@/lib/questions";

export default function Assessment() {
  const router = useRouter();
  const params = useSearchParams();
  const utm = useMemo(() => Object.fromEntries(params.entries()), [params]);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (id: string, v: number) => setAnswers(a => ({ ...a, [id]: v }));
  const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

  async function onSubmit() {
    if (!email) return alert("Please enter your email to view results.");
    setSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company, answers, utm })
      });
      setSubmitting(false);
      if (!res.ok) {
        let msg = `Something went wrong. [${res.status}]`;
        try { const d = await res.json(); if (d?.error) msg = d.error; } catch {}
        alert(msg); return;
      }
      const { id } = await res.json();
      router.push(`/result/${id}`);
    } catch (e: any) {
      setSubmitting(false);
      alert(e?.message || "Network error.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">Modern O2C Finance Leader — Self-Assessment</h1>
          <div className="w-40">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-slate-900 transition-all" style={{ width: `${progress}%` }}/>
            </div>
            <p className="mt-1 text-right text-xs text-slate-500">{progress}%</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="mb-6 text-slate-600">
          Answer the questions below (about 3–4 minutes). Then enter your email to receive a tailored results page and next-step recommendations.
        </p>

        <ol className="space-y-6">
          {QUESTIONS.map((q, i) => (
            <li key={q.id} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
              <p className="mb-4 text-lg font-medium">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{i+1}</span>
                {q.title}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {q.options.map(opt => {
                  const checked = answers[q.id] === opt.value;
                  return (
                    <label key={opt.label} className={`group cursor-pointer rounded-xl border p-3 transition ${checked ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="radio" name={q.id} className="sr-only" checked={checked} onChange={() => set(q.id, opt.value)} />
                      <span className="text-sm leading-relaxed">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Get your results</h2>
          <p className="mt-1 text-sm text-slate-600">We’ll generate your score instantly and email you a private link.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 outline-none" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 outline-none" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
            <input className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 outline-none" placeholder="Work email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-slate-500">By continuing you agree to receive the results and follow-up content.</p>
            <button disabled={!email || submitting || progress < 100}
              onClick={onSubmit}
              className={`inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold ${!email || submitting || progress < 100 ? "bg-slate-200 text-slate-500" : "bg-slate-900 text-white hover:opacity-90"}`}>
              {submitting ? "Submitting…" : "See my score"}
            </button>
          </div>
        </section>

        <footer className="mt-10 pb-10 text-center text-xs text-slate-400">© {new Date().getFullYear()} O2C Assessment</footer>
      </main>
    </div>
  );
}
