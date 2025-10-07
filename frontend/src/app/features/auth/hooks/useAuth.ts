import { useMutation } from '@tanstack/react-query'
import {
  registerUser,
  loginUser,
  AuthUser,
  AuthResponse,
  logoutUser
} from '@/shared/utils'

export function useRegister () {
  return useMutation<AuthResponse, Error, AuthUser>({
    mutationFn: registerUser
  })
}

export function useLogin () {
  return useMutation<AuthResponse, Error, AuthUser>({
    mutationFn: loginUser
  })
}

export function useLogout () {
  return useMutation<AuthResponse, Error>({
    mutationFn: logoutUser
  })
}
