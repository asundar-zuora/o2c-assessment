import { sql } from "@vercel/postgres";
export async function GET() {
  try {
    const ping = await sql`select 1 as ok`;
    const exists = await sql`select to_regclass('public.submissions') as t`;
    return Response.json({
      dbConnected: ping.rows?.[0]?.ok === 1,
      tableFound: exists.rows?.[0]?.t === "submissions",
      siteUrlSet: !!process.env.NEXT_PUBLIC_SITE_URL,
      hasResendKey: !!process.env.RESEND_API_KEY
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
