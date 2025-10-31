import type { User, Card, Pack, Rarity } from './types';
import { PlaceHolderImages } from './placeholder-images';

function getCardImage(id: string) {
    return PlaceHolderImages.find(img => img.id === id) || {
        imageUrl: `https://picsum.photos/seed/${id}/400/560`,
        imageHint: "placeholder image",
        description: "Placeholder description"
    };
}


export const users: User[] = [
  {
    id: 'student1',
    name: 'Aluno Teste',
    email: 'aluno@estudantes.ifpr.edu.br',
    role: 'student',
    ra: '2024001',
    class: '3A',
    coins: 200,
    collection: { },
  },
  {
    id: 'teacher1',
    name: 'Professor Teste',
    email: 'professor@ifpr.edu.br',
    role: 'teacher',
    coins: 0,
    collection: {},
  },
  {
    id: 'admin1',
    name: 'Paulo Cauan',
    email: 'paulocauan39@gmail.com',
    role: 'admin',
    coins: 9999,
    collection: {},
  },
];

export const cards: Card[] = [
  {
    id: 'card001',
    name: 'Energia Solar',
    rarity: 'common',
    ...getCardImage('card001'),
    available: true,
    copiesAvailable: null,
    eventId: null,
    price: 10,
  },
  {
    id: 'card002',
    name: 'Espírito da Árvore',
    rarity: 'rare',
    ...getCardImage('card002'),
    available: true,
    copiesAvailable: 50,
    eventId: 'event01',
    price: 50,
  },
  {
    id: 'card003',
    name: 'Laboratório Futurista',
    rarity: 'legendary',
    ...getCardImage('card003'),
    available: true,
    copiesAvailable: 10,
    eventId: null,
    price: 200,
  },
  {
    id: 'card004',
    name: 'Cérebro Cibernético',
    rarity: 'mythic',
    ...getCardImage('card004'),
    available: true,
    copiesAvailable: 5,
    eventId: null,
    price: 500,
  },
  {
    id: 'card005',
    name: 'Livro de Feitiços',
    rarity: 'common',
    ...getCardImage('card005'),
    available: true,
    copiesAvailable: null,
    eventId: null,
    price: 15,
  },
  {
    id: 'card006',
    name: 'Horta Escolar',
    rarity: 'rare',
    ...getCardImage('card006'),
    available: true,
    copiesAvailable: null,
    eventId: 'event01',
    price: 40,
  },
  {
    id: 'card007',
    name: 'Robô Ajudante',
    rarity: 'common',
    ...getCardImage('card007'),
    available: true,
    copiesAvailable: null,
    eventId: null,
    price: 5,
  },
  {
    id: 'card008',
    name: 'Mascote do IF',
    rarity: 'legendary',
    ...getCardImage('card008'),
    available: true,
    copiesAvailable: 20,
    eventId: null,
    price: 250,
  },
];

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
