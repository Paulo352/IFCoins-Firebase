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
import { CalendarPlus } from 'lucide-react';
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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(3, 'O nome do evento é obrigatório.'),
  startDate: z.date({ required_error: 'A data de início é obrigatória.' }),
  endDate: z.date({ required_error: 'A data de fim é obrigatória.' }),
  bonusMultiplier: z.coerce.number().min(1, 'O multiplicador deve ser no mínimo 1.'),
});


export default function AdminEventsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            bonusMultiplier: 1,
        },
    });

    const eventsQuery = useMemoFirebase(
        () => collection(firestore, 'events'),
        [firestore]
    );
    const { data: events, isLoading } = useCollection<Event>(eventsQuery);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await addDoc(collection(firestore, 'events'), {
                ...values,
                createdAt: serverTimestamp(),
            });

            toast({
                title: 'Evento Criado!',
                description: `O evento "${values.name}" foi criado com sucesso.`,
            });
            form.reset();
        } catch (error) {
            console.error('Error creating event:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao criar evento',
                description: 'Não foi possível criar o evento. Tente novamente.',
            });
        }
    }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Eventos</h1>
        <p className="text-muted-foreground">
          Crie e gerencie eventos escolares com bônus e cartas especiais.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Criar Novo Evento</CardTitle>
          <CardDescription>
            Defina o período, multiplicador de moedas e cartas do evento.
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
                            <FormLabel>Nome do Evento</FormLabel>
                            <FormControl>
                            <Input placeholder="Ex: Semana do Meio Ambiente" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Data de Início</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Selecione uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Data de Fim</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Selecione uma data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="bonusMultiplier"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Multiplicador de Moedas</FormLabel>
                            <FormControl>
                            <Input type="number" min="1" placeholder="Ex: 2 para 2x" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div>
                        <FormLabel>Cartas Especiais</FormLabel>
                        <p className="text-sm text-muted-foreground">(Funcionalidade a ser implementada)</p>
                    </div>
                    <Button type="submit" className="w-full">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Criar Evento
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Criados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Bônus</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Carregando...</TableCell>
                    </TableRow>
                ) : events && events.length > 0 ? (
                    events.map(event => (
                        <TableRow key={event.id}>
                            <TableCell>{event.name}</TableCell>
                            <TableCell>{format(event.startDate.toDate(), "dd/MM/yyyy")}</TableCell>
                            <TableCell>{format(event.endDate.toDate(), "dd/MM/yyyy")}</TableCell>
                            <TableCell>{event.bonusMultiplier}x</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                         <TableCell colSpan={4} className="text-center">Nenhum evento criado.</TableCell>
                    </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
