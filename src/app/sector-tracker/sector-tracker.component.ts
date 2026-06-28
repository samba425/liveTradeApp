import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { environment } from '../../environments/environment';

interface SectorData {
  name: string;
  displayName: string;
  stocks: any[];
  avgChange: number;
  weeklyAvgChange?: number;
  vsMarket?: number;
  rotationSignal?: string;
  rank?: number;
  totalVolume: number;
  advancers: number;
  decliners: number;
  strength: number;
  topStock: any;
  stockCount?: number;
}

interface MarketContext {
  niftyChange: number | null;
  niftyWeeklyChange: number | null;
  bankNiftyChange: number | null;
  vix: number | null;
  marketAvg: number;
}

@Component({
  standalone: false,
  selector: 'app-sector-tracker',
  templateUrl: './sector-tracker.component.html',
  styleUrls: ['./sector-tracker.component.css']
})
export class SectorTrackerComponent implements OnInit, OnDestroy {
  sectors: SectorData[] = [];
  marketContext: MarketContext | null = null;
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

  // Sector definitions with NSE stocks - All 20 NSE sectors
  private sectorStocks = {
    'IT': {
      name: 'Information Technology',
      stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTIM', 'COFORGE', 'PERSISTENT', 'MPHASIS', 'LTTS']
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
      name: 'Energy',
      stocks: ['RELIANCE', 'NTPC', 'POWERGRID', 'ADANIGREEN', 'ADANIPOWER', 'TATAPOWER', 'NHPC', 'SJVN']
    },
    'METAL': {
      name: 'Metals',
      stocks: ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL', 'SAIL', 'NMDC', 'NATIONALUM', 'JINDALSTEL']
    },
    'REALTY': {
      name: 'Real Estate',
      stocks: ['DLF', 'GODREJPROP', 'OBEROIRLTY', 'PRESTIGE', 'BRIGADE', 'PHOENIXLTD', 'SUNTECK', 'SOBHA']
    },
    'INFRA': {
      name: 'Infrastructure',
      stocks: ['LT', 'ULTRACEMCO', 'GRASIM', 'AMBUJACEM', 'ACC', 'ADANIPORTS', 'GMRINFRA', 'IRB']
    },
    'FINANCIAL': {
      name: 'Financial Services',
      stocks: ['BAJFINANCE', 'BAJAJFINSV', 'SBILIFE', 'HDFCLIFE', 'ICICIGI', 'HDFCAMC', 'MUTHOOTFIN', 'CHOLAFIN']
    },
    'MEDIA': {
      name: 'Media',
      stocks: ['ZEEL', 'PVR', 'SAREGAMA', 'NAZARA', 'Tips', 'NETWORK18', 'TVTODAY', 'DBCORP']
    },
    'PSU_BANK': {
      name: 'PSU Banks',
      stocks: ['SBIN', 'BANKBARODA', 'PNB', 'CANBK', 'UNIONBANK', 'INDIANB', 'MAHABANK', 'CENTRALBK']
    },
    'PVT_BANK': {
      name: 'Private Banks',
      stocks: ['HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'AXISBANK', 'INDUSINDBK', 'FEDERALBNK', 'BANDHANBNK', 'IDFCFIRSTB']
    },
    'HEALTHCARE': {
      name: 'Healthcare',
      stocks: ['APOLLOHOSP', 'FORTIS', 'MAXHEALTH', 'NARAYANHEALTH', 'METROPOLIS', 'LALPATHLAB', 'THYROCARE', 'STARHEALTH']
    },
    'CONSUMPTION': {
      name: 'Consumption',
      stocks: ['TITAN', 'DMART', 'TRENT', 'JUBLFOOD', 'WESTLIFE', 'BARBEQUE', 'SAPPHIRE', 'VMART']
    },
    'OIL_GAS': {
      name: 'Oil & Gas',
      stocks: ['RELIANCE', 'ONGC', 'BPCL', 'IOC', 'GAIL', 'HINDPETRO', 'PETRONET', 'OIL']
    },
    'COMMODITIES': {
      name: 'Commodities',
      stocks: ['COALINDIA', 'VEDL', 'HINDZINC', 'NMDC', 'MOIL', 'GMDCLTD', 'NATIONALUM', 'BALRAMCHIN']
    },
    'SERVICES': {
      name: 'Services',
      stocks: ['BHARTIARTL', 'IDEA', 'IRCTC', 'INDHOTEL', 'LEMONTREE', 'CHALET', 'THOMASCOOK', 'YATRA']
    },
    'MIDCAP': {
      name: 'Midcap',
      stocks: ['PAGEIND', 'PIIND', 'ABBOTINDIA', 'SIEMENS', 'BOSCHLTD', 'BERGEPAINT', 'PIDILITIND', 'ASTRAL']
    },
    'SMALLCAP': {
      name: 'Smallcap',
      stocks: ['IRFC', 'RVNL', 'RAILTEL', 'HUDCO', 'GICRE', 'IREDA', 'SJVN', 'NMDC']
    }
  };

  columnDefs = [
    {
      headerName: '#',
      field: 'rank',
      sortable: true,
      width: 60,
      pinned: 'left',
      cellStyle: params => {
        const r = params.value || 0;
        if (r === 1) return { backgroundColor: '#a7f3d0', fontWeight: 'bold', fontSize: '14px' };
        if (r <= 3) return { backgroundColor: '#d1fae5', fontWeight: 'bold' };
        if (r >= 18) return { backgroundColor: '#fee2e2', fontWeight: 'bold' };
        return { fontWeight: '600' };
      }
    },
    {
      headerName: '📊 Sector',
      field: 'displayName',
      sortable: true,
      width: 200,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold', fontSize: '14px', color: '#1f2937' }
    },
    {
      headerName: '🔄 Rotation',
      field: 'rotationSignal',
      sortable: true,
      width: 120,
      cellRenderer: params => {
        const v = params.value || 'Neutral';
        if (v === 'Leading') return '<span style="color:#047857;font-weight:bold;">🟢 Leading</span>';
        if (v === 'Improving') return '<span style="color:#059669;font-weight:600;">📈 Improving</span>';
        if (v === 'Lagging') return '<span style="color:#991b1b;font-weight:bold;">🔴 Lagging</span>';
        if (v === 'Weakening') return '<span style="color:#dc2626;font-weight:600;">📉 Weakening</span>';
        return '<span style="color:#6b7280;">➖ Neutral</span>';
      }
    },
    {
      headerName: '📈 Today %',
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
      headerName: '📅 Week %',
      field: 'weeklyAvgChange',
      sortable: true,
      width: 110,
      valueFormatter: params => params.value != null ? (params.value > 0 ? '+' : '') + params.value.toFixed(2) + '%' : '-',
      cellStyle: params => {
        if (params.value > 0) return { color: '#065f46', fontWeight: 'bold' };
        if (params.value < 0) return { color: '#991b1b', fontWeight: 'bold' };
        return {};
      }
    },
    {
      headerName: '⚖️ vs Market',
      field: 'vsMarket',
      sortable: true,
      width: 120,
      valueFormatter: params => params.value != null ? (params.value > 0 ? '+' : '') + params.value.toFixed(2) + '%' : '-',
      cellStyle: params => {
        if (params.value >= 0.5) return { backgroundColor: '#d1fae5', color: '#065f46', fontWeight: 'bold' };
        if (params.value <= -0.5) return { backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' };
        return {};
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
      headerName: '📦 Stocks',
      field: 'stockCount',
      sortable: true,
      width: 100,
      valueFormatter: params => params.value != null ? params.value : (params.data?.stocks?.length || 0)
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
    
    this.http.get(`${environment.baseUrl}nse/sectors`).toPromise()
      .then((response: any) => {
        if (response && response.status === 'success' && response.data) {
          const loaded = response.sectorsLoaded ?? response.data.filter((s: any) => (s.stockCount || s.stocks?.length) > 0).length;
          if (loaded === 0) {
            throw new Error('All sectors returned empty');
          }
          if (response.market) {
            this.marketContext = response.market;
          }
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
        this.loadSectorDataFallback();
      });
  }

  updateSectorData(newData: SectorData[]) {
    // Update data and sort
    this.sectors = newData.sort((a, b) => b.avgChange - a.avgChange);
    
    if (this.gridApi) {
      // Use AG-Grid v33 API to update row data
      this.gridApi.setGridOption('rowData', this.sectors);
      // Flash updated cells to show changes
      this.gridApi.flashCells();
    }
  }

  loadSectorDataFallback() {
    this.http.get(`${environment.baseUrl}getData`).toPromise()
      .then((response: any) => {
        const rawRows = response && response.data ? response.data : [];
        const allStocks = rawRows.map((row: any) => this.parseTradingViewRow(row)).filter(Boolean);
        
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

  private parseTradingViewRow(row: any): any {
    const d = row.d;
    if (!d || !d[0]) return null;
    const change = d[5] != null ? Number(d[5]) : (d[9] != null ? Number(d[9]) : 0);
    return {
      name: d[0],
      close: d[4],
      open: d[1],
      volume: d[7] || 0,
      change
    };
  }

  processSectorData(sectorKey: string, sectorName: string, stockSymbols: string[], allStocks: any[]): SectorData {
    try {
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

      const avgChange = validStocks.reduce((sum, s) => sum + s.change, 0) / validStocks.length;
      const totalVolume = validStocks.reduce((sum, s) => sum + (s.volume || 0), 0);
      const advancers = validStocks.filter(s => s.change > 0).length;
      const decliners = validStocks.filter(s => s.change < 0).length;
      const strength = (advancers / validStocks.length) * 100;
      
      const topStock = validStocks.reduce((max, stock) => 
        stock.change > (max && max.change != null ? max.change : -Infinity) ? stock : max
      , validStocks[0]);

      return {
        name: sectorKey,
        displayName: sectorName,
        stocks: validStocks,
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
    if (change > 2) return '#047857';
    if (change > 1) return '#10b981';
    if (change > 0.3) return '#6ee7b7';
    if (change > -0.3) return '#9ca3af';
    if (change > -1) return '#fca5a5';
    if (change > -2) return '#ef4444';
    return '#991b1b';
  }

  getRotationColor(signal: string): string {
    if (signal === 'Leading') return '#047857';
    if (signal === 'Improving') return '#10b981';
    if (signal === 'Lagging') return '#991b1b';
    if (signal === 'Weakening') return '#dc2626';
    return '#6b7280';
  }

  getLeadingSectors() {
    // Always show top performers by today's change (not only strict rotation tags)
    return [...this.sectors]
      .filter(s => s.stockCount > 0)
      .sort((a, b) => b.avgChange - a.avgChange)
      .slice(0, 5);
  }

  getLaggingSectors() {
    return [...this.sectors]
      .filter(s => s.stockCount > 0)
      .sort((a, b) => a.avgChange - b.avgChange)
      .slice(0, 5);
  }

  formatChange(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '-';
    return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
  }

  getTradingAction(sector: SectorData): { label: string; class: string; tip: string } {
    const rank = sector.rank || 99;
    if (rank <= 5 && sector.avgChange > 0) {
      return { label: '🟢 BUY', class: 'action-buy', tip: 'Money flowing in — pick stocks from this sector' };
    }
    if (rank <= 8 && sector.avgChange > 0 && (sector.vsMarket ?? 0) >= 0) {
      return { label: '✅ WATCH', class: 'action-watch', tip: 'Strong sector — wait for SMA200 bounce in these stocks' };
    }
    if (rank >= 16 && sector.avgChange < 0) {
      return { label: '🔴 AVOID', class: 'action-avoid', tip: 'Money flowing out — do not buy here today' };
    }
    if (sector.avgChange < -0.5) {
      return { label: '⚠️ WEAK', class: 'action-weak', tip: 'Underperforming — skip unless special setup' };
    }
    return { label: '🟡 NEUTRAL', class: 'action-neutral', tip: 'No clear edge — focus on top 5 sectors only' };
  }

  getRotationBadgeClass(signal: string): string {
    if (signal === 'Leading') return 'badge-leading';
    if (signal === 'Improving') return 'badge-improving';
    if (signal === 'Lagging') return 'badge-lagging';
    if (signal === 'Weakening') return 'badge-weakening';
    return 'badge-neutral';
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
