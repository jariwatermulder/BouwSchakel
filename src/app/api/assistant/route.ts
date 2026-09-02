import type { NextRequest } from "next/server";
import { z } from "zod";
import { aiIngeschakeld, streamAntwoord } from "@/lib/ai/assistant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

const UITGESCHAKELD_MELDING =
  "De AI-assistent is nog niet ingeschakeld. Stel je vraag gerust via de contactpagina, dan helpen we je snel verder.";

export async function POST(req: NextRequest) {
  let data: z.infer<typeof bodySchema>;
  try {
    data = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  if (!aiIngeschakeld()) {
    return Response.json({ disabled: true, message: UITGESCHAKELD_MELDING });
  }

  const stream = streamAntwoord(data.messages);
  if (!stream) {
    return Response.json({ disabled: true, message: UITGESCHAKELD_MELDING });
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
