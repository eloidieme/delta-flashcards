import { useLiveQuery } from "dexie-react-hooks";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { BookOpen } from "lucide-react";

interface DeckListProps {
  onSelectDeck: (deckId: number) => void;
}

export function DeckList({ onSelectDeck }: DeckListProps) {
  const decks = useLiveQuery(() => db.decks.toArray());

  const getDeckCardCount = useLiveQuery(async () => {
    if (!decks) return {};

    const counts: Record<number, number> = {};
    for (const deck of decks) {
      const count = await db.cards.where("deckId").equals(deck.id).count();
      counts[deck.id] = count;
    }
    return counts;
  }, [decks]);

  if (!decks || !getDeckCardCount) {
    return <div className="text-center text-zinc-400">Loading decks...</div>;
  }

  if (decks.length === 0) {
    return (
      <div className="text-center space-y-4">
        <BookOpen className="w-16 h-16 mx-auto text-zinc-600" />
        <div>
          <h3 className="text-lg font-medium text-zinc-300">No decks yet</h3>
          <p className="text-sm text-zinc-500">Import a deck to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Decks</h2>
        <p className="text-zinc-400 text-sm mt-1">
          {decks.length} {decks.length === 1 ? "deck" : "decks"} available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => (
          <Card
            key={deck.id}
            onClick={() => onSelectDeck(deck.id)}
            className="p-6 bg-zinc-900 border-zinc-800 rounded-xl cursor-pointer transition-all hover:bg-zinc-800 hover:border-zinc-700 hover:scale-[1.02]"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <BookOpen className="w-5 h-5 text-zinc-500" />
                <span className="text-xs text-zinc-500">
                  {new Date(deck.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="font-medium text-lg line-clamp-2">
                  {deck.title}
                </h3>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <p className="text-sm text-zinc-400">
                  {getDeckCardCount[deck.id] || 0} cards
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
