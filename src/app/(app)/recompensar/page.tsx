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
import { Textarea } from '@/components/ui/textarea';
import { Award } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';

const formSchema = z.object({
  studentIdentifier: z.string().min(1, 'O RA do aluno ou turma é obrigatório.'),
  coins: z.coerce.number().min(1, 'Mínimo 1 moeda.').max(10, 'Máximo 10 moedas.'),
  reason: z.string().min(3, 'A justificativa é obrigatória.'),
});

export default function RewardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: teacher } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentIdentifier: '',
      coins: 1,
      reason: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!teacher) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você não está logado.',
      });
      return;
    }

    try {
      const usersRef = collection(firestore, 'users');
      // Check if identifier is RA (numeric) or class (string)
      const isRa = /^\d+$/.test(values.studentIdentifier);
      
      const q = isRa
        ? query(usersRef, where('ra', '==', values.studentIdentifier), where('role', '==', 'student'))
        : query(usersRef, where('class', '==', values.studentIdentifier.toUpperCase()), where('role', '==', 'student'));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Aluno(s) não encontrado(s)',
          description: 'Nenhum aluno corresponde ao identificador fornecido.',
        });
        return;
      }

      const batch = writeBatch(firestore);
      let studentCount = 0;

      querySnapshot.forEach((doc) => {
        studentCount++;
        const student = doc.data();
        const studentRef = doc.ref;

        // Update student's coins
        batch.update(studentRef, {
          coins: (student.coins || 0) + values.coins,
        });

        // Create a reward record
        const rewardRef = collection(firestore, 'rewards');
        batch.set(doc(rewardRef), {
            teacherId: teacher.uid,
            studentId: doc.id,
            coins: values.coins,
            reason: values.reason,
            timestamp: serverTimestamp()
        });
      });

      await batch.commit();

      toast({
        title: 'Recompensa Enviada!',
        description: `${studentCount} aluno(s) receberam ${values.coins} IFCoins.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error sending reward:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao recompensar',
        description: 'Não foi possível enviar a recompensa. Tente novamente.',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Recompensar Aluno</h1>
        <p className="text-muted-foreground">
          Distribua IFCoins para alunos por bom comportamento ou desempenho.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nova Recompensa</CardTitle>
          <CardDescription>
            Você pode recompensar um aluno pelo RA ou uma turma inteira pelo nome da turma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studentIdentifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RA do Aluno ou Turma</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2023001 ou 2A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade de IFCoins</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1-10"
                        {...field}
                      />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificativa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Ajudou a limpar o laboratório."
                        {...field}
                      />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Award className="mr-2 h-4 w-4" />
                Enviar Recompensa
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
