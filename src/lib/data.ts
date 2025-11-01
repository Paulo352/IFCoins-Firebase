import type { Rarity } from './types';

export const rarityStyles: Record<Rarity, { class: string, label: string }> = {
    common: { class: 'bg-gray-200 text-gray-800 border-gray-400', label: 'Comum' },
    rare: { class: 'bg-blue-200 text-blue-800 border-blue-500', label: 'Raro' },
    legendary: { class: 'bg-purple-200 text-purple-800 border-purple-500', label: 'Lendário' },
    mythic: { class: 'bg-amber-200 text-amber-800 border-amber-500', label: 'Mítico' },
};
