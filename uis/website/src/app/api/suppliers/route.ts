const BACKEND_URL = "http://127.0.0.1:8000";

export async function GET(request: Request) {
  const { search } = new URL(request.url);

  const res = await fetch(`${BACKEND_URL}/suppliers${search}`, {
    cache: "no-store",
  });

  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
