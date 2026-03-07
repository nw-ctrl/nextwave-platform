export async function GET() {
  return Response.json({ clinicProfile: null });
}

export async function PUT(request: Request) {
  const data = await request.json();
  return Response.json({ updated: true, data });
}