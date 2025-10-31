'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IFCoinIcon } from '@/components/icons';
import { useAuth, useFirestore } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSuccessfulLogin = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    if (user.email === 'paulocauan39@gmail.com') {
      const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
      try {
        await setDoc(adminRoleRef, { role: 'admin' });
        console.log('Admin role document created for user:', user.uid);
      } catch (error) {
        console.error('Error creating admin role document:', error);
      }
    }
    toast({ title: 'Login bem-sucedido!' });
    router.push('/dashboard');
  };

  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccessfulLogin(userCredential);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description:
          error.code === 'auth/invalid-credential'
            ? 'Credenciais inválidas.'
            : 'Ocorreu um erro. Tente novamente.',
      });
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(userCredential);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro no login com Google',
        description: 'Não foi possível fazer login com o Google.',
      });
    }
  };
  
  const testUsers = [
    {
      role: 'Admin',
      email: 'paulocauan39@gmail.com',
    },
    {
      role: 'Professor',
      email: 'professor@ifpr.edu.br',
    },
    {
      role: 'Aluno',
      email: 'aluno@estudantes.ifpr.edu.br',
    },
  ];

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-12">
        <div className="w-full max-w-md">
           <h2 className="text-3xl font-bold mb-4">Contas de Teste</h2>
            <p className="text-muted-foreground mb-8">
                Use as contas abaixo para explorar os diferentes perfis. A senha para todas é <code className="font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md">123456</code>.
            </p>
            <div className="space-y-4">
                {testUsers.map((user) => (
                    <Card key={user.role}>
                        <CardHeader>
                            <CardTitle className="text-xl">{user.role}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-mono">{user.email}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
          <Card className="mx-auto w-full max-w-sm border-none shadow-none lg:border lg:shadow-sm">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <IFCoinIcon className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl font-bold">IFCoins Digital</CardTitle>
              <CardDescription>Faça login para acessar sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleEmailLogin} type="submit" className="w-full">
                  Entrar
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 74.2C313.6 113.4 283.6 96 248 96c-106.1 0-192 85.9-192 192s85.9 192 192 192c109.4 0 181.7-75.1 184.8-174.9H248v-95.6h239.2c1.2 12.8 1.8 26.1 1.8 39.4z"
                    ></path>
                  </svg>
                  Entrar com Google
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Não tem uma conta?{' '}
                <Link href="#" className="underline">
                  Contate um administrador
                </Link>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
