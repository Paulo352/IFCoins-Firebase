export type UserRole = 'student' | 'teacher' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ra?: string;
  class?: string;
  coins: number;
  collectionSize?: number; // Total number of cards
  photoURL?: string;
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
  price: number | null;
};

export type Pack = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type Trade = {
    id: string;
    fromUserId: string;
    fromUserName?: string;
    toUserId: string;
    toUserName?: string;
    offeredCards: string[]; // array of card IDs
    requestedCards: string[]; // array of card IDs
    offeredCoins: number;
    requestedCoins: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: any; // Firestore Timestamp
}

export type UserCard = {
  id: string;
  userId: string;
  cardId: string;
  quantity: number;
};
