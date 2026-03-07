export async function GET() {
  return Response.json({ doctorProfile: null });
}

export async function PUT(request: Request) {
  const data = await request.json();
  return Response.json({ updated: true, data });
}