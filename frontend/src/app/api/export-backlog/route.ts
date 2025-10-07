import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toCSV(tasks: any[]) {
  const headers = ["id","title","description","column","position","responsability","createdAt"];
  const escape = (s:any) => {
    const v = String(s ?? "");
    return /[\",\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v;
  };
  const lines = [headers.join(",")];
  for (const t of tasks) {
    lines.push([
      t._id, t.title, t.description ?? "", t.columnId, t.position, t.responsability, t.createdAt
    ].map(escape).join(","));
  }
  return lines.join("\n");
}


export async function POST(req: NextRequest) {
  try {
    const { email, tasks } = await req.json();
    if (!email || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "email y tasks son requeridos" }, { status: 400 });
    }

    const csv = toCSV(tasks);
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csv], { type: "text/csv" });
    
    const form = new FormData();
    form.append("email", email);
    form.append("file", blob, `backlog-${new Date().toISOString().slice(0,10)}.csv`);

    const user = process.env.N8N_BASIC_USER!;
    const pass = process.env.N8N_BASIC_PASS!;
    const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
    const url  = process.env.N8N_WEBHOOK_URL!;


    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: auth },
      body: form,
    });

    return NextResponse.json({ ok: r.ok }, { status: r.ok ? 202 : r.status });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({"message":"GET not allowed"});
}
