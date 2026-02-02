import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridOptions, GridApi } from 'ag-grid-community';
import { CommonserviceService } from '../commonservice.service';
import { environment } from '../../environments/environment';

/**
 * Camarilla H3/L3 Weekly Cross Detection Component
 * 
 * LOGIC:
 * ======
 * 1. Save last week's High/Low/Close every Friday after close or before Monday open
 * 2. Calculate Camarilla levels: H3, H4, H5, L3, L4, L5
 * 3. Detect when current candle crosses these levels:
 *    - H3 Cross UP: low <= H3 AND close > H3 (Bullish)
 *    - L3 Cross UP: low <= L3 AND close > L3 (Bullish bounce)
 *    - H4 Breakout: close > H4 (Very Bullish)
 *    - L4 Breakdown: close < L4 (Bearish)
 * 
 * DATA STORAGE:
 * =============
 * - localStorage.lastWeekData: Array of {name, weeklyHigh, weeklyLow, weeklyClose}
 * - Auto-saves: Friday 3:30 PM to Monday 9:15 AM IST
 */

@Component({
  standalone: false,
  selector: 'app-camarilla',
  templateUrl: './camarilla.component.html',
  styleUrls: ['./camarilla.component.css']
})
export class CamarillaComponent implements OnInit {

  private gridApi!: GridApi;

  ngOnInit() {
  }

  public rowSelection: 'single' | 'multiple' = 'multiple';
  public defaultColDef: ColDef = {
    editable: false,
    filter: true,
    resizable: true,
    sortable: true
  };

  inputValue: any = [];
  camarillaCrosses = [];
  pagination = true;
  paginationPageSize = 50;
  isLoading = false;
  
  // Toggle between Daily and Weekly Camarilla
  timeframe: 'daily' | 'weekly' = 'weekly'; // Default to weekly
  
  // Active filter for signal types
  activeSignalFilter: string | null = null; // null = show all, or 'H4 Breakout', 'H3 Cross UP', etc.
  
  // Data freshness status
  dataFreshnessStatus: { message: string, isValid: boolean, warningLevel: 'error' | 'warning' | 'info' } = {
    message: 'No data saved yet',
    isValid: false,
    warningLevel: 'error'
  };
  searchQuery: string = '';

  // Column Definitions for Camarilla Crosses
  colDefs: ColDef[] = [
    { 
      headerName: "📊 Stock",
      field: "name", 
      sortable: true, 
      resizable: true,
      width: 150,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold', color: '#667eea', cursor: 'pointer', fontSize: '14px' },
      cellRenderer: (params) => {
        return `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <a href="https://www.tradingview.com/chart/?symbol=NSE:${params.value}" target="_blank" 
               style="color: #667eea; text-decoration: none; font-weight: bold; font-size: 14px;">${params.value}</a>
            <i class="fas fa-copy" onclick="navigator.clipboard.writeText('${params.value}'); event.stopPropagation();" 
               style="cursor: pointer; color: #9ca3af; font-size: 11px; margin-left: 6px; opacity: 0.7;" title="Copy"></i>
          </div>
        `;
      }
    },
    {
      headerName: "💰 Close",
      field: "close", 
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontWeight: '600', fontSize: '14px' }
    },
    {
      headerName: "📈 High",
      field: "high", 
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { color: '#10b981', fontWeight: '600' }
    },
    {
      headerName: "📉 Low",
      field: "low", 
      sortable: true, 
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { color: '#ef4444', fontWeight: '600' }
    },
    {
      headerName: "🎯 Crossed Level",
      field: "crossedLevel",
      sortable: true,
      width: 150,
      filter: "agTextColumnFilter",
      cellStyle: params => {
        if (params.value === 'H4 Breakout') return { color: '#00C853', fontWeight: 'bold', fontSize: '14px' };
        if (params.value === 'H3 Cross UP') return { color: '#00E676', fontWeight: 'bold', fontSize: '14px' };
        if (params.value === 'L3 Bounce UP') return { color: '#76FF03', fontWeight: 'bold', fontSize: '14px' };
        if (params.value === 'L4 Breakdown') return { color: '#FF5252', fontWeight: 'bold', fontSize: '14px' };
        return {};
      }
    },
    {
      headerName: "💵 Level Price",
      field: "levelPrice",
      sortable: true,
      width: 130,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontWeight: '600', color: '#764ba2', fontSize: '13px' }
    },
    {
      headerName: "📏 Distance %",
      field: "distanceFromLevel",
      sortable: true,
      width: 120,
      valueFormatter: p => p.value + '%',
      filter: "agNumberColumnFilter",
      cellStyle: params => {
        const val = parseFloat(params.value);
        if (val > 2) return { color: '#00C853', fontWeight: 'bold' };
        if (val > 0) return { color: '#76FF03', fontWeight: '600' };
        if (val < -2) return { color: '#FF5252', fontWeight: 'bold' };
        return { color: '#FF9800' };
      }
    },
    {
      headerName: "🚀 Signal",
      field: "signal",
      sortable: true,
      width: 180,
      filter: "agTextColumnFilter",
      cellStyle: params => {
        if (params.value && params.value.includes('Very Strong')) return { color: '#00C853', fontWeight: 'bold', fontSize: '14px' };
        if (params.value && params.value.includes('Strong')) return { color: '#00E676', fontWeight: 'bold', fontSize: '13px' };
        if (params.value && params.value.includes('Buy')) return { color: '#76FF03', fontWeight: '600', fontSize: '13px' };
        return { color: '#FF5252', fontWeight: '600' };
      }
    },
    {
      headerName: "🎯 Pattern",
      field: "pattern",
      resizable: true,
      sortable: true,
      width: 160,
      filter: "agTextColumnFilter",
      cellStyle: params => {
        if (!params.value || params.value === 'No Pattern') return { color: '#999', fontSize: '12px' };
        if (params.value === 'Dragonfly Doji') return { color: '#00C853', fontWeight: 'bold', fontSize: '13px' };
        if (params.value === 'Bullish Hammer') return { color: '#00E676', fontWeight: 'bold', fontSize: '13px' };
        if (params.value === 'Classic Doji') return { color: '#76FF03', fontWeight: '600', fontSize: '13px' };
        return { color: '#AEEA00', fontWeight: '600', fontSize: '13px' };
      }
    },
    {
      headerName: "💪 Strength",
      field: "strength",
      resizable: true,
      sortable: true,
      width: 110,
      filter: "agNumberColumnFilter",
      cellRenderer: params => {
        if (!params.value) return '';
        const val = params.value;
        let color = '#FF5252';
        let emoji = '⚠️';
        if (val >= 85) { color = '#00C853'; emoji = '🔥'; }
        else if (val >= 75) { color = '#00E676'; emoji = '✅'; }
        else if (val >= 65) { color = '#76FF03'; emoji = '👍'; }
        else if (val >= 55) { color = '#CDDC39'; emoji = '👌'; }
        
        return `<span style="color: ${color}; font-weight: bold; font-size: 14px;">${emoji} ${val}</span>`;
      }
    },
    {
      headerName: "📦 Volume",
      field: "volume", 
      resizable: true, 
      sortable: true,
      width: 120,
      valueFormatter: p => {
        const val = p.value;
        if (val >= 10000000) return (val / 10000000).toFixed(2) + 'Cr';
        if (val >= 100000) return (val / 100000).toFixed(2) + 'L';
        if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
        return val.toLocaleString();
      },
      filter: "agNumberColumnFilter"
    },
    {
      headerName: "📈 H3 Level",
      field: "H3",
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontSize: '12px', color: '#666' }
    },
    {
      headerName: "📈 H4 Level",
      field: "H4",
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontSize: '12px', color: '#666' }
    },
    {
      headerName: "📉 L3 Level",
      field: "L3",
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontSize: '12px', color: '#666' }
    },
    {
      headerName: "📉 L4 Level",
      field: "L4",
      sortable: true,
      width: 110,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontSize: '12px', color: '#666' }
    },
    {
      headerName: "Last Week Close",
      field: "lastWeekClose",
      sortable: true,
      width: 140,
      valueFormatter: p => '₹' + (Math.round(p.value * 100) / 100).toLocaleString(),
      filter: "agNumberColumnFilter",
      cellStyle: { fontSize: '12px', color: '#999' }
    },
    {
      headerName: "Sector",
      field: "sector",
      sortable: true,
      width: 150,
      filter: "agTextColumnFilter"
    }
  ];

  gridOptions: GridOptions;

  constructor(private http: HttpClient, private commonservice: CommonserviceService) {
    this.gridOptions = <GridOptions>{};

    setTimeout(() => {
      this.autoCleanStaleData(); // Clean stale data first
      this.loadCamarillaDataFromServer(); // Load auto-saved data from server
      this.fetchLiveData();
    }, 100);
  }

  /**
   * Load auto-saved Camarilla data from server (with smart caching)
   * Only calls API if:
   * 1. No data in localStorage
   * 2. Data is stale/old
   * Otherwise uses cached localStorage data (same day = same data!)
   */
  loadCamarillaDataFromServer() {
    const dataKey = this.timeframe === 'weekly' ? 'lastWeekData' : 'lastDayData';
    const timestampKey = this.timeframe === 'weekly' ? 'lastWeekDataTimestamp' : 'lastDayDataTimestamp';
    
    // Check if we have fresh data in localStorage
    const cachedData = localStorage.getItem(dataKey);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    
    if (cachedData && cachedTimestamp) {
      const savedDate = new Date(cachedTimestamp);
      const now = new Date();
      
      // For DAILY: Check if data is fresh based on 3:30 PM cutoff
      // For WEEKLY: Check if it's less than 7 days old
      let isFresh = false;
      
      if (this.timeframe === 'daily') {
        // Daily data freshness logic:
        // Data is fresh if:
        // 1. It's from today AND current time is BEFORE 3:30 PM IST
        // 2. It's from today AND saved time is AFTER 3:30 PM IST (today's auto-save already happened)
        
        // Convert to IST for comparison (UTC + 5:30)
        const savedIST = new Date(savedDate.getTime() + (5.5 * 60 * 60 * 1000));
        const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        
        const savedISTHours = savedIST.getUTCHours();
        const savedISTMinutes = savedIST.getUTCMinutes();
        const nowISTHours = nowIST.getUTCHours();
        const nowISTMinutes = nowIST.getUTCMinutes();
        
        const savedTimeInMinutes = savedISTHours * 60 + savedISTMinutes;
        const nowTimeInMinutes = nowISTHours * 60 + nowISTMinutes;
        const cutoffTimeInMinutes = 15 * 60 + 30; // 3:30 PM = 15:30 = 930 minutes
        
        const isSameDay = savedIST.toDateString() === nowIST.toDateString();
        
        if (isSameDay) {
          // Same day - check if we've crossed 3:30 PM
          if (nowTimeInMinutes < cutoffTimeInMinutes) {
            // Before 3:30 PM - any data from today is fresh
            isFresh = true;
          } else {
            // After 3:30 PM - data must be from after 3:30 PM to be fresh
            isFresh = savedTimeInMinutes >= cutoffTimeInMinutes;
          }
        } else {
          // Different day - check if saved yesterday after 3:30 PM and now before 3:30 PM
          const daysDiff = Math.floor((nowIST.getTime() - savedIST.getTime()) / (24 * 60 * 60 * 1000));
          const currentDayOfWeek = nowIST.getUTCDay(); // 0=Sunday, 1=Monday, ..., 5=Friday
          const savedDayOfWeek = savedIST.getUTCDay();
          
          // CRITICAL: On Monday, Sunday data is NOT fresh (weekend data)
          // Only use previous day's data if both days are weekdays
          const isCurrentDayWeekday = currentDayOfWeek >= 1 && currentDayOfWeek <= 5;
          const isSavedDayWeekday = savedDayOfWeek >= 1 && savedDayOfWeek <= 5;
          
          if (daysDiff === 1 && isCurrentDayWeekday && isSavedDayWeekday && 
              nowTimeInMinutes < cutoffTimeInMinutes && savedTimeInMinutes >= cutoffTimeInMinutes) {
            // Saved yesterday (weekday) after 3:30 PM, and we're still before 3:30 PM today (weekday)
            isFresh = true;
          } else {
            // Weekend data or too old - need fresh data
            isFresh = false;
          }
        }
        
        console.log(`🕐 Freshness Check (Daily):`);
        console.log(`   Saved: ${savedIST.toLocaleString('en-IN', { timeZone: 'UTC' })} IST (${savedTimeInMinutes} min) [${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][savedIST.getUTCDay()]}]`);
        console.log(`   Now:   ${nowIST.toLocaleString('en-IN', { timeZone: 'UTC' })} IST (${nowTimeInMinutes} min) [${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][nowIST.getUTCDay()]}]`);
        console.log(`   Cutoff: 3:30 PM IST (${cutoffTimeInMinutes} min)`);
        console.log(`   Same Day: ${isSameDay}, Fresh: ${isFresh}`);
      } else {
        // Weekly: Check if it's from THIS week's Friday or last week's Friday
        const daysSinceLastSave = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Convert to IST for day-of-week check
        const savedIST = new Date(savedDate.getTime() + (5.5 * 60 * 60 * 1000));
        const nowIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        const currentDayOfWeek = nowIST.getUTCDay(); // 0=Sunday, 5=Friday
        const savedDayOfWeek = savedIST.getUTCDay();
        
        // If today is Friday or later in the week, and saved data is >= 5 days old,
        // it's from LAST week - need fresh data
        if (currentDayOfWeek >= 5 && daysSinceLastSave >= 5) {
          isFresh = false; // Need new week's data
        } else if (daysSinceLastSave < 7) {
          isFresh = true; // Within same week
        } else {
          isFresh = false; // More than 7 days old
        }
        
        console.log(`🕐 Freshness Check (Weekly):`);
        console.log(`   Saved: ${savedIST.toLocaleString('en-IN', { timeZone: 'UTC' })} IST (${daysSinceLastSave} days ago)`);
        console.log(`   Current Day: ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][currentDayOfWeek]}`);
        console.log(`   Saved Day: ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][savedDayOfWeek]}`);
        console.log(`   Fresh: ${isFresh}`);
      }
      
      if (isFresh) {
        console.log(`💾 Using cached ${this.timeframe} data from localStorage (saved: ${savedDate.toLocaleString()})`);
        console.log(`   ⚡ No API call needed - data is fresh!`);
        this.updateDataFreshnessStatus();
        return; // Don't call API - use cache!
      } else {
        console.log(`⚠️ Cached ${this.timeframe} data is stale (saved: ${savedDate.toLocaleString()})`);
        console.log(`   📡 Fetching fresh data from server...`);
      }
    } else {
      console.log(`📡 No cached ${this.timeframe} data found. Fetching from server...`);
    }
    
    // Only reach here if cache is missing or stale - call API
    const url = `${environment.baseUrl}getCamarillaData?timeframe=${this.timeframe}`;
    
    this.http.get<any>(url).subscribe(
      response => {
        if (response.success) {
          console.log(`✅ Loaded ${this.timeframe} data from server (${response.data.length} stocks)`);
          console.log(`📅 Saved at: ${new Date(response.timestamp).toLocaleString()}`);
          console.log(`🤖 Saved by: ${response.savedBy}`);
          
          // Store in localStorage as cache
          localStorage.setItem(dataKey, JSON.stringify(response.data));
          localStorage.setItem(timestampKey, response.timestamp);
          
          this.updateDataFreshnessStatus();
        }
      },
      error => {
        console.warn(`⚠️ No ${this.timeframe} data on server yet. Waiting for auto-save...`);
        // Try to use localStorage as fallback
        this.updateDataFreshnessStatus();
      }
    );
  }

  fetchLiveData() {
    this.isLoading = true;
    
    // Trigger fresh API call to get live market data for ALL stocks
    console.log('🔄 Triggering fresh API call for ALL live data...');
    this.commonservice.fetchLiveData(null); // null = get ALL stocks, not just NIFTY
    
    // Subscribe to the updated data
    this.commonservice.getData.subscribe(data => {
      this.inputValue = data;
      // Server auto-saves data via cron jobs - no manual save needed
      this.updateDataFreshnessStatus(); // Update status after data load
      this.detectCamarillaCrosses();
      this.isLoading = false;
    }, error => {
      console.error('Error fetching data:', error);
      this.isLoading = false;
    });
  }

  /**
   * Refresh live data
   * This fetches FRESH LIVE PRICES from TradingView (current market prices)
   * The saved data (high/low/close) stays the same, but CURRENT PRICE updates
   * This allows detection of NEW crosses as price moves during the day
   */
  refreshData() {
    console.log('🔄 Refreshing LIVE market data (current prices)...');
    this.activeSignalFilter = null; // Clear any active filter
    this.fetchLiveData();
  }

  /**
   * Toggle between Weekly and Daily timeframes
   */
  toggleTimeframe(tf: 'daily' | 'weekly') {
    this.timeframe = tf;
    this.loadCamarillaDataFromServer(); // Load data for new timeframe from server
    this.updateDataFreshnessStatus(); // Check freshness when switching
    this.detectCamarillaCrosses(); // Re-detect with new timeframe
    console.log(`🔄 Switched to ${tf.toUpperCase()} Camarilla levels`);
  }

  /**
   * Update data freshness status for UI display
   */
  updateDataFreshnessStatus() {
    this.dataFreshnessStatus = this.validateDataFreshness();
  }

  /**
   * Get formatted save timestamp for UI display
   * This shows SERVER-SIDE save time (from cron job), not UI cache time
   */
  getSaveTimestamp(): string {
    const key = this.timeframe === 'weekly' ? 'lastWeekDataTimestamp' : 'lastDayDataTimestamp';
    const timestamp = localStorage.getItem(key);
    
    if (!timestamp) {
      return 'No data saved yet - waiting for server auto-save...';
    }
    
    const saveDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - saveDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    // Convert to IST for display
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(saveDate.getTime() + istOffset);
    
    // Format: "Saved on Friday, 14 Jan 2026 at 3:30 PM IST (2 days ago)"
    const dayName = istDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const dateStr = istDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const timeStr = istDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
    
    let ago = '';
    if (diffDays > 0) {
      ago = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      ago = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes > 0) {
        ago = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        ago = 'just now';
      }
    }
    
    return `Server saved: ${dayName}, ${dateStr} at ${timeStr} IST (${ago})`;
  }
  
  /**
   * Get ISO timestamp for detailed view
   */
  getISOTimestamp(): string {
    const key = this.timeframe === 'weekly' ? 'lastWeekDataTimestamp' : 'lastDayDataTimestamp';
    const timestamp = localStorage.getItem(key);
    return timestamp || 'N/A';
  }

  /**
   * Automatically clean stale data from localStorage on component init
   * This ensures accurate data on UI every time
   * - Daily data: Cleared if older than 1 day
   * - Weekly data: Cleared if older than 7 days
   */
  autoCleanStaleData() {
    let cleaned = false;
    
    // Check and clean daily data
    const dailyTimestamp = localStorage.getItem('lastDayDataTimestamp');
    if (dailyTimestamp) {
      const savedDate = new Date(dailyTimestamp);
      const now = new Date();
      const isSameDay = savedDate.toDateString() === now.toDateString();
      
      if (!isSameDay) {
        localStorage.removeItem('lastDayData');
        localStorage.removeItem('lastDayDataTimestamp');
        console.log('🧹 Auto-cleaned stale DAILY data from localStorage');
        cleaned = true;
      }
    }
    
    // Check and clean weekly data
    const weeklyTimestamp = localStorage.getItem('lastWeekDataTimestamp');
    if (weeklyTimestamp) {
      const savedDate = new Date(weeklyTimestamp);
      const now = new Date();
      const diffMs = now.getTime() - savedDate.getTime();
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      
      if (diffDays >= 7) {
        localStorage.removeItem('lastWeekData');
        localStorage.removeItem('lastWeekDataTimestamp');
        console.log('🧹 Auto-cleaned stale WEEKLY data from localStorage (older than 7 days)');
        cleaned = true;
      }
    }
    
    if (!cleaned) {
      console.log('✅ localStorage data is fresh - no cleanup needed');
    }
  }

  /**
   * Clear old data from localStorage
   */
  clearOldData() {
    const confirmClear = confirm('⚠️ This will delete both WEEKLY and DAILY saved data. Continue?');
    if (!confirmClear) return;
    
    localStorage.removeItem('lastWeekData');
    localStorage.removeItem('lastWeekDataTimestamp');
    localStorage.removeItem('lastDayData');
    localStorage.removeItem('lastDayDataTimestamp');
    this.camarillaCrosses = [];
    console.log('🗑️ Cleared all saved Camarilla data from localStorage');
    alert('✅ All saved data cleared! Save new data to start fresh.');
  }

  // ============ CAMARILLA WEEKLY H3/L3 CROSS DETECTION ============
  
  /**
   * Check if it's Friday after market close (3:30 PM IST) or before Monday 9:15 AM
   */
  shouldUpdateWeeklyData(): boolean {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const dayOfWeek = istTime.getUTCDay();
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    const isFridayAfterClose = dayOfWeek === 5 && currentMinutes >= 930;
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;
    const isMondayBeforeOpen = dayOfWeek === 1 && currentMinutes < 555;
    
    return isFridayAfterClose || isWeekend || isMondayBeforeOpen;
  }

  /**
   * Save current week's data to localStorage
   */
  saveWeeklyDataToStorage() {
    console.log('\n📅 ========== SAVING WEEKLY DATA ==========');
    console.log('🎯 Purpose: Save last week\'s High/Low/Close for calculating THIS WEEK\'s Camarilla levels');
    console.log('⏰ Valid Time Window: Friday 3:30 PM - Monday 9:15 AM IST');
    console.log('💡 Usage: These levels will be used all week to detect crosses');
    
    // Enforce time window validation
    if (!this.shouldUpdateWeeklyData()) {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[istTime.getUTCDay()];
      
      // Get IST time properly
      const istHours = istTime.getUTCHours();
      const istMinutes = istTime.getUTCMinutes();
      const ampm = istHours >= 12 ? 'PM' : 'AM';
      const displayHours = istHours % 12 || 12;
      const currentTime = `${displayHours.toString().padStart(2, '0')}:${istMinutes.toString().padStart(2, '0')} ${ampm}`;
      
      console.error(`⏰ INVALID TIME WINDOW!`);
      console.error(`📅 Current: ${currentDay} ${currentTime} IST`);
      console.error(`✅ Valid: Friday 3:30 PM - Monday 9:15 AM IST`);
      console.log('=========================================\n');
      
      this.dataFreshnessStatus = {
        isValid: false,
        message: `⏰ Cannot save now! Current time: ${currentDay} ${currentTime}. Weekly data can only be saved Friday 3:30 PM - Monday 9:15 AM IST.`,
        warningLevel: 'error'
      };
      return;
    }

    const weeklyData = [];
    
    this.inputValue.forEach((res) => {
      if (res['d'] && res['d'][22] && res['d'][23] && res['d'][24] && res['d'][25]) {
        weeklyData.push({
          name: res['d'][0],
          weeklyOpen: res['d'][22],
          weeklyHigh: res['d'][23],
          weeklyLow: res['d'][24],
          weeklyClose: res['d'][25],
          timestamp: new Date().toISOString()
        });
      }
    });

    if (weeklyData.length > 0) {
      localStorage.setItem('lastWeekData', JSON.stringify(weeklyData));
      localStorage.setItem('lastWeekDataTimestamp', new Date().toISOString());
      console.log(`✅ Saved ${weeklyData.length} stocks' WEEKLY data to localStorage`);
      console.log('📅 Saved at:', new Date().toLocaleString());
      console.log('📊 Sample:', weeklyData[0]);
      console.log('🎯 Next Step: Click "Refresh Data" anytime this week to detect crosses');
      console.log('=========================================\n');
      this.updateDataFreshnessStatus(); // Update UI status - banner will show success
    } else {
      console.error('❌ No weekly data found. Make sure data is loaded first.');
      // No alert - status will show in banner
    }
  }

  /**
   * Get last week's data from localStorage
   */
  getLastWeekData(): Map<string, any> {
    const dataMap = new Map();
    
    try {
      const storedData = localStorage.getItem('lastWeekData');
      const timestamp = localStorage.getItem('lastWeekDataTimestamp');
      
      if (!storedData) {
        console.warn('⚠️ No weekly data found in localStorage. Click "Save Weekly Data" button first.');
        return dataMap;
      }

      const weeklyData = JSON.parse(storedData);
      const savedDate = timestamp ? new Date(timestamp) : new Date();
      const daysSinceUpdate = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      console.log(`📅 Last week data saved on: ${savedDate.toLocaleString()}`);
      console.log(`⏰ Days since update: ${daysSinceUpdate.toFixed(1)}`);
      
      if (daysSinceUpdate > 7) {
        console.warn(`⚠️ Weekly data is ${daysSinceUpdate.toFixed(1)} days old. May be stale. Save fresh data!`);
      }

      weeklyData.forEach(stock => {
        dataMap.set(stock.name, stock);
      });
      
      console.log(`✅ Loaded ${dataMap.size} stocks from localStorage`);
    } catch (error) {
      console.error('❌ Error loading weekly data:', error);
    }
    
    return dataMap;
  }

  /**
   * Check if it's valid time to save daily data (after 3:30 PM or before 9:15 AM next day)
   */
  shouldUpdateDailyData(): boolean {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    // After 3:30 PM (930 minutes) or before 9:15 AM (555 minutes)
    const isAfterClose = currentMinutes >= 930; // After 3:30 PM
    const isBeforeOpen = currentMinutes < 555;  // Before 9:15 AM
    
    return isAfterClose || isBeforeOpen;
  }

  /**
   * Save yesterday's daily data to localStorage
   */
  saveDailyDataToStorage() {
    console.log('\n📊 ========== SAVING DAILY DATA ==========');
    console.log('🎯 Purpose: Save yesterday\'s High/Low/Close for calculating TODAY\'s Camarilla levels');
    console.log('⏰ Valid Time Window: After 3:30 PM OR before 9:15 AM next day');
    console.log('💡 Usage: These levels will be used NEXT DAY ONLY to detect crosses');
    
    // Enforce time window validation
    if (!this.shouldUpdateDailyData()) {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[istTime.getUTCDay()];
      
      // Get IST time properly
      const istHours = istTime.getUTCHours();
      const istMinutes = istTime.getUTCMinutes();
      const ampm = istHours >= 12 ? 'PM' : 'AM';
      const displayHours = istHours % 12 || 12;
      const currentTime = `${displayHours.toString().padStart(2, '0')}:${istMinutes.toString().padStart(2, '0')} ${ampm}`;
      
      console.error(`⏰ INVALID TIME WINDOW!`);
      console.error(`📅 Current: ${currentDay} ${currentTime} IST`);
      console.error(`✅ Valid: After 3:30 PM OR before 9:15 AM`);
      console.log('=========================================\n');
      
      this.dataFreshnessStatus = {
        isValid: false,
        message: `⏰ Cannot save now! Current time: ${currentTime} IST. Daily data can only be saved after 3:30 PM or before 9:15 AM next day.`,
        warningLevel: 'error'
      };
      return;
    }
    
    const dailyData = [];
    
    this.inputValue.forEach((res) => {
      if (res['d'] && res['d'][3] && res['d'][4] && res['d'][5]) {
        dailyData.push({
          name: res['d'][0],
          dailyHigh: res['d'][3],
          dailyLow: res['d'][4],
          dailyClose: res['d'][5],
          timestamp: new Date().toISOString()
        });
      }
    });

    if (dailyData.length > 0) {
      localStorage.setItem('lastDayData', JSON.stringify(dailyData));
      localStorage.setItem('lastDayDataTimestamp', new Date().toISOString());
      console.log(`✅ Saved ${dailyData.length} stocks' DAILY data to localStorage`);
      console.log('📅 Saved at:', new Date().toLocaleString());
      console.log('📊 Sample:', dailyData[0]);
      console.log('🎯 Next Step: TOMORROW, click "Refresh Data" to detect crosses');
      console.log('=========================================\n');
      this.updateDataFreshnessStatus(); // Update UI status - banner will show success
    } else {
      console.error('❌ No daily data found. Make sure data is loaded first.');
      // No alert - status will show in banner
    }
  }

  /**
   * Get yesterday's data from localStorage
   */
  getLastDayData(): Map<string, any> {
    const dataMap = new Map();
    
    try {
      const storedData = localStorage.getItem('lastDayData');
      const timestamp = localStorage.getItem('lastDayDataTimestamp');
      
      if (!storedData) {
        console.warn('⚠️ No daily data found in localStorage. Click "Save Daily Data" button first.');
        return dataMap;
      }

      const dailyData = JSON.parse(storedData);
      const savedDate = timestamp ? new Date(timestamp) : new Date();
      const hoursSinceUpdate = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);
      
      console.log(`📅 Last day data saved on: ${savedDate.toLocaleString()}`);
      console.log(`⏰ Hours since update: ${hoursSinceUpdate.toFixed(1)}`);
      
      if (hoursSinceUpdate > 24) {
        console.warn(`⚠️ Daily data is ${hoursSinceUpdate.toFixed(1)} hours old. May be stale. Save fresh data!`);
      }

      dailyData.forEach(stock => {
        dataMap.set(stock.name, stock);
      });
      
      console.log(`✅ Loaded ${dataMap.size} stocks from localStorage (daily)`);
    } catch (error) {
      console.error('❌ Error loading daily data:', error);
    }
    
    return dataMap;
  }

  /**
   * Calculate Camarilla levels
   */
  calculateCamarillaLevels(high: number, low: number, close: number) {
    const range = high - low;
    
    const H3 = close + (range * 1.1 / 4.0);
    const H4 = close + (range * 1.1 / 2.0);
    const H5 = (high / low) * close;
    const L3 = close - (range * 1.1 / 4.0);
    const L4 = close - (range * 1.1 / 2.0);
    const L5 = (low / high) * close;
    
    return {
      PP: (high + low + close) / 3.0,  // Pivot Point
      H3: H3,
      H4: H4,
      H5: H5,
      L3: L3,
      L4: L4,
      L5: L5,
      mid: (H3 + L3) / 2  // Stop Loss level (midpoint between H3 and L3)
    };
  }

  /**
   * Validate if saved data is fresh enough for current timeframe
   */
  validateDataFreshness(): { isValid: boolean, message: string, warningLevel: 'error' | 'warning' | 'info' } {
    const timeframeLabel = this.timeframe === 'weekly' ? 'WEEKLY' : 'DAILY';
    
    try {
      if (this.timeframe === 'weekly') {
        const timestamp = localStorage.getItem('lastWeekDataTimestamp');
        if (!timestamp) {
          return { 
            isValid: false, 
            message: '❌ No weekly data found! Click "Save Weekly Data" first.', 
            warningLevel: 'error' 
          };
        }

        const savedDate = new Date(timestamp);
        const now = new Date();
        const daysSinceUpdate = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Check if data is from previous week (should be saved Fri-Mon of last week)
        const savedDayOfWeek = savedDate.getDay(); // 0=Sun, 5=Fri, 1=Mon
        const currentDayOfWeek = now.getDay();
        
        // Data is STALE if:
        // 1. More than 7 days old
        // 2. More than 10 days old (definitely wrong week)
        if (daysSinceUpdate > 10) {
          return { 
            isValid: false, 
            message: `❌ STALE DATA! Saved ${daysSinceUpdate.toFixed(0)} days ago (${savedDate.toLocaleDateString()}). This is NOT last week's data! Save fresh data now!`, 
            warningLevel: 'error' 
          };
        } else if (daysSinceUpdate > 7) {
          return { 
            isValid: false, 
            message: `⚠️ OLD DATA! Saved ${daysSinceUpdate.toFixed(0)} days ago (${savedDate.toLocaleDateString()}). Should be saved every Friday-Monday. Signals may be WRONG!`, 
            warningLevel: 'warning' 
          };
        } else if (daysSinceUpdate < 1 && currentDayOfWeek >= 2 && currentDayOfWeek <= 4) {
          // If saved today and it's Tue/Wed/Thu, that's wrong (should be from last Fri-Mon)
          return { 
            isValid: false, 
            message: `⚠️ You saved weekly data TODAY (${savedDate.toLocaleDateString()})! For weekly levels, save on Friday/Weekend/Monday only. Current data is from THIS week, not LAST week!`, 
            warningLevel: 'warning' 
          };
        } else {
          return { 
            isValid: true, 
            message: `✅ Weekly data is fresh! Saved ${daysSinceUpdate.toFixed(1)} days ago (${savedDate.toLocaleDateString()})`, 
            warningLevel: 'info' 
          };
        }

      } else {
        // DAILY validation
        const timestamp = localStorage.getItem('lastDayDataTimestamp');
        if (!timestamp) {
          return { 
            isValid: false, 
            message: '❌ No daily data found! Click "Save Daily Data" first.', 
            warningLevel: 'error' 
          };
        }

        const savedDate = new Date(timestamp);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);
        const daysSinceUpdate = hoursSinceUpdate / 24;
        
        // Data is STALE if:
        // 1. More than 30 hours old (more than 1 trading day)
        // 2. More than 48 hours old (definitely wrong day)
        if (daysSinceUpdate > 3) {
          return { 
            isValid: false, 
            message: `❌ VERY OLD DATA! Saved ${daysSinceUpdate.toFixed(0)} days ago (${savedDate.toLocaleDateString()}). This is NOT yesterday's data! Save fresh data now!`, 
            warningLevel: 'error' 
          };
        } else if (hoursSinceUpdate > 30) {
          return { 
            isValid: false, 
            message: `⚠️ OLD DATA! Saved ${hoursSinceUpdate.toFixed(0)} hours ago (${savedDate.toLocaleString()}). Should be saved daily after 3:30 PM. Signals may be WRONG!`, 
            warningLevel: 'warning' 
          };
        } else if (hoursSinceUpdate < 1) {
          // Saved less than 1 hour ago - might be same day (OK if saving for next day)
          return { 
            isValid: true, 
            message: `✅ Daily data saved recently (${savedDate.toLocaleString()}). Use tomorrow for crosses!`, 
            warningLevel: 'info' 
          };
        } else {
          return { 
            isValid: true, 
            message: `✅ Daily data is fresh! Saved ${hoursSinceUpdate.toFixed(1)} hours ago (${savedDate.toLocaleString()})`, 
            warningLevel: 'info' 
          };
        }
      }
    } catch (error) {
      return { 
        isValid: false, 
        message: `❌ Error validating data: ${error}`, 
        warningLevel: 'error' 
      };
    }
  }

  /**
   * Detect current candle crossing H3/L3 levels UP or DOWN
   */
  detectCamarillaCrosses() {
    // FIRST: Validate data freshness
    const validation = this.validateDataFreshness();
    this.dataFreshnessStatus = validation; // Update banner status
    
    console.log('\n🔍 ========== DATA FRESHNESS CHECK ==========');
    console.log(validation.message);
    
    if (validation.warningLevel === 'error') {
      console.error('🚫 STOPPING DETECTION - Data is too old or missing!');
      console.log('=========================================\n');
      // Don't show alert - banner will show the error
      this.camarillaCrosses = [];
      return;
    }
    
    if (validation.warningLevel === 'warning') {
      console.warn('⚠️ WARNING - Data may be stale, but proceeding with detection');
      // Don't show alert - banner will show the warning
      // Continue with detection but user can see warning in banner
    } else {
      console.log('✅ Data validation passed - proceeding with detection');
    }
    console.log('=========================================\n');
    
    // SECOND: For DAILY timeframe, check if we're in valid trading hours
    if (this.timeframe === 'daily') {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      const hours = istTime.getUTCHours();
      const minutes = istTime.getUTCMinutes();
      const currentMinutes = hours * 60 + minutes;
      
      // Valid detection time: 9:15 AM - 3:30 PM IST (market hours)
      const marketOpen = 555;  // 9:15 AM
      const marketClose = 930; // 3:30 PM
      
      if (currentMinutes < marketOpen || currentMinutes >= marketClose) {
        console.warn('⏰ OUTSIDE MARKET HOURS!');
        console.warn(`📅 Current IST time: ${hours}:${minutes.toString().padStart(2, '0')}`);
        console.warn('✅ Valid detection time: 9:15 AM - 3:30 PM IST (market hours)');
        console.warn('💡 Daily Camarilla crosses can only be detected during market hours');
        console.log('=========================================\n');
        
        this.dataFreshnessStatus = {
          isValid: false,
          message: `⏰ Market is CLOSED! Daily crosses can only be detected during market hours (9:15 AM - 3:30 PM IST). Current time: ${hours}:${minutes.toString().padStart(2, '0')}`,
          warningLevel: 'warning'
        };
        
        this.camarillaCrosses = [];
        return;
      }
    }
    
    // Get data based on selected timeframe
    const lastData = this.timeframe === 'weekly' ? this.getLastWeekData() : this.getLastDayData();
    const timeframeLabel = this.timeframe === 'weekly' ? 'WEEKLY' : 'DAILY';
    
    if (lastData.size === 0) {
      console.warn(`⚠️ No last ${this.timeframe} data available. Click "Save ${this.timeframe === 'weekly' ? 'Weekly' : 'Daily'} Data" button first!`);
      this.camarillaCrosses = [];
      return;
    }

    const crosses = [];
    
    this.inputValue.forEach((res) => {
      const stockName = res['d'][0];
      const lastPeriod = lastData.get(stockName);
      
      if (!lastPeriod) return;
      
      // Current candle data
      const open = res['d'][1];
      const high = res['d'][2];
      const low = res['d'][3];
      const close = res['d'][4];
      const volume = res['d'][7];
      const sector = res['d'][18];
      
      // Volume filter: Only check stocks with volume > 1,00,000 (1 lakh)
      if (volume < 100000) return;
      
      // Calculate Camarilla levels from last period's data
      const periodHigh = this.timeframe === 'weekly' ? lastPeriod.weeklyHigh : lastPeriod.dailyHigh;
      const periodLow = this.timeframe === 'weekly' ? lastPeriod.weeklyLow : lastPeriod.dailyLow;
      const periodClose = this.timeframe === 'weekly' ? lastPeriod.weeklyClose : lastPeriod.dailyClose;
      
      const levels = this.calculateCamarillaLevels(periodHigh, periodLow, periodClose);
      
      // DETECTION LOGIC: Current candle crossing levels
      
      // H3 Cross UP: low touched/below H3, close above H3 (Bullish - BUY)
      const h3CrossUp = low <= levels.H3 && close > levels.H3;
      
      // L3 Cross DOWN: high touched/above L3, close below L3 (Bearish - SELL)
      const l3CrossDown = high >= levels.L3 && close < levels.L3;
      
      // H4 Breakout: close above H4 (Very Bullish - STRONG BUY)
      const h4Breakout = close > levels.H4;
      
      // L4 Breakdown: close below L4 (Very Bearish - STRONG SELL)
      const l4Breakdown = close < levels.L4;
      
      // H3 Rejection: high touched H3, close below (Resistance - avoid buy)
      const h3Rejection = high >= levels.H3 && close < levels.H3 && !h3CrossUp;
      
      // L3 Bounce UP: low touched L3, close above (Support bounce - BUY)
      const l3BounceUp = low <= levels.L3 && close > levels.L3;
      
      if (h3CrossUp || l3CrossDown || h4Breakout || l4Breakdown || h3Rejection || l3BounceUp) {
        // Get pattern info
        const patternInfo = this.getPatternStrength(open, high, low, close);
        
        let crossedLevel = '';
        let levelPrice = 0;
        let signal = '';
        
        if (h4Breakout) {
          crossedLevel = 'H4 Breakout';
          levelPrice = levels.H4;
          signal = '🚀 Very Strong Buy';
        } else if (h3CrossUp) {
          crossedLevel = 'H3 Cross UP';
          levelPrice = levels.H3;
          signal = '✅ Buy Signal';
        } else if (l3BounceUp) {
          crossedLevel = 'L3 Bounce UP';
          levelPrice = levels.L3;
          signal = '📈 Support Bounce';
        } else if (l3CrossDown) {
          crossedLevel = 'L3 Cross DOWN';
          levelPrice = levels.L3;
          signal = '🔻 Sell Signal';
        } else if (l4Breakdown) {
          crossedLevel = 'L4 Breakdown';
          levelPrice = levels.L4;
          signal = '⚠️ Strong Sell';
        } else if (h3Rejection) {
          crossedLevel = 'H3 Rejection';
          levelPrice = levels.H3;
          signal = '⚠️ Resistance';
        }
        
        const distanceFromLevel = ((close - levelPrice) / levelPrice * 100).toFixed(2);
        
        // Boost strength
        let finalStrength = patternInfo.strength;
        if (h4Breakout) finalStrength = Math.min(100, finalStrength + 20);
        if (h3CrossUp && patternInfo.pattern !== 'none') finalStrength = Math.min(100, finalStrength + 15);
        if (l3BounceUp && patternInfo.pattern !== 'none') finalStrength = Math.min(100, finalStrength + 15);
        if (l3CrossDown && patternInfo.pattern !== 'none') finalStrength = Math.min(100, finalStrength + 15); // Bearish pattern boost
        if (l4Breakdown) finalStrength = Math.min(100, finalStrength + 20); // Strong bearish
        
        crosses.push({
          name: stockName,
          close,
          high,
          low,
          volume,
          sector,
          crossedLevel,
          levelPrice,
          distanceFromLevel,
          signal,
          pattern: patternInfo.pattern !== 'none' ? patternInfo.pattern : 'No Pattern',
          strength: finalStrength,
          isBullish: patternInfo.isBullish,
          H3: levels.H3,
          H4: levels.H4,
          L3: levels.L3,
          L4: levels.L4,
          lastWeekHigh: periodHigh,
          lastWeekLow: periodLow,
          lastWeekClose: periodClose
        });
      }
    });
    
    // Sort by strength
    crosses.sort((a, b) => b.strength - a.strength);
    
    this.camarillaCrosses = crosses;
    
    console.log(`🎯 Found ${crosses.length} ${timeframeLabel} Camarilla crosses (Volume > 1L)`);
    console.log('Breakdown:', {
      h4Breakout: crosses.filter(c => c.crossedLevel === 'H4 Breakout').length,
      h3CrossUp: crosses.filter(c => c.crossedLevel === 'H3 Cross UP').length,
      l3BounceUp: crosses.filter(c => c.crossedLevel === 'L3 Bounce UP').length,
      l3CrossDown: crosses.filter(c => c.crossedLevel === 'L3 Cross DOWN').length,
      l4Breakdown: crosses.filter(c => c.crossedLevel === 'L4 Breakdown').length,
      h3Rejection: crosses.filter(c => c.crossedLevel === 'H3 Rejection').length
    });
    
    // Update grid with filtered data
    this.updateGridData();
  }

  /**
   * Pattern detection with strength scoring
   */
  getPatternStrength(open, high, low, close) {
    const realBody = Math.abs(close - open);
    const lowerShadow = Math.min(open, close) - low;
    const upperShadow = high - Math.max(open, close);
    const totalRange = high - low;
    
    if (totalRange === 0 || totalRange < 0.01) {
      return { pattern: 'none', strength: 0, isBullish: false };
    }
    
    const bodyRatio = realBody / totalRange;
    const lowerShadowRatio = lowerShadow / totalRange;
    const upperShadowRatio = upperShadow / totalRange;
    
    // Dragonfly Doji
    if (bodyRatio < 0.1 && lowerShadowRatio > 0.65 && upperShadowRatio < 0.15) {
      const strength = Math.min(100, lowerShadowRatio * 120 + (close > open ? 20 : 0));
      return { pattern: 'Dragonfly Doji', strength: Math.round(strength), isBullish: true };
    }
    
    // Bullish Hammer
    if (lowerShadow >= 2 * realBody && upperShadowRatio < 0.1 && 
        bodyRatio < 0.35 && lowerShadowRatio > 0.6 && close > open) {
      const strength = Math.min(100, (lowerShadowRatio * 80) + ((1 - bodyRatio) * 10) + ((close - open) / totalRange * 10));
      return { pattern: 'Bullish Hammer', strength: Math.round(strength), isBullish: true };
    }
    
    // Classic Doji
    if (bodyRatio < 0.1 && upperShadowRatio > 0.25 && lowerShadowRatio > 0.25) {
      const strength = Math.min(100, (1 - bodyRatio) * 70 + Math.min(upperShadowRatio, lowerShadowRatio) * 30);
      return { pattern: 'Classic Doji', strength: Math.round(strength), isBullish: true };
    }
    
    // Inverted Hammer
    if (upperShadow >= 2 * realBody && lowerShadowRatio < 0.1 && bodyRatio < 0.35 && upperShadowRatio > 0.6) {
      const strength = Math.min(100, (upperShadowRatio * 70) + ((close >= open ? 20 : 0)) + ((1 - bodyRatio) * 10));
      return { pattern: 'Inverted Hammer', strength: Math.round(strength), isBullish: true };
    }
    
    return { pattern: 'none', strength: 0, isBullish: false };
  }

  /**
   * Auto-save weekly data if in update window
   */
  autoSaveWeeklyData() {
    // For testing: Disable auto-save to avoid confusion
    // Only manual save via button
    // if (this.shouldUpdateWeeklyData() && this.inputValue.length > 0) {
    //   this.saveWeeklyDataToStorage();
    // }
    console.log('💡 Auto-save disabled for testing. Use "Save Weekly Data" button to save current week data.');
  }

  /**
   * Manual save trigger
   */
  manualSaveWeeklyData() {
    this.saveWeeklyDataToStorage();
  }

  /**
   * Clear weekly data
   */
  clearWeeklyData() {
    localStorage.removeItem('lastWeekData');
    localStorage.removeItem('lastWeekDataTimestamp');
    console.log('✅ Weekly data cleared from localStorage');
    alert('Weekly data cleared!');
  }

  /**
   * Get count of specific cross type
   */
  getH4BreakoutCount(): number {
    return this.camarillaCrosses.filter(c => c.crossedLevel === 'H4 Breakout').length;
  }

  getH3CrossUpCount(): number {
    return this.camarillaCrosses.filter(c => c.crossedLevel === 'H3 Cross UP').length;
  }

  getL3BounceUpCount(): number {
    return this.camarillaCrosses.filter(c => c.crossedLevel === 'L3 Bounce UP').length;
  }

  getL3CrossDownCount(): number {
    return this.camarillaCrosses.filter(c => c.crossedLevel === 'L3 Cross DOWN').length;
  }

  /**
   * Filter stocks by signal type
   * @param signalType - 'H4 Breakout', 'H3 Cross UP', 'L3 Bounce UP', 'L3 Cross DOWN', or null for all
   */
  filterBySignal(signalType: string | null) {
    if (this.activeSignalFilter === signalType) {
      // Toggle off if clicking same filter
      this.activeSignalFilter = null;
      console.log('🔍 Filter cleared - showing all signals');
    } else {
      this.activeSignalFilter = signalType;
      console.log(`🔍 Filtering by: ${signalType}`);
    }
    
    // Update grid data
    this.updateGridData();
  }

  /**
   * Update grid with filtered data
   */
  updateGridData() {
    if (!this.gridApi) return;
    
    const filteredData = this.activeSignalFilter 
      ? this.camarillaCrosses.filter(c => c.crossedLevel === this.activeSignalFilter)
      : this.camarillaCrosses;
    
    this.gridApi.setGridOption('rowData', filteredData);
    console.log(`📊 Grid updated: ${filteredData.length} stocks displayed`);
  }

  /**
   * Check if a filter is active
   */
  isFilterActive(signalType: string): boolean {
    return this.activeSignalFilter === signalType;
  }

  // Grid handlers
  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onSearchInputChange() {
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', this.searchQuery);
    }
  }

  onBtnExport() {
    var d = new Date();
    this.gridApi.exportDataAsCsv({ fileName: `Camarilla-H3-L3-Crosses(${d.toLocaleDateString()}).csv` });
  }
}
