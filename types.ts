export type GameCategory = 'Ação' | 'Corrida' | 'Esportes' | 'RPG' | 'Aventura' | 'Estratégia';

export interface Game {
  id: string;
  name: string;
  description: string;
  cover_art: string;
  official_price: number; // Adicionado de volta
  my_price_exclusive: number;
  my_price_parental: number;
  category: GameCategory;
  xbox_store_url: string;
}