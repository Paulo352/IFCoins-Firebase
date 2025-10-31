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
import { packs } from '@/lib/data';
import Image from 'next/image';
import { CoinIcon } from '@/components/icons';
import { ShoppingBag } from 'lucide-react';

export default function ShopPage() {
  const { toast } = useToast();

  const handlePurchase = (packName: string, price: number) => {
    toast({
      title: 'Compra realizada!',
      description: `Você comprou um ${packName} por ${price} IFCoins.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Loja de Cartas</h1>
        <p className="text-muted-foreground">
          Use seus IFCoins para adquirir novos pacotes de cartas.
        </p>
      </div>
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
                onClick={() => handlePurchase(pack.name, pack.price)}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Comprar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
