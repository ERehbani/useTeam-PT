import React, { useState } from 'react'
import { useLogin } from './hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Field, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { EMAIL_REGEX, PASSWORD_REGEX } from '@/shared/utils';
import { toast } from 'sonner';

const LoginForm = () => {

    const { mutate, isPending, error, data } = useLogin();
    const router = useRouter()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const onSuccessLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!EMAIL_REGEX.test(email)) {
            toast.error("Por favor ingresa un email válido.");
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            toast.error("La contraseña debe tener al menos 8 caracteres y contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial");
            return;
        }
        return mutate({ email, password }, {
            onSuccess: () => {
                router.push('/')
            }
        })
    }
    return (
        <div className="flex flex-col gap-4 space-y-3 max-w-3xl bg-[#1a1a1a] p-4 rounded text-white ">
            <h2 className='text-2xl font-bold'>Iniciar sesión</h2>
            <form onSubmit={onSuccessLogin} className="space-y-3">
                <Field>
                    <FieldLabel>
                        Email
                    </FieldLabel>
                    <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full border rounded px-3 py-2"
                        pattern={EMAIL_REGEX.source}
                    />
                </Field>
                <Field>
                    <FieldLabel>
                        Contraseña
                    </FieldLabel>
                    <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border rounded px-3 py-2"
                    />
                </Field>
                {error && (
                    <p className="text-sm text-red-600">
                        {(error as Error).message || "Error de autenticación"}
                    </p>
                )}
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded bg-black text-white px-4 py-2 disabled:opacity-50"
                >
                    {isPending ? "Enviando..." : "Ingresar"}
                </Button>
            </form>
        </div>
    )
}

export default LoginForm
