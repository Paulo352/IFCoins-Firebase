import { CollectibleCard } from '@/components/collectible-card';
import { cards as allCards, users } from '@/lib/data';

export default function CollectionPage() {
  const student = users.find(u => u.role === 'student');
  const collectionCards = student ? Object.keys(student.collection).map(cardId => {
    return allCards.find(c => c.id === cardId);
  }).filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Minha Coleção</h1>
        <p className="text-muted-foreground">
          Aqui estão todas as cartas que você coletou.
        </p>
      </div>
      {collectionCards.length > 0 ? (
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
