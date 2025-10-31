'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  addDoc,
  collection,
  doc,
  setDoc,
  query,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/lib/types';
import type { User } from '@/lib/types';

const formSchema = z.object({
  role: z.enum(['student', 'teacher'], { required_error: 'Selecione um perfil.'}),
  ra: z.string().optional(),
  email: z.string().email('E-mail inválido.'),
  name: z.string().min(1, 'O nome é obrigatório.'),
  class: z.string().optional(),
}).refine(data => {
    if (data.role === 'student') {
        return !!data.ra && data.ra.length > 0;
    }
    return true;
}, {
    message: 'O RA é obrigatório para alunos.',
    path: ['ra'],
}).refine(data => {
    if (data.role === 'student') {
        return !!data.class && data.class.length > 0;
    }
    return true;
}, {
    message: 'A turma é obrigatória para alunos.',
    path: ['class'],
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
});


export default function AdminPeoplePage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'student',
      ra: '',
      email: '',
      name: '',
      class: '',
    },
  });

  const role = form.watch('role');

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users')) : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<User>(usersQuery);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userData: Partial<User> = {
        email: values.email,
        name: values.name,
        role: values.role,
        coins: 0,
      };

      if (values.role === 'student') {
        userData.ra = values.ra;
        userData.class = values.class;
      }
      
      // We cannot create a user with a specific ID here without a backend function
      // for creating the user in Firebase Auth.
      // So we add the document and let AppLayout handle user creation on first login.
      // A better approach would be a Cloud Function that creates both Auth user and Firestore doc.
      await addDoc(collection(firestore, 'users'), userData);

      toast({
        title: 'Pré-cadastro Realizado!',
        description: `O usuário ${values.name} foi adicionado. Ele precisará fazer o primeiro login para ativar a conta.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description:
          'Não foi possível cadastrar o usuário. Tente novamente.',
      });
    }
  }

  const roleLabels: Record<UserRole, string> = {
    student: 'Aluno',
    teacher: 'Professor',
    admin: 'Admin',
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pessoas</h1>
        <p className="text-muted-foreground">
          Cadastre novos alunos e professores no sistema.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Nova Pessoa</CardTitle>
          <CardDescription>
            A criação de senha é feita no primeiro login do usuário.
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
                      <FormLabel>Perfil do Usuário</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Aluno
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
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
                      <Input placeholder="Nome Completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {role === 'student' && (
                <>
                    <FormField
                        control={form.control}
                        name="ra"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>RA do Aluno</FormLabel>
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
                </>
              )}
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail Institucional</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={role === 'student' ? "aluno@estudantes.ifpr.edu.br" : "professor@ifpr.edu.br"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Usuário
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usuários Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>RA</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${user.id}.png`}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{roleLabels[user.role as UserRole] || 'N/A'}</Badge></TableCell>
                    <TableCell>{user.ra || 'N/A'}</TableCell>
                     <TableCell>{user.class || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum usuário registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
