import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NewsArticle, NewsResponse } from './shared/models/news.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private newsSubject = new BehaviorSubject<NewsArticle[]>([]);
  public news$ = this.newsSubject.asObservable();
  
  private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  fetchMarketNews(): Observable<any> {
    // This will call our backend which will proxy the NewsAPI request
    return this.http.get(`${this.apiUrl}news/market`);
  }

  fetchStockNews(symbol: string): Observable<any> {
    return this.http.get(`${this.apiUrl}news/stock?symbol=${symbol}`);
  }

  async getMarketNews(): Promise<void> {
    try {
      this.fetchMarketNews().subscribe(
        (response: any) => {
          if (response && response.articles) {
            const articles = response.articles.map((article: NewsArticle) => ({
              ...article,
              category: 'market' as 'market'
            }));
            this.newsSubject.next(articles);
          }
        },
        error => {
          console.error('Error fetching market news:', error);
          // Fallback to sample news if API fails
          this.newsSubject.next(this.getSampleNews());
        }
      );
    } catch (error) {
      console.error('Error fetching market news:', error);
      this.newsSubject.next(this.getSampleNews());
    }
  }

  async getStockNews(symbol: string): Promise<void> {
    try {
      this.fetchStockNews(symbol).subscribe(
        (response: any) => {
          if (response && response.articles) {
            const articles = response.articles.map((article: NewsArticle) => ({
              ...article,
              category: 'stock' as 'stock'
            }));
            this.newsSubject.next(articles);
          }
        },
        error => {
          console.error('Error fetching stock news:', error);
          this.newsSubject.next(this.getSampleNews());
        }
      );
    } catch (error) {
      console.error('Error fetching stock news:', error);
      this.newsSubject.next(this.getSampleNews());
    }
  }

  private getSampleNews(): NewsArticle[] {
    return [
      {
        source: { name: 'Economic Times' },
        title: 'Nifty 50 reaches new high amid strong market sentiment',
        description: 'The benchmark Nifty 50 index touched a new record high today as investors showed strong confidence in the Indian market.',
        url: 'https://economictimes.com',
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: 'Full article content here...',
        category: 'market'
      },
      {
        source: { name: 'Business Standard' },
        title: 'IT stocks rally on positive Q4 earnings outlook',
        description: 'Information Technology stocks saw significant gains as major companies reported better-than-expected earnings.',
        url: 'https://business-standard.com',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'Full article content here...',
        category: 'market'
      },
      {
        source: { name: 'MoneyControl' },
        title: 'Banking sector shows resilience despite global headwinds',
        description: 'Indian banking stocks continue to perform well despite challenges in the global financial markets.',
        url: 'https://moneycontrol.com',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        content: 'Full article content here...',
        category: 'market'
      },
      {
        source: { name: 'LiveMint' },
        title: 'FII inflows boost market sentiment',
        description: 'Foreign Institutional Investors continue to pour money into Indian equities, boosting overall market sentiment.',
        url: 'https://livemint.com',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        content: 'Full article content here...',
        category: 'market'
      }
    ];
  }
}
