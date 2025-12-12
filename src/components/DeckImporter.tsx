import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { db } from "@/db";
import { Upload } from "lucide-react";

interface ImportedDeck {
  title: string;
  cards: Array<{
    front: string;
    back: string;
  }>;
}

export function DeckImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const data: ImportedDeck = JSON.parse(text);

      // Validate structure
      if (!data.title || !Array.isArray(data.cards)) {
        throw new Error("Invalid JSON structure. Expected { title, cards }.");
      }

      if (data.cards.length === 0) {
        throw new Error("No cards found in the deck.");
      }

      // Validate cards
      for (const card of data.cards) {
        if (!card.front || !card.back) {
          throw new Error("Each card must have 'front' and 'back' properties.");
        }
      }

      // Save deck to database
      const deckId = await db.decks.add({
        title: data.title,
        createdAt: new Date(),
      } as any);

      // Save cards to database
      const cards = data.cards.map((card) => ({
        deckId: deckId as number,
        front: card.front,
        back: card.back,
      }));

      await db.cards.bulkAdd(cards as any);

      alert(
        `✅ Successfully imported "${data.title}" with ${data.cards.length} cards!`
      );

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Import error:", error);
      alert(
        `❌ Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 bg-zinc-900 border-zinc-800 rounded-xl">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Upload className="w-12 h-12 mx-auto text-zinc-500" />
          <h2 className="text-xl font-medium">Import Deck</h2>
          <p className="text-zinc-400 text-sm">
            Upload a JSON file to import a new deck
          </p>
        </div>

        <div className="space-y-3">
          <Input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            disabled={isImporting}
            className="cursor-pointer bg-zinc-800 border-zinc-700 text-white file:text-zinc-400"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? "Importing..." : "Choose File"}
          </Button>
        </div>

        <div className="text-xs text-zinc-500 text-center space-y-1">
          <p>Expected format:</p>
          <code className="block bg-zinc-950 p-2 rounded text-left">
            {`{ "title": "...", "cards": [{ "front": "...", "back": "..." }] }`}
          </code>
        </div>
      </div>
    </Card>
  );
}
