import { syncGithubRepository } from "../../../../lib/github";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.owner || !body.repo) {
    return Response.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const result = await syncGithubRepository(body.owner, body.repo, body.token);
  return Response.json({ ok: true, result });
}
