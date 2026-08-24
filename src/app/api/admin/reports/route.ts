import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireAdmin } from "@/server/auth";
import { listOpenReports, resolveReport } from "@/server/deals";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { z } from "zod";

const actionSchema = z.object({ action: z.enum(["dismiss", "remove_deal"]) }).strict();

export async function GET(req: Request) {
  try {
    requireAdmin(getSessionTokenFromHeader(req));
    const reports = listOpenReports();
    return jsonOk({ reports });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const admin = requireAdmin(getSessionTokenFromHeader(req));
    const body = actionSchema.parse(await readJson(req));
    const url = new URL(req.url);
    const reportId = Number.parseInt(url.searchParams.get("id") ?? "", 10);
    resolveReport(reportId, body.action, admin);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
