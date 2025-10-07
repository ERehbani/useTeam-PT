import { NextResponse } from 'next/server'

export async function POST (request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json({ error: text }, { status: response.status })
    }
    const data = await response.json()
    const token: string | undefined = data?.access_token

    if (!token) {
      return NextResponse.json(
        { error: 'Error al iniciar sesión' },
        { status: 500 }
      )
    }
    console.log(data)
    const res = NextResponse.json({
      ok: true,
      user: data.user
    })

    res.cookies.set('access_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7
    })

    return res
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    )
  }
}
