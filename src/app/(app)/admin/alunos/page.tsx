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
import { Label } from '@/components/ui/label';
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
import { useFirestore, useCollection } from '@/firebase';
import {
  addDoc,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';

const formSchema = z.object({
  ra: z.string().min(1, 'O RA é obrigatório.'),
  email: z
    .string()
    .email('E-mail inválido.')
    .refine(
      (email) => email.endsWith('@ifpr.edu.br'),
      'O e-mail deve ser institucional (@ifpr.edu.br).'
    ),
  name: z.string().min(1, 'O nome é obrigatório.'),
  class: z.string().min(1, 'A turma é obrigatória.'),
});

export default function AdminStudentsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ra: '',
      email: '',
      name: '',
      class: '',
    },
  });

  const studentsQuery = useMemo(
    () => query(collection(firestore, 'users'), where('role', '==', 'student')),
    [firestore]
  );
  const { data: students, isLoading } = useCollection(studentsQuery);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // This is a simplified user creation.
      // In a real app, you would use Firebase Admin SDK on a backend to create a user
      // and then save their data to Firestore.
      // For this client-side example, we'll just add them to the 'users' collection.
      // The user will need to have their password set up separately.
      
      const userRef = await addDoc(collection(firestore, 'users'), {
        ra: values.ra,
        email: values.email,
        name: values.name,
        class: values.class,
        role: 'student',
        coins: 0,
        collection: {},
      });

      await setDoc(doc(firestore, 'users', userRef.id), { id: userRef.id }, { merge: true });

      toast({
        title: 'Aluno Cadastrado!',
        description: `O aluno ${values.name} foi adicionado com sucesso.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description:
          'Não foi possível cadastrar o aluno. Tente novamente.',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Alunos</h1>
        <p className="text-muted-foreground">
          Cadastre novos alunos no sistema.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Novo Aluno</CardTitle>
          <CardDescription>
            O aluno será adicionado ao sistema. A criação de senha é feita no primeiro login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Aluno</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome Completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail Institucional</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="aluno@ifpr.edu.br"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Aluno
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Alunos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>RA</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${student.id}.png`}
                            alt={student.name}
                          />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.ra}</TableCell>
                     <TableCell>{student.class}</TableCell>
                    <TableCell>{student.email}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhum aluno registrado.
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
