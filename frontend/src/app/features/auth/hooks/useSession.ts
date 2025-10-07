import { useQuery } from '@tanstack/react-query'

export type SessionUser = { _id: string; email: string } | null
export type SessionResponse = { authenticated: boolean; user: SessionUser }

export function useSession () {
  return useQuery<SessionResponse>({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session', { cache: 'no-store' })
      if (!res.ok) throw new Error('No se pudo obtener la sesión')
      return res.json()
    },
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 30_000
  })
}
