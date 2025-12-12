import Dexie, { type EntityTable } from "dexie";

// TypeScript Interfaces
export interface Deck {
  id: number;
  title: string;
  createdAt: Date;
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
}

// Dexie Database Class
export class FlashcardDB extends Dexie {
  decks!: EntityTable<Deck, "id">;
  cards!: EntityTable<Card, "id">;

  constructor() {
    super("FlashcardDB");

    this.version(1).stores({
      decks: "++id, title, createdAt",
      cards: "++id, deckId, front, back",
    });
  }
}

// Export initialized db instance
export const db = new FlashcardDB();
