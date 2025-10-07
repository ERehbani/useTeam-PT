import { userStore } from '@/app/features/auth/store/userStore'
import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type AuthUser = { email: string; password: string }
export type AuthResponse = { access_token: string; user?: any }

export async function registerUser (user: AuthUser) {
  const { data } = await axios.post('/api/auth/register', user)
  return data
}

export async function loginUser (user: AuthUser): Promise<AuthResponse> {
  const { setUser } = userStore.getState()
  const { data } = await axios.post<AuthResponse>('/api/auth/login', user)
  console.log(data)
  setUser(data.user)
  return data
}

export async function logoutUser (): Promise<AuthResponse> {
  const { setUser } = userStore.getState()
  setUser({ email: '', access_token: '' })
  return { access_token: '' }
}

