import { syncGithubRepository } from "../../../../lib/github";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await syncGithubRepository(body.owner, body.repo);
  return Response.json({ ok: true, result });
}
