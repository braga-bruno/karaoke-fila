import React, { useState } from 'react';
import { Plus, User, Music } from 'lucide-react';

interface AddRequestFormProps {
  onAdd: (singer: string, song: string) => void;
}

export function AddRequestForm({ onAdd }: AddRequestFormProps) {
  const [singer, setSinger] = useState('');
  const [song, setSong] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singer || !song) return;
    onAdd(singer, song);
    setSong('');
    setSinger('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4 border-neon-blue/20">
        <h2 className="text-xl font-display font-bold flex items-center gap-2 text-neon-blue">
          <Plus className="w-5 h-5" /> Novo Pedido
        </h2>
        
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              required
              value={singer}
              onChange={(e) => setSinger(e.target.value)}
              placeholder="Seu Nome"
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
            />
          </div>

          <div className="relative">
            <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              required
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="Música"
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neon-blue transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-neon-blue hover:bg-neon-blue/80 text-black font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Adicionar à Fila
          </button>
        </div>
      </form>
    </div>
  );
}
