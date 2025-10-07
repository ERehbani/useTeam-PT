import { useLogout } from '@/app/features/auth/hooks/useAuth'
import { userStore } from '@/app/features/auth/store/userStore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Spinner } from '@/shared/ui/spinner'
import { LogOut, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'


const Navbar = () => {
  const { user } = userStore()
  const { mutate, isPending } = useLogout()

  const router = useRouter()
  const logout = () => {
    mutate()
    router.push('/auth')
  }

  return (
    <div className='bg-primary'>
      <div className='py-3 flex items-center px-24 gap-2 max-w-5xl mx-auto'>
        <DropdownMenu>
          <DropdownMenuTrigger className='p-2 bg-white rounded-md hover:cursor-pointer'>
            <UserIcon className='text-black' />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => logout()}><LogOut />{isPending ? <Spinner /> : 'Cerrar sesión'}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className='text-white'>{user?.email}</p>
      </div>
    </div>
  )
}

export default Navbar
