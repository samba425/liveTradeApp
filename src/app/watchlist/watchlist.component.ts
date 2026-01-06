import { Component, OnInit, OnDestroy } from '@angular/core';
import { WatchlistService } from '../watchlist.service';
import { Stock } from '../shared/models/stock.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit, OnDestroy {
  watchlistStocks: Stock[] = [];
  newSymbol: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  private subscription: Subscription;

  // AG-Grid configuration
  columnDefs = [
    {
      headerName: 'Symbol',
      field: 'name',
      sortable: true,
      filter: true,
      width: 150,
      pinned: 'left',
      cellRenderer: params => {
        return `<a href="/stock/${params.value}" style="color: #007bff; text-decoration: none; font-weight: 600;">${params.value}</a>`;
      }
    },
    {
      headerName: 'LTP',
      field: 'close',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: params => params.value ? '₹' + params.value.toFixed(2) : '-',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      headerName: 'Change',
      field: 'change',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: params => params.value ? params.value.toFixed(2) : '-',
      cellStyle: params => {
        if (params.value > 0) return { color: 'green', fontWeight: 'bold' };
        if (params.value < 0) return { color: 'red', fontWeight: 'bold' };
        return {};
      }
    },
    {
      headerName: 'Change %',
      field: 'changePercent',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: params => params.value ? params.value.toFixed(2) + '%' : '-',
      cellStyle: params => {
        if (params.value > 0) return { color: 'green', fontWeight: 'bold' };
        if (params.value < 0) return { color: 'red', fontWeight: 'bold' };
        return {};
      }
    },
    {
      headerName: 'Open',
      field: 'open',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: params => params.value ? '₹' + params.value.toFixed(2) : '-'
    },
    {
      headerName: 'High',
      field: 'high',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: params => params.value ? '₹' + params.value.toFixed(2) : '-',
      cellStyle: { color: 'green' }
    },
    {
      headerName: 'Low',
      field: 'low',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: params => params.value ? '₹' + params.value.toFixed(2) : '-',
      cellStyle: { color: 'red' }
    },
    {
      headerName: 'Volume',
      field: 'volume',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: params => params.value ? this.formatVolume(params.value) : '-'
    },
    {
      headerName: 'Actions',
      width: 100,
      cellRenderer: params => {
        return `<button class="btn btn-sm btn-danger" data-action="remove" data-symbol="${params.data.name}">Remove</button>`;
      }
    }
  ];

  gridOptions = {
    pagination: true,
    paginationPageSize: 20,
    domLayout: 'autoHeight',
    enableCellTextSelection: true,
    onCellClicked: this.onCellClicked.bind(this)
  };

  constructor(private watchlistService: WatchlistService) {}

  ngOnInit() {
    this.subscription = this.watchlistService.watchlistStocks$.subscribe(
      stocks => {
        this.watchlistStocks = stocks.map(stock => ({
          ...stock,
          change: stock.close - (stock.prevClose || stock.open),
          changePercent: stock.prevClose 
            ? ((stock.close - stock.prevClose) / stock.prevClose) * 100
            : ((stock.close - stock.open) / stock.open) * 100
        }));
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addSymbol() {
    if (!this.newSymbol.trim()) {
      this.showError('Please enter a symbol');
      return;
    }

    const success = this.watchlistService.addToWatchlist(this.newSymbol);
    if (success) {
      this.showSuccess(`${this.newSymbol.toUpperCase()} added to watchlist`);
      this.newSymbol = '';
    } else {
      this.showError(`${this.newSymbol.toUpperCase()} is already in watchlist`);
    }
  }

  removeSymbol(symbol: string) {
    const success = this.watchlistService.removeFromWatchlist(symbol);
    if (success) {
      this.showSuccess(`${symbol} removed from watchlist`);
    }
  }

  clearWatchlist() {
    if (confirm('Are you sure you want to clear the entire watchlist?')) {
      this.watchlistService.clearWatchlist();
      this.showSuccess('Watchlist cleared');
    }
  }

  exportWatchlist() {
    const data = this.watchlistService.exportWatchlist();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'watchlist.json';
    link.click();
    window.URL.revokeObjectURL(url);
    this.showSuccess('Watchlist exported');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const success = this.watchlistService.importWatchlist(e.target.result);
        if (success) {
          this.showSuccess('Watchlist imported successfully');
        } else {
          this.showError('Failed to import watchlist');
        }
      };
      reader.readAsText(file);
    }
  }

  onCellClicked(event: any) {
    if (event.event.target.dataset.action === 'remove') {
      this.removeSymbol(event.event.target.dataset.symbol);
    }
  }

  formatVolume(volume: number): string {
    if (volume >= 10000000) {
      return (volume / 10000000).toFixed(2) + ' Cr';
    } else if (volume >= 100000) {
      return (volume / 100000).toFixed(2) + ' L';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(2) + ' K';
    }
    return volume.toString();
  }

  get gainersCount(): number {
    return this.watchlistStocks.filter(stock => stock.changePercent > 0).length;
  }

  get losersCount(): number {
    return this.watchlistStocks.filter(stock => stock.changePercent < 0).length;
  }

  get unchangedCount(): number {
    return this.watchlistStocks.filter(stock => stock.changePercent === 0).length;
  }

  private showSuccess(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3000);
  }
}
