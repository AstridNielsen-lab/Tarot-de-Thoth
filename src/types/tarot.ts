export interface TarotCard {
  id: string;
  name: string;
  englishName: string;
  number?: string;
  suit?: string;
  element?: string;
  description: string;
  keywords: string[];
  category: 'major' | 'court' | 'minor';
}

export interface Suit {
  name: string;
  element: string;
  description: string;
}