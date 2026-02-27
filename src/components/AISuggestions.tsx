import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Sparkles, Music, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { SongSuggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export function AISuggestions({ onSelect }: { onSelect: (song: { title: string, artist: string }) => void }) {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<SongSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Suggest 3 karaoke songs based on this mood/genre: "${prompt}". Provide the response as a JSON array of objects with title, artist, and a short reason.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["title", "artist", "reason"],
            },
          },
        },
      });

      const data = JSON.parse(response.text || '[]');
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 glass-panel border-neon-purple/30">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-neon-pink" />
        <h3 className="font-display font-semibold text-lg">Sugestões por IA</h3>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Rock anos 80, Baladas tristes, Disney..."
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-neon-pink transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && getSuggestions()}
        />
        <button
          onClick={getSuggestions}
          disabled={loading}
          className="bg-neon-pink hover:bg-neon-pink/80 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
          Buscar
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="grid gap-2 mt-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect({ title: s.title, artist: s.artist })}
              className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <div className="font-semibold text-neon-blue group-hover:neon-text-blue">{s.title}</div>
              <div className="text-sm opacity-70">{s.artist}</div>
              <div className="text-xs italic opacity-50 mt-1">"{s.reason}"</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
