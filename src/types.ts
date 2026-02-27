export interface SongRequest {
  id: string;
  singer: string;
  songTitle: string;
  artist: string;
  status: 'waiting' | 'singing' | 'completed';
  createdAt: number;
}

export interface SongSuggestion {
  title: string;
  artist: string;
  reason: string;
}
