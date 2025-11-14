import { z } from "zod";
import { sql } from "@vercel/postgres";
import { Resend } from "resend";
import { headers } from "next/headers";
import { QUESTIONS, scoreToPercent, classify } from "@/lib/questions";

const resend = new Resend(process.env.RESEND_API_KEY);

const Payload = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  company: z.string().optional(),
  answers: z.record(z.string(), z.number().min(1).max(4)),
  utm: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Payload.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

    const { email, name, company, answers, utm } = parsed.data;
    const values = QUESTIONS.map(q => answers[q.id] ?? 0).filter(v => v > 0);
    if (values.length !== QUESTIONS.length) {
      return Response.json({ error: "Please complete all questions." }, { status: 400 });
    }

    const avg = values.reduce((a,b)=>a+b,0) / values.length;
    const total_pct = scoreToPercent(avg);
    const category = classify(total_pct);
    const scores = Object.fromEntries(QUESTIONS.map(q => [q.id, scoreToPercent(answers[q.id])]));

    const ip = headers().get("x-forwarded-for") ?? "";
    const ua = headers().get("user-agent") ?? "";

    // stringify objects for @vercel/postgres
    const scoresJson = JSON.stringify(scores);
    const answersJson = JSON.stringify(answers);
    const utmJson = JSON.stringify(utm ?? {});

    const { rows } = await sql`
      INSERT INTO submissions (email, name, company, scores, total_score, tier, answers, utm, ip, ua)
      VALUES (${email}, ${name}, ${company}, ${scoresJson}::jsonb, ${total_pct}, ${category}, ${answersJson}::jsonb, ${utmJson}::jsonb, ${ip}, ${ua})
      RETURNING id
    `;
    const id = rows[0].id as string;

    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/result/${id}`;
    try {
      await resend.emails.send({
        from: "O2C Assessment <onboarding@resend.dev>",
        to: email,
        subject: "Your O2C Assessment Results",
        html: `Hi${name ? " " + name : ""},<br/>Here are your results: <a href="${url}">${url}</a>`
      });
    } catch (e) { /* don't fail if email fails */ }

    return Response.json({ id });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
