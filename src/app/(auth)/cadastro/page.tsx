'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { IFCoinIcon } from '@/components/icons';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const formSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'E-mail inválido.' }),
  role: z.enum(['student', 'teacher'], { required_error: 'Selecione um perfil.' }),
  ra: z.string().optional(),
  class: z.string().optional(),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
}).refine(data => {
    if (data.role === 'student') {
        return data.email.endsWith('@estudantes.ifpr.edu.br');
    }
    return true;
}, {
    message: 'O e-mail do estudante deve ser institucional (@estudantes.ifpr.edu.br).',
    path: ['email'],
}).refine(data => {
    if (data.role === 'teacher') {
        return data.email.endsWith('@ifpr.edu.br');
    }
    return true;
}, {
    message: 'O e-mail do professor deve ser institucional (@ifpr.edu.br).',
    path: ['email'],
}).refine(data => data.role === 'teacher' || (!!data.ra && data.ra.length > 0), {
    message: 'O RA é obrigatório para alunos.',
    path: ['ra'],
}).refine(data => data.role === 'teacher' || (!!data.class && data.class.length > 0), {
    message: 'A turma é obrigatória para alunos.',
    path: ['class'],
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'student',
      ra: '',
      class: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const role = form.watch('role');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const newUser: Partial<User> = {
        name: values.name,
        email: values.email,
        role: values.role,
        coins: 0, // Both start with 0 coins now
      };

      if (values.role === 'student') {
        newUser.ra = values.ra;
        newUser.class = values.class;
      }

      await setDoc(doc(firestore, 'users', user.uid), newUser);
      
      toast({
        title: 'Conta Criada com Sucesso!',
        description: 'Você será redirecionado para o painel.',
      });

      router.push('/dashboard');

    } catch (error: any) {
      setIsLoading(false);
      console.error('Registration Error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: error.code === 'auth/email-already-in-use' 
          ? 'Este e-mail já está em uso.'
          : 'Não foi possível criar a conta. Tente novamente.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <IFCoinIcon className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Preencha os campos para se registrar no IFCoins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Eu sou</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Aluno
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="teacher" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Professor
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail Institucional</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={role === 'student' ? "aluno@estudantes.ifpr.edu.br" : "professor@ifpr.edu.br"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="ra"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>RA</FormLabel>
                          <FormControl>
                          <Input placeholder="Ex: 2023001" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Turma</FormLabel>
                          <FormControl>
                          <Input placeholder="Ex: 2A INFO" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Criando conta...' : 'Cadastrar'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/" className="underline">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
