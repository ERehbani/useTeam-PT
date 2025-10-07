import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
const API = process.env.NEXT_PUBLIC_API_BACKEND

export async function GET () {
  const token = (await cookies()).get('access_token')?.value

  if (!token) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    )
  }

  try {
    const resp = await fetch(`${API}/user/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!resp.ok) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      )
    }

    const me = await resp.json()
    return NextResponse.json({ authenticated: true, user: me }, { status: 200 })
  } catch (e) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    )
  }
}
