export async function exportBacklogCSV ({
  email,
  tasks
}: {
  email: string
  tasks: any[]
}) {
  const res = await fetch('/api/export-backlog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, tasks })
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(`Exportación falló: ${res.status} ${msg}`)
  }
  return res.json().catch(() => ({}))
}
