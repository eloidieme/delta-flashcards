import { useState, useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { RotateCcw } from "lucide-react";

interface FlashcardSessionProps {
  deckId: number;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function FlashcardSession({ deckId }: FlashcardSessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const cards = useLiveQuery(() =>
    db.cards.where("deckId").equals(deckId).toArray()
  );

  const deck = useLiveQuery(() => db.decks.get(deckId));

  // Shuffle cards on mount and when cards change
  const shuffledCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    return shuffleArray(cards);
  }, [cards]);

  // Reset states when deck changes
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
  }, [deckId]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
  };

  if (!cards || !deck) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-400">Loading cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-xl text-zinc-300">This deck has no cards</p>
          <p className="text-sm text-zinc-500">Add some cards to get started</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl p-12 bg-zinc-900 border-zinc-800 rounded-xl text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Session Complete! 🎉</h2>
            <p className="text-xl text-zinc-400">
              You've reviewed all {shuffledCards.length} cards from{" "}
              <span className="text-white font-medium">{deck.title}</span>
            </p>
          </div>
          <Button onClick={handleRestart} size="lg" className="mt-6">
            <RotateCcw className="w-4 h-4 mr-2" />
            Study Again
          </Button>
        </Card>
      </div>
    );
  }

  const currentCard = shuffledCards[currentCardIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Progress */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{deck.title}</h2>
        <p className="text-zinc-400">
          Card {currentCardIndex + 1} of {shuffledCards.length}
        </p>
      </div>

      {/* Flashcard */}
      <motion.div
        className="w-full max-w-2xl cursor-pointer"
        onClick={handleCardClick}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`w-full h-80 p-12 rounded-xl flex items-center justify-center ${
            isFlipped
              ? "bg-zinc-800 border-zinc-700"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          <div className="text-center space-y-4">
            {isFlipped ? (
              <p className="text-4xl font-semibold text-zinc-300">
                {currentCard.back}
              </p>
            ) : (
              <>
                <p className="text-5xl font-bold">{currentCard.front}</p>
                <p className="text-sm text-zinc-500 mt-8">Click to reveal</p>
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Next Button */}
      <Button onClick={handleNext} size="lg" className="min-w-[200px]">
        {currentCardIndex < shuffledCards.length - 1 ? "Next Card" : "Finish"}
      </Button>
    </div>
  );
}
