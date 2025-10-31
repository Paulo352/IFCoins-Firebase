'use client';
import { CollectibleCard } from '@/components/collectible-card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import type { Card, User } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CollectionPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [collectionCards, setCollectionCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userCardsCollection = useMemoFirebase(() => {
      if (!user) return null;
      return collection(firestore, 'users', user.uid, 'cards');
  }, [firestore, user]);

  const { data: userCards, isLoading: isLoadingUserCards } = useCollection(userCardsCollection);


  useEffect(() => {
    if (userCards) {
      const fetchCardDetails = async () => {
        setIsLoading(true);
        const cardPromises = userCards
        .filter(userCard => userCard.quantity > 0)
        .map(userCard => {
            const cardRef = doc(firestore, 'cards', userCard.id);
            return getDoc(cardRef);
        });

        const cardDocs = await Promise.all(cardPromises);
        const cardsData = cardDocs
          .map(doc => doc.exists() ? doc.data() as Card : null)
          .filter((card): card is Card => card !== null);
        
        setCollectionCards(cardsData);
        setIsLoading(false);
      };
      fetchCardDetails();
    } else if(!isLoadingUserCards) {
        setCollectionCards([]);
        setIsLoading(false);
    }
  }, [userCards, firestore, isLoadingUserCards]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Minha Coleção</h1>
        <p className="text-muted-foreground">
          Aqui estão todas as cartas que você coletou.
        </p>
      </div>
      {isLoading ? (
         <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[2.5/3.5] w-full">
                    <Skeleton className="h-full w-full rounded-xl" />
                </div>
            ))}
        </div>
      ) : collectionCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {collectionCards.map((card) => (
            card && <CollectibleCard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <h3 className="text-xl font-semibold">Sua coleção está vazia</h3>
            <p className="mt-2 text-muted-foreground">Visite a loja para comprar pacotes e começar sua coleção!</p>
        </div>
      )}
    </div>
  );
}
