export type UserRole = 'student' | 'teacher' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ra?: string;
  class?: string;
  coins: number;
  collection: Record<string, number>;
};

export type Rarity = 'common' | 'rare' | 'legendary' | 'mythic';

export type Card = {
  id: string;
  name: string;
  rarity: Rarity;
  imageUrl: string;
  imageHint: string;
  available: boolean;
  copiesAvailable: number | null;
  eventId: string | null;
  description: string;
};

export type Pack = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  imageHint: string;
};
