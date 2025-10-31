'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card as UICard, CardContent } from './ui/card';
import type { Card } from '@/lib/types';
import { rarityStyles } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Eye, Info } from 'lucide-react';

interface CollectibleCardProps {
  card: Card;
  showcase?: boolean;
}

export function CollectibleCard({ card, showcase = false }: CollectibleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarity = rarityStyles[card.rarity];

  const handleFlip = () => {
    if (!showcase) setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn('group aspect-[2.5/3.5] w-full [perspective:1000px]')}
      onClick={handleFlip}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-xl shadow-lg transition-transform duration-500 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front */}
        <div className="absolute h-full w-full rounded-xl [backface-visibility:hidden]">
          <Image
            src={card.imageUrl}
            alt={card.name}
            width={400}
            height={560}
            data-ai-hint={card.imageHint}
            className="h-full w-full rounded-xl object-cover"
          />
          <div className="absolute inset-0 rounded-xl bg-black/20" />
          <div className="absolute top-2 right-2">
             <Badge className={cn('text-sm', rarity.class)}>{rarity.label}</Badge>
          </div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-2xl font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)]">
              {card.name}
            </h3>
          </div>
          {!showcase && (
            <div className="absolute top-2 left-2 flex items-center justify-center rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Info className="h-5 w-5" />
            </div>
          )}
        </div>
        {/* Back */}
        <div className="absolute h-full w-full rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <UICard className={cn('h-full w-full flex flex-col justify-between', rarity.class.replace(/bg-\w+-200/, 'bg-white dark:bg-card'))} style={{borderWidth: '4px', borderColor: `hsl(var(--${card.rarity === 'common' ? 'muted' : card.rarity === 'rare' ? 'primary' : card.rarity === 'legendary' ? 'secondary' : 'accent'}))`}}>
              <CardContent className="p-4 text-center flex flex-col items-center justify-center flex-1">
                <h3 className="text-xl font-bold">{card.name}</h3>
                <Badge variant="secondary" className={cn('mt-2', rarity.class)}>{rarity.label}</Badge>
                <p className="mt-4 text-sm text-muted-foreground">{card.description}</p>
                 {card.copiesAvailable !== null && (
                    <p className="mt-2 text-xs font-bold text-primary">Apenas {card.copiesAvailable} cópias!</p>
                 )}
              </CardContent>
              <div className="p-4 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={handleFlip}>
                    <Eye className="mr-2 h-4 w-4" /> Ver Arte
                </Button>
              </div>
          </UICard>
        </div>
      </div>
    </div>
  );
}
