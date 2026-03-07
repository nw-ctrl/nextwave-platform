export async function GET() {
  return Response.json({ prescriptionTemplate: [] });
}

export async function POST(request: Request) {
  const data = await request.json();
  return Response.json({ created: true, data });
}