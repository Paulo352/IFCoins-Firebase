'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Pack, Card as CardType, Rarity, User } from '@/lib/types';
import Image from 'next/image';
import { CoinIcon } from '@/components/icons';
import { ShoppingBag } from 'lucide-react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, doc, writeBatch, runTransaction } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const rarityProbabilities: Record<Rarity, number> = {
  common: 0.7,
  rare: 0.2,
  legendary: 0.08,
  mythic: 0.02,
};

function getRandomCardByRarity(cards: CardType[]): CardType {
    const rand = Math.random();
    let cumulativeProbability = 0;

    const rarities: Rarity[] = ['common', 'rare', 'legendary', 'mythic'];

    for (const rarity of rarities) {
        cumulativeProbability += rarityProbabilities[rarity];
        if (rand <= cumulativeProbability) {
            const possibleCards = cards.filter(c => c.rarity === rarity && c.available);
            if (possibleCards.length > 0) {
                return possibleCards[Math.floor(Math.random() * possibleCards.length)];
            }
        }
    }
    // Fallback to a random available card if something goes wrong
    const availableCards = cards.filter(c => c.available);
    return availableCards[Math.floor(Math.random() * availableCards.length)];
}


export default function ShopPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const packsQuery = useMemo(() => collection(firestore, 'packs'), [firestore]);
  const { data: packs, isLoading: packsLoading } = useCollection<Pack>(packsQuery);
  const cardsQuery = useMemo(() => collection(firestore, 'cards'), [firestore]);
  const { data: allCards, isLoading: cardsLoading } = useCollection<CardType>(cardsQuery);
  
  const userDocRef = useMemo(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userData } = useDoc<User>(userDocRef);


  const handlePurchase = async (pack: Pack) => {
    if (!user || !userData || !allCards) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Você precisa estar logado para comprar.',
      });
      return;
    }

    if (userData.coins < pack.price) {
        toast({
            variant: 'destructive',
            title: 'Saldo insuficiente',
            description: `Você não tem IFCoins suficientes para comprar o ${pack.name}.`,
        });
        return;
    }

    try {
        await runTransaction(firestore, async (transaction) => {
            const userRef = doc(firestore, 'users', user.uid);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "Documento do usuário não existe!";
            }
            const currentCoins = userDoc.data().coins;
            if (currentCoins < pack.price) {
                throw "Saldo insuficiente!";
            }

            // Simulate opening 3 cards
            const obtainedCards: CardType[] = [];
            for (let i = 0; i < 3; i++) {
                obtainedCards.push(getRandomCardByRarity(allCards));
            }

            const newCollection = { ...userDoc.data().collection };
            const newCardsNames: string[] = [];

            obtainedCards.forEach(card => {
                 const userCardRef = doc(firestore, 'users', user.uid, 'cards', card.id);
                 const currentQuantity = newCollection[card.id] || 0;
                 if(currentQuantity === 0) newCardsNames.push(card.name);

                 newCollection[card.id] = currentQuantity + 1;
                 transaction.set(userCardRef, { id: card.id, userId: user.uid, cardId: card.id, quantity: currentQuantity + 1}, { merge: true });
            });


            transaction.update(userRef, { 
                coins: currentCoins - pack.price,
                collection: newCollection
            });

            toast({
              title: 'Compra realizada!',
              description: `Você comprou um ${pack.name} e obteve: ${obtainedCards.map(c => c.name).join(', ')}.`,
            });
             if (newCardsNames.length > 0) {
                setTimeout(() => {
                    toast({
                        title: 'Novas cartas na coleção!',
                        description: `Você adicionou: ${newCardsNames.join(', ')}.`,
                    });
                }, 1000);
            }
        });

    } catch (e) {
        console.error("Purchase failed: ", e);
        toast({
            variant: "destructive",
            title: "A transação falhou",
            description: typeof e === 'string' ? e : "Ocorreu um erro durante a compra."
        });
    }
  };

  const PageSkeleton = () => (
     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
                <Skeleton className="aspect-[3/2] w-full" />
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter className="flex flex-col items-start gap-4">
                     <Skeleton className="h-8 w-20" />
                     <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
     </div>
  );

  if (packsLoading || cardsLoading) {
      return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Loja de Cartas</h1>
                <p className="text-muted-foreground">
                Use seus IFCoins para adquirir novos pacotes de cartas.
                </p>
            </div>
            <PageSkeleton />
        </div>
      );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Loja de Cartas</h1>
        <p className="text-muted-foreground">
          Use seus IFCoins para adquirir novos pacotes de cartas.
        </p>
      </div>
       {packs && packs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packs.map((pack) => (
              <Card key={pack.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={pack.imageUrl}
                    alt={pack.name}
                    fill
                    data-ai-hint={pack.imageHint}
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{pack.name}</CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter className="flex flex-col items-start gap-4">
                  <div className="flex items-center gap-2 font-bold text-lg text-amber-500">
                    <CoinIcon className="h-6 w-6" />
                    <span>{pack.price}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(pack)}
                    disabled={!user || !allCards || !userData}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Comprar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
            <div className="text-center text-muted-foreground p-12 rounded-lg border-2 border-dashed">
                <p>Nenhum pacote disponível na loja no momento.</p>
            </div>
        )}
    </div>
  );
}
