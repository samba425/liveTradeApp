export interface NewsArticle {
  source: {
    id?: string;
    name: string;
  };
  author?: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content?: string;
  category?: 'market' | 'stock' | 'economy' | 'general';
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}
