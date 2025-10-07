
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND}/user/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    
        if (!res.ok) {
          const text = await res.text();
          return new Response(`Error del backend: ${text}`, { status: res.status });
        }
    
        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        return new Response("Error")
    }
}
