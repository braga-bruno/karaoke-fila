import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle2, Trash2, Clock, Mic2 } from 'lucide-react';
import { SongRequest } from '../types';
import { cn } from '../lib/utils';

interface QueueListProps {
  requests: SongRequest[];
  onStatusChange: (id: string, status: SongRequest['status']) => void;
  onRemove: (id: string) => void;
}

export function QueueList({ requests, onStatusChange, onRemove }: QueueListProps) {
  const waiting = requests.filter(r => r.status === 'waiting');
  const singing = requests.filter(r => r.status === 'singing');
  const completed = requests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Now Singing Section */}
      {singing.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-neon-pink font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <Mic2 className="w-4 h-4 animate-pulse" /> No Palco Agora
          </h3>
          <div className="grid gap-4">
            {singing.map(req => (
              <motion.div
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={req.id}
                className="glass-panel p-6 border-neon-pink/40 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink shadow-[0_0_15px_rgba(255,0,255,0.5)]" />
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-2xl font-display font-black text-white mb-1 uppercase tracking-tight">
                      {req.singer}
                    </h4>
                    <p className="text-neon-pink font-mono text-lg font-bold">
                      {req.songTitle}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStatusChange(req.id, 'completed')}
                      className="p-3 rounded-full bg-neon-pink/20 text-neon-pink hover:bg-neon-pink hover:text-black transition-all"
                      title="Finalizar Performance"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Waiting Queue */}
      <section className="space-y-4">
        <h3 className="text-neon-blue font-display font-bold uppercase tracking-widest text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" /> Próximos da Fila
        </h3>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {waiting.length === 0 ? (
              <p className="text-slate-500 italic py-8 text-center glass-panel border-dashed">O palco está vazio. Seja o primeiro a cantar!</p>
            ) : (
              waiting.map((req, index) => (
                <motion.div
                  layout
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  key={req.id}
                  className="glass-panel p-4 flex justify-between items-center group hover:border-neon-blue/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-neon-blue/40 font-bold text-xl w-8">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-bold text-white">{req.singer}</h4>
                      <p className="text-sm text-slate-400">
                        {req.songTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onStatusChange(req.id, 'singing')}
                      className="p-2 rounded-lg hover:bg-neon-blue/20 text-neon-blue transition-all"
                      title="Começar a Cantar"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onRemove(req.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                      title="Remover"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Completed Section (Optional/Collapsible) */}
      {completed.length > 0 && (
        <section className="space-y-4 opacity-50">
          <h3 className="text-slate-500 font-display font-bold uppercase tracking-widest text-xs">
            Cantaram Recentemente
          </h3>
          <div className="space-y-2">
            {completed.slice(0, 5).map(req => (
              <div key={req.id} className="flex justify-between items-center text-sm px-4 py-2 border-b border-white/5">
                <span className="text-slate-300">{req.singer} - {req.songTitle}</span>
                <span className="text-xs text-slate-600">Finalizado</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
