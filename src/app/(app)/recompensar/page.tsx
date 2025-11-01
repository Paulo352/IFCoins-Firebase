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
import { Textarea } from '@/components/ui/textarea';
import { Award, Check, ChevronsUpDown } from 'lucide-react';
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
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import type { User as UserType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const formSchema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno.'),
  coins: z.coerce.number().min(1, 'Mínimo 1 moeda.').max(10, 'Máximo 10 moedas.'),
  reason: z.string().min(3, 'A justificativa é obrigatória.'),
});

export default function RewardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: teacher } = useUser();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const studentsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null
  , [firestore]);
  const { data: students, isLoading: studentsLoading } = useCollection<UserType>(studentsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      coins: 1,
      reason: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!teacher || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: 'Você não está logado.',
      });
      return;
    }

    try {
      const studentRef = doc(firestore, 'users', values.studentId);
      const studentDoc = await getDocs(query(collection(firestore, 'users'), where('__name__', '==', values.studentId)));

      if (studentDoc.empty) {
        toast({
          variant: 'destructive',
          title: 'Aluno não encontrado',
          description: 'O aluno selecionado não foi encontrado no banco de dados.',
        });
        return;
      }
      
      const studentData = studentDoc.docs[0].data();

      const batch = writeBatch(firestore);

      // Update student's coins
      batch.update(studentRef, {
        coins: (studentData.coins || 0) + values.coins,
      });

      // Create a reward record
      const rewardRef = collection(firestore, 'rewards');
      batch.set(doc(rewardRef), {
          teacherId: teacher.uid,
          studentId: values.studentId,
          coins: values.coins,
          reason: values.reason,
          timestamp: serverTimestamp()
      });
      
      await batch.commit();

      toast({
        title: 'Recompensa Enviada!',
        description: `O aluno recebeu ${values.coins} IFCoins.`,
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
            Selecione um aluno da lista para enviar a recompensa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Aluno</FormLabel>
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? students?.find(
                                  (student) => student.id === field.value
                                )?.name
                              : "Selecione um aluno"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar aluno..." />
                          <CommandList>
                            <CommandEmpty>{studentsLoading ? 'Carregando...' : 'Nenhum aluno encontrado.'}</CommandEmpty>
                            <CommandGroup>
                              {students?.map((student) => (
                                <CommandItem
                                  value={student.name}
                                  key={student.id}
                                  onSelect={() => {
                                    form.setValue("studentId", student.id);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      student.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <p>{student.name}</p>
                                    <p className="text-xs text-muted-foreground">{student.ra} - {student.class}</p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
