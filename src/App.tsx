import React, { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Mic2, Music, ListMusic, Info } from 'lucide-react';
import { AddRequestForm } from './components/AddRequestForm';
import { QueueList } from './components/QueueList';
import { SongRequest } from './types';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import { io, Socket } from 'socket.io-client';

export default function App() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [isRequestOnly, setIsRequestOnly] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsRequestOnly(params.get('view') === 'request' || params.get('mode') === 'kiosk');

    // Initialize socket connection
    const socket = io();
    socketRef.current = socket;

    socket.on('initial_state', (initialRequests: SongRequest[]) => {
      setRequests(initialRequests);
    });

    socket.on('request_added', (newRequest: SongRequest) => {
      setRequests(prev => {
        if (prev.find(r => r.id === newRequest.id)) return prev;
        return [...prev, newRequest];
      });
    });

    socket.on('request_removed', (id: string) => {
      setRequests(prev => prev.filter(r => r.id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addRequest = (singer: string, songTitle: string) => {
    const newRequest: SongRequest = {
      id: crypto.randomUUID(),
      singer,
      songTitle,
      artist: '',
      status: 'waiting',
      createdAt: Date.now(),
    };
    
    socketRef.current?.emit('add_request', newRequest);
    
    toast.success(`${singer} adicionado(a) à fila!`, {
      style: {
        background: '#1e1e2e',
        color: '#fff',
        border: '1px solid rgba(0, 255, 255, 0.2)',
      },
    });
  };

  const handleStatusChange = (id: string, status: SongRequest['status']) => {
    socketRef.current?.emit('update_status', { id, status });
  };

  const removeRequest = (id: string) => {
    socketRef.current?.emit('remove_request', id);
  };

  const clearAll = () => {
    if (confirm('Limpar todos os pedidos?')) {
      socketRef.current?.emit('clear_all');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-neon-blue/30">
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neon-blue rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)]">
              <Mic2 className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black tracking-tighter text-white uppercase">
                Karaoke<span className="text-neon-blue">Fila</span>
              </h1>
              <p className="text-[10px] font-mono text-neon-blue/60 uppercase tracking-widest">Sistema de Gerenciamento</p>
            </div>
          </div>
          
          {!isRequestOnly && (
            <div className="hidden md:flex items-center gap-6 text-sm font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                {requests.filter(r => r.status === 'waiting').length} Na Fila
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-pink" />
                {requests.filter(r => r.status === 'singing').length} Cantando
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className={cn(
          "grid gap-8",
          isRequestOnly ? "max-w-xl mx-auto" : "grid-cols-1 lg:grid-cols-12"
        )}>
          
          {/* Left Column: Form & Info */}
          <div className={isRequestOnly ? "" : "lg:col-span-4 space-y-8"}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <AddRequestForm onAdd={addRequest} />
            </motion.div>
          </div>

          {/* Right Column: Queue */}
          {!isRequestOnly && (
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                    <ListMusic className="w-6 h-6 text-neon-blue" /> 
                    Lineup da Noite
                  </h2>
                  <button 
                    onClick={clearAll}
                    className="text-xs font-mono text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest"
                  >
                    Limpar Tudo
                  </button>
                </div>
                
                <QueueList 
                  requests={requests} 
                  onStatusChange={handleStatusChange} 
                  onRemove={removeRequest} 
                />
              </motion.div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="py-12 border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs font-mono text-slate-600 uppercase tracking-[0.3em]">
            Deixe a música rolar • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
