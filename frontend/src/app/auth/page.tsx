"use client";
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginForm from '../features/auth/LoginForm';
import RegisterForm from '../features/auth/RegisterForm';

const Auth = () => {
    const router = useRouter()
    const [tab, setTab] = useState<'register' | 'login'>('register');


    return (
        <div className='flex justify-center h-screen bg-[#2a2a2a] items-center flex-col'>
            <Tabs defaultValue='register' className='min-w-xs w-full max-w-xl min-h-48' value={tab}>
                <TabsList className='text-white w-full'>
                    <TabsTrigger className={`bg-primary text-white ${tab === 'register' ? 'bg-primary text-black border-2 border-gray-600' : 'bg-transparent text-gray-600'}`} onClick={() => setTab('register')} value='register'>Register</TabsTrigger>
                    <TabsTrigger className={`bg-primary text-white ${tab === 'login' ? 'bg-primary text-black border-2 border-gray-600' : 'bg-transparent text-gray-600'}`} onClick={() => setTab('login')} value='login'>Login</TabsTrigger>
                </TabsList>
                <TabsContent value='register' className='flex flex-col gap-4 space-y-3 max-w-3xl bg-[#1a1a1a] p-4 rounded text-white '>
                    <RegisterForm setTab={setTab} />
                    <div className="flex justify-center items-center"><p>¿Ya tenés una cuenta?</p> <Button variant="link" onClick={() => setTab('login')} className="text-white">Iniciar sesión</Button></div>
                </TabsContent>
                <TabsContent value='login' className='flex flex-col gap-4 space-y-3 max-w-3xl bg-[#1a1a1a] p-4 rounded text-white '>
                    <LoginForm />
                    <div className="flex justify-center gap-2 items-center"><p>¿No tenes una cuenta aún?</p> <Button variant="link" onClick={() => setTab('register')} className="text-white">Registrate</Button></div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Auth
