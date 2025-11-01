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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookUp, Upload } from 'lucide-react';
import { rarityStyles } from '@/lib/data';
import { IFCoinIcon } from '@/components/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useMemo, useState } from 'react';
import type { Card as CardType } from '@/lib/types';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  rarity: z.enum(['common', 'rare', 'legendary', 'mythic']),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  copiesAvailable: z.coerce.number().nullable(),
  price: z.coerce.number().min(0, 'O preço deve ser positivo.').nullable(),
  image: z.instanceof(File).refine(file => file.size > 0, "A imagem é obrigatória."),
});

export default function AdminCardsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = getStorage();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      copiesAvailable: null,
      price: null,
    },
  });

  const cardsQuery = useMemoFirebase(
    () => collection(firestore, 'cards'),
    [firestore]
  );
  const { data: cards, isLoading } = useCollection<CardType>(cardsQuery);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUploading(true);
    try {
      const imageFile = values.image;
      const storageRef = ref(storage, `cards/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const cardData = {
        name: values.name,
        rarity: values.rarity,
        description: values.description,
        copiesAvailable: values.copiesAvailable,
        price: values.price,
        imageUrl: imageUrl,
        available: true,
        eventId: null,
        imageHint: 'custom card'
      };

      const docRef = await addDoc(collection(firestore, 'cards'), cardData);
      await setDoc(doc(firestore, 'cards', docRef.id), { id: docRef.id }, { merge: true });


      toast({
        title: 'Carta Cadastrada!',
        description: `A carta ${values.name} foi adicionada com sucesso.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar a carta. Tente novamente.',
      });
    } finally {
        setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Cartas</h1>
        <p className="text-muted-foreground">
          Adicione e edite as cartas colecionáveis do sistema.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastrar Nova Carta</CardTitle>
          <CardDescription>
            Preencha os detalhes da nova carta colecionável.
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
                    <FormLabel>Nome da Carta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Energia Solar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raridade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a raridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(rarityStyles).map(
                          ([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Uma breve descrição da carta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copiesAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cópias Disponíveis</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Deixe em branco para infinito"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (IFCoins)</FormLabel>
                    <div className="relative">
                      <IFCoinIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Opcional, para venda direta"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                           value={field.value ?? ''}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Imagem da Carta</FormLabel>
                     <FormControl>
                        <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'Enviando...' : <>
                <BookUp className="mr-2 h-4 w-4" />
                Cadastrar Carta
                </>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cartas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {isLoading ? (
              <p>Carregando cartas...</p>
            ) : cards && cards.length > 0 ? (
              cards.map((card) => (
                <div key={card.id} className="relative aspect-[2.5/3.5] w-full">
                   <Image src={card.imageUrl} alt={card.name} width={400} height={560} className="object-cover rounded-lg w-full h-full" />
                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                       <p className="font-bold truncate">{card.name}</p>
                       <p className="text-xs">{rarityStyles[card.rarity].label}</p>
                   </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-full text-center">
                Nenhuma carta registrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
