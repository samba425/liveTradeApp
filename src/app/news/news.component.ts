import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewsService } from '../news.service';
import { NewsArticle } from '../shared/models/news.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  news: NewsArticle[] = [];
  filteredNews: NewsArticle[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  selectedCategory: string = 'all';
  
  private subscription: Subscription;

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadNews();
    this.subscription = this.newsService.news$.subscribe(
      articles => {
        this.news = articles;
        this.filterNews();
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadNews() {
    this.isLoading = true;
    this.newsService.getMarketNews();
  }

  filterNews() {
    let filtered = [...this.news];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(term) ||
        (article.description && article.description.toLowerCase().includes(term))
      );
    }

    this.filteredNews = filtered;
  }

  onSearchChange() {
    this.filterNews();
  }

  onCategoryChange() {
    this.filterNews();
  }

  refreshNews() {
    this.loadNews();
  }

  openArticle(url: string) {
    window.open(url, '_blank');
  }

  getTimeAgo(publishedAt: string): string {
    const now = new Date().getTime();
    const published = new Date(publishedAt).getTime();
    const diffMs = now - published;
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  getDefaultImage(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }
}
