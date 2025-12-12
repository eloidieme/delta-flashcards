import { useState } from "react";
import { DeckImporter } from "@/components/DeckImporter";
import { DeckList } from "@/components/DeckList";
import { FlashcardSession } from "@/components/FlashcardSession";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function App() {
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);

  const handleSelectDeck = (deckId: number) => {
    setActiveDeckId(deckId);
  };

  const handleBackToLibrary = () => {
    setActiveDeckId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {activeDeckId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            Delta Flashcards
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {activeDeckId ? (
          <FlashcardSession deckId={activeDeckId} />
        ) : (
          <div className="space-y-12">
            <DeckImporter />
            <DeckList onSelectDeck={handleSelectDeck} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
