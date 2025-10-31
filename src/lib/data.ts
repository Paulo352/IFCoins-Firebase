import type { User, Card, Pack, Rarity } from './types';
import { PlaceHolderImages } from './placeholder-images';

function getCardImage(id: string) {
    return PlaceHolderImages.find(img => img.id === id) || {
        imageUrl: `https://picsum.photos/seed/${id}/400/560`,
        imageHint: "placeholder image",
        description: "Placeholder description"
    };
}

export const packs: Pack[] = [
    {
        id: 'pack01',
        name: 'Pacote Básico',
        price: 25,
        description: 'Um pacote com cartas básicas para começar sua coleção.',
        imageUrl: 'https://picsum.photos/seed/pack01/400/560',
        imageHint: 'treasure chest'
    },
    {
        id: 'pack02',
        name: 'Pacote Raro Mensal',
        price: 100,
        description: 'Contém pelo menos uma carta rara. Limitado por mês.',
        imageUrl: 'https://picsum.photos/seed/pack02/400/560',
        imageHint: 'glowing chest'
    }
]

export const rarityStyles: Record<Rarity, { class: string, label: string }> = {
    common: { class: 'bg-gray-200 text-gray-800 border-gray-400', label: 'Comum' },
    rare: { class: 'bg-blue-200 text-blue-800 border-blue-500', label: 'Raro' },
    legendary: { class: 'bg-purple-200 text-purple-800 border-purple-500', label: 'Lendário' },
    mythic: { class: 'bg-amber-200 text-amber-800 border-amber-500', label: 'Mítico' },
};
