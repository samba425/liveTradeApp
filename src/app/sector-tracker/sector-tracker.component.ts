import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { environment } from 'src/environments/environment';

interface SectorData {
  name: string;
  displayName: string;
  stocks: any[];
  avgChange: number;
  totalVolume: number;
  advancers: number;
  decliners: number;
  strength: number;
  topStock: any;
}

@Component({
  selector: 'app-sector-tracker',
  templateUrl: './sector-tracker.component.html',
  styleUrls: ['./sector-tracker.component.css']
})
export class SectorTrackerComponent implements OnInit, OnDestroy {
  sectors: SectorData[] = [];
  isLoading = true;
  errorMessage = '';
  lastUpdated: Date;
  gridApi: any;
  
  private refreshSubscription: Subscription;
  private readonly REFRESH_INTERVAL = 30000; // 30 seconds

  // Getter methods for template
  get sectorsUp(): number {
    return this.sectors.filter(s => s.avgChange > 0).length;
  }

  get sectorsDown(): number {
    return this.sectors.filter(s => s.avgChange < 0).length;
  }

  get strongestSectorName(): string {
    if (this.sectors.length > 0 && this.sectors[0].displayName) {
      const parts = this.sectors[0].displayName.split(' ');
      return parts.length > 1 ? parts[1] : parts[0];
    }
    return 'N/A';
  }

  // Sector definitions with NSE stocks
  private sectorStocks = {
    'IT': {
      name: 'Information Technology',
      stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTIM', 'COFORGE', 'PERSISTENT']
    },
    'BANKING': {
      name: 'Banking',
      stocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK', 'INDUSINDBK', 'BANKBARODA', 'PNB']
    },
    'AUTO': {
      name: 'Automobile',
      stocks: ['MARUTI', 'TATAMOTORS', 'M&M', 'BAJAJ-AUTO', 'HEROMOTOCO', 'EICHERMOT', 'ASHOKLEY', 'TVSMOTOR']
    },
    'PHARMA': {
      name: 'Pharmaceuticals',
      stocks: ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'AUROPHARMA', 'LUPIN', 'TORNTPHARM', 'BIOCON']
    },
    'FMCG': {
      name: 'FMCG',
      stocks: ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR', 'MARICO', 'GODREJCP', 'TATACONSUM']
    },
    'ENERGY': {
      name: 'Energy & Oil',
      stocks: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'COALINDIA', 'NTPC', 'POWERGRID', 'ADANIGREEN']
    },
    'METAL': {
      name: 'Metals',
      stocks: ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL', 'SAIL', 'NMDC', 'NATIONALUM', 'JINDALSTEL']
    },
    'REALTY': {
      name: 'Real Estate',
      stocks: ['DLF', 'GODREJPROP', 'OBEROIRLTY', 'PRESTIGE', 'BRIGADE', 'PHOENIXLTD', 'SUNTECK', 'SOBHA']
    },
    'TELECOM': {
      name: 'Telecom',
      stocks: ['BHARTIARTL', 'INDUSINDBK', 'MTNL', 'TTML']
    },
    'INFRA': {
      name: 'Infrastructure',
      stocks: ['LT', 'ULTRACEMCO', 'GRASIM', 'AMBUJACEM', 'ACC', 'ADANIPORTS', 'GMRINFRA', 'IRB']
    }
  };

  columnDefs = [
    {
      headerName: '📊 Sector',
      field: 'displayName',
      sortable: true,
      width: 220,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold', fontSize: '14px', color: '#1f2937' }
    },
    {
      headerName: '📈 Avg Change %',
      field: 'avgChange',
      sortable: true,
      width: 150,
      valueFormatter: params => params.value ? (params.value > 0 ? '+' : '') + params.value.toFixed(2) + '%' : '-',
      cellStyle: params => {
        if (params.value > 0) return { 
          color: '#065f46', 
          backgroundColor: '#d1fae5', 
          fontWeight: 'bold',
          fontSize: '14px'
        };
        if (params.value < 0) return { 
          color: '#991b1b', 
          backgroundColor: '#fee2e2', 
          fontWeight: 'bold',
          fontSize: '14px'
        };
        return { fontSize: '14px' };
      }
    },
    {
      headerName: '💪 Strength',
      field: 'strength',
      sortable: true,
      width: 120,
      valueFormatter: params => params.value ? params.value.toFixed(1) : '-',
      cellStyle: params => {
        const value = params.value || 0;
        if (value > 70) return { 
          color: '#065f46',
          backgroundColor: '#d1fae5',
          fontWeight: 'bold',
          fontSize: '14px'
        };
        if (value < 30) return { 
          color: '#991b1b',
          backgroundColor: '#fee2e2',
          fontWeight: 'bold',
          fontSize: '14px'
        };
        return { 
          color: '#d97706',
          backgroundColor: '#fef3c7',
          fontWeight: 'bold',
          fontSize: '14px'
        };
      }
    },
    {
      headerName: '📈 Advancers',
      field: 'advancers',
      sortable: true,
      width: 130,
      cellStyle: { 
        color: '#065f46',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    },
    {
      headerName: '📉 Decliners',
      field: 'decliners',
      sortable: true,
      width: 130,
      cellStyle: { 
        color: '#991b1b',
        fontWeight: 'bold',
        fontSize: '14px'
      }
    },
    {
      headerName: '⭐ Top Stock',
      field: 'topStock',
      width: 280,
      valueFormatter: params => {
        if (params.value) {
          return `${params.value.name} (${params.value.change > 0 ? '+' : ''}${params.value.change.toFixed(2)}%)`;
        }
        return '-';
      },
      cellStyle: params => {
        if (params.value && params.value.change > 0) return { 
          color: '#065f46',
          backgroundColor: '#d1fae5',
          fontWeight: 'bold',
          fontSize: '14px'
        };
        if (params.value && params.value.change < 0) return { 
          color: '#991b1b',
          backgroundColor: '#fee2e2',
          fontWeight: 'bold',
          fontSize: '14px'
        };
        return { fontSize: '14px' };
      }
    }
  ];

  gridOptions = {
    pagination: false,
    domLayout: 'autoHeight',
    defaultColDef: {
      resizable: true
    },
    rowHeight: 45,
    headerHeight: 50,
    onGridReady: (params) => {
      this.gridApi = params.api;
    },
    // Prevent full re-render on data update
    suppressAnimationFrame: false,
    animateRows: true
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSectorData();
    // Auto-refresh every 30 seconds
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      this.loadSectorData();
    });
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadSectorData() {
    // Don't show loading spinner on refresh, only on initial load
    if (!this.lastUpdated) {
      this.isLoading = true;
    }
    this.errorMessage = '';
    
    // Use optimized NSE Sector API - returns pre-calculated sector data
    this.http.get(`${environment.baseUrl}nse/sectors`).toPromise()
      .then((response: any) => {
        if (response && response.status === 'success' && response.data) {
          this.updateSectorData(response.data);
          this.isLoading = false;
          this.lastUpdated = new Date();
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(error => {
        console.error('Error loading sector data:', error);
        this.errorMessage = 'Failed to load sector data. Falling back to manual calculation...';
        
        // Fallback to old method if NSE API fails
        this.loadSectorDataFallback();
      });
  }

  updateSectorData(newData: SectorData[]) {
    if (this.gridApi) {
      // Update existing data without re-rendering entire grid
      this.sectors = newData.sort((a, b) => b.avgChange - a.avgChange);
      this.gridApi.setRowData(this.sectors);
      // Flash updated cells to show changes (without parameters as they're not supported in this version)
      this.gridApi.flashCells();
    } else {
      // Initial load
      this.sectors = newData.sort((a, b) => b.avgChange - a.avgChange);
    }
  }

  loadSectorDataFallback() {
    // Original method as fallback
    this.http.get(`${environment.baseUrl}getData`).toPromise()
      .then((response: any) => {
        const allStocks = response && response.data ? response.data : [];
        
        // Process each sector with the same data
        const sectorResults = Object.keys(this.sectorStocks).map(sectorKey => {
          const sector = this.sectorStocks[sectorKey];
          return this.processSectorData(sectorKey, sector.name, sector.stocks, allStocks);
        });
        
        this.updateSectorData(sectorResults);
        this.isLoading = false;
        this.lastUpdated = new Date();
      })
      .catch(error => {
        console.error('Error loading sector data (fallback):', error);
        this.errorMessage = 'Failed to load sector data';
        this.isLoading = false;
      });
  }

  processSectorData(sectorKey: string, sectorName: string, stockSymbols: string[], allStocks: any[]): SectorData {
    try {
      // Filter stocks for this sector
      const validStocks = allStocks.filter(stock => 
        stockSymbols.includes(stock.name)
      );

      if (validStocks.length === 0) {
        return {
          name: sectorKey,
          displayName: sectorName,
          stocks: [],
          avgChange: 0,
          totalVolume: 0,
          advancers: 0,
          decliners: 0,
          strength: 50,
          topStock: null
        };
      }

      // Calculate sector metrics
      const stocksWithChange = validStocks.map(stock => ({
        ...stock,
        change: stock.prevClose 
          ? ((stock.close - stock.prevClose) / stock.prevClose) * 100
          : ((stock.close - stock.open) / stock.open) * 100
      }));

      const avgChange = stocksWithChange.reduce((sum, s) => sum + s.change, 0) / stocksWithChange.length;
      const totalVolume = stocksWithChange.reduce((sum, s) => sum + (s.volume || 0), 0);
      const advancers = stocksWithChange.filter(s => s.change > 0).length;
      const decliners = stocksWithChange.filter(s => s.change < 0).length;
      const strength = (advancers / stocksWithChange.length) * 100;
      
      // Find top performing stock
      const topStock = stocksWithChange.reduce((max, stock) => 
        stock.change > (max && max.change ? max.change : -Infinity) ? stock : max
      , stocksWithChange[0]);

      return {
        name: sectorKey,
        displayName: sectorName,
        stocks: stocksWithChange,
        avgChange,
        totalVolume,
        advancers,
        decliners,
        strength,
        topStock: topStock ? { name: topStock.name, change: topStock.change } : null
      };
    } catch (error) {
      console.error(`Error processing sector ${sectorName}:`, error);
      return {
        name: sectorKey,
        displayName: sectorName,
        stocks: [],
        avgChange: 0,
        totalVolume: 0,
        advancers: 0,
        decliners: 0,
        strength: 50,
        topStock: null
      };
    }
  }

  getSectorColor(change: number): string {
    if (change > 1) return '#28a745';
    if (change > 0) return '#90EE90';
    if (change < -1) return '#dc3545';
    if (change < 0) return '#FFB6C1';
    return '#6c757d';
  }

  getStrengthLabel(strength: number): string {
    if (strength > 70) return 'Very Strong';
    if (strength > 50) return 'Strong';
    if (strength > 30) return 'Weak';
    return 'Very Weak';
  }

  // Helper methods for top 3 sectors styling
  getBorderClass(index: number): string {
    if (index === 0) return 'border-success';
    if (index === 1) return 'border-warning';
    if (index === 2) return 'border-info';
    return '';
  }

  getHeaderBgClass(index: number): string {
    if (index === 0) return 'bg-success';
    if (index === 1) return 'bg-warning';
    if (index === 2) return 'bg-info';
    return '';
  }

  getIconClass(index: number): string {
    if (index === 0) return 'fa-trophy';
    if (index === 1) return 'fa-medal';
    if (index === 2) return 'fa-award';
    return '';
  }

  getChangeClass(change: number): string {
    return change > 0 ? 'text-success' : 'text-danger';
  }

  getStrengthClass(strength: number): string {
    return strength > 50 ? 'text-success' : 'text-danger';
  }

  getBadgeClass(change: number): string {
    if (change > 0) return 'badge-success';
    if (change < 0) return 'badge-danger';
    return 'badge-secondary';
  }

  getTop3Sectors() {
    return this.sectors.slice(0, 3);
  }

  getWeakest3Sectors() {
    return this.sectors.slice(-3).reverse();
  }

  refreshData() {
    this.loadSectorData();
  }
}
