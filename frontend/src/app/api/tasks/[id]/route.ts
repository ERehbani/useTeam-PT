import axios from 'axios'
import { NextResponse } from 'next/server'

export async function DELETE (
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  try {
    const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_BACKEND}/kanban/${id}`)

    const data = await res.data

    if (res.status !== 200) {
      return NextResponse.json(
        { error: data?.message || 'Error al borrar en backend' },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('DELETE /api/tasks/[id]:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
