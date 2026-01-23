# 🎯 Camarilla H3/L3 Weekly Cross Detection Guide

## Overview
Detect stocks crossing weekly Camarilla pivot levels with candlestick pattern confirmation for high-probability trade setups.

## How It Works

### 1. **Save Weekly Data (Friday/Weekend)**
**When:** Friday after 3:30 PM or before Monday 9:15 AM IST

**Action:**
- Click **"Save Weekly Data"** button in BB component
- Or let it auto-save (runs automatically during update window)

**What Happens:**
- Saves last week's High, Low, Close for all stocks to localStorage
- Data persists until next week's update
- Console logs: `✅ Saved X stocks' weekly data to localStorage`

### 2. **Calculate Camarilla Levels**
Using last week's data:
```
H3 = Close + (High - Low) × 1.1 / 4.0   → Entry level
H4 = Close + (High - Low) × 1.1 / 2.0   → Target 1
H5 = (High / Low) × Close               → Target 2
L3 = Close - (High - Low) × 1.1 / 4.0   → Support level
L4 = Close - (High - Low) × 1.1 / 2.0   → Stop loss
L5 = (Low / High) × Close               → Extreme support
```

### 3. **Detect Crosses (Trading Week)**
**When:** Monday to Friday during market hours

**Action:**
- Click **"Show Camarilla H3/L3"** button

**Detection Logic:**
- **H3 Cross (Bullish):** Low ≤ H3 AND Close > H3
- **L3 Bounce (Bullish):** Low ≤ L3 AND Close > L3  
- **H4 Breakout (Very Bullish):** Close > H4

**Pattern Boost:**
- Stocks with Doji/Hammer patterns get +15 strength bonus
- H4 breakouts get +20 strength bonus

## UI Features

### Buttons
1. **Save Weekly Data** - Manually save weekly data to localStorage
2. **Show Camarilla H3/L3** - Display crosses with pattern confirmation
3. **Download CSV** - Export results for analysis

### Grid Columns
- **Stock** - Symbol with TradingView link
- **Close** - Current price
- **Crossed Level** - H4 Breakout / H3 Cross / L3 Bounce
- **Level Price** - Exact Camarilla level price
- **Distance %** - How far price moved from level
- **Signal** - 🚀 Very Strong Buy / ✅ Buy Signal / 📈 Strong Buy
- **Pattern** - Doji/Hammer detection
- **Strength** - 0-100 score with emoji indicators
- **Volume** - Trading volume
- **H3/H4/L3 Levels** - Reference levels
- **Last Week Close** - Base for calculations

## Trading Strategy

### Entry Signals
1. **H4 Breakout** (Strongest)
   - Price closes above H4
   - Very strong momentum
   - Target: H5 or trail stop

2. **H3 Cross** (Strong)
   - Price touches/dips below H3
   - Closes above H3 with bullish pattern
   - Entry: Break of current candle high
   - Target: H4 (1:1.5 ratio)

3. **L3 Bounce** (Support Play)
   - Price touches L3 support
   - Bounces back with bullish candle
   - Entry: Break of bounce candle high
   - Target: Previous resistance

### Pattern Confirmation (Boosts Strength)
- **Dragonfly Doji** - Long lower shadow, no upper shadow
- **Bullish Hammer** - Small body at top, long lower shadow
- **Classic Doji** - Small body, shadows on both sides
- **Inverted Hammer** - Small body at bottom, long upper shadow

## Console Logs

### When Saving Weekly Data:
```
✅ Saved 153 stocks' weekly data to localStorage
📅 Last week data saved on: 1/10/2026, 4:00:00 PM
```

### When Detecting Crosses:
```
✅ Loaded 153 stocks from localStorage
⏰ Days since update: 3.2
🎯 Found 47 Camarilla crosses
Top 10 crosses: [Array of stocks sorted by strength]
```

### Warnings:
```
⚠️ No weekly data found in localStorage
⚠️ Weekly data is 8.5 days old. May be stale.
```

## Auto-Save Logic

### Update Window
**Friday 3:30 PM IST to Monday 9:15 AM IST**
- Auto-saves on every data refresh
- No manual action needed if you refresh during this window

### Manual Save
- Use "Save Weekly Data" button anytime
- Useful if you forgot to save during the update window
- Can save multiple times (overwrites old data)

## Data Storage

### localStorage Keys:
- `lastWeekData` - Array of {name, weeklyOpen, weeklyHigh, weeklyLow, weeklyClose, timestamp}
- `lastWeekDataTimestamp` - ISO date string of last save

### Clear Old Data:
```typescript
// In browser console:
localStorage.removeItem('lastWeekData');
localStorage.removeItem('lastWeekDataTimestamp');
```

## Example Workflow

### Week 1 (Setup Week)
1. **Friday 3:30 PM:** Click "Save Weekly Data"
2. **Console:** `✅ Saved 153 stocks' weekly data to localStorage`

### Week 2 (Trading Week)
1. **Monday 9:30 AM:** Click "Show Camarilla H3/L3"
2. **Console:** `🎯 Found 47 Camarilla crosses`
3. **Review Grid:** 
   - H4 Breakout: 12 stocks (Very Strong Buy)
   - H3 Cross: 23 stocks (Buy Signal)
   - L3 Bounce: 12 stocks (Strong Buy)
4. **Sort by Strength:** Top stocks show 85-100 strength
5. **Enter Trades:** Focus on H4 breakouts and H3 crosses with patterns

### Week 2 (Friday 3:30 PM)
1. **Auto-saves** new weekly data
2. **Old data replaced** with this week's close prices
3. **Next week:** New H3/L3 levels calculated from this week's data

## Troubleshooting

### "No Camarilla crosses found"
- Check if weekly data is saved: Look for `lastWeekData` in localStorage
- Save weekly data manually using "Save Weekly Data" button
- Ensure you refreshed data during Friday-Monday window

### "Weekly data is X days old"
- Data older than 7 days may be from previous week
- Save fresh data using "Save Weekly Data" button
- Check if auto-save window (Fri 3:30 PM - Mon 9:15 AM) was missed

### No patterns detected
- Lower threshold in code: Change `strength >= 50` to `strength >= 40`
- Check if stocks actually crossed levels (low <= H3, close > H3)
- Verify volume > 200,000 in filter

## Performance Tips

1. **Save Data Once Per Week** - Saves memory, prevents stale data
2. **Clear Old Data** - Every month, clear localStorage manually
3. **Export Results** - Download CSV for offline analysis
4. **Focus on High Strength** - Filter strength ≥ 75 for best setups

## Example Output

```
Stock: RELIANCE
Crossed Level: H3 Cross
Level Price: ₹2,450.30
Distance: +1.2%
Signal: ✅ Buy Signal
Pattern: Bullish Hammer
Strength: 🔥 85
Volume: 2.5Cr
H3: ₹2,450.30 | H4: ₹2,485.60 | L3: ₹2,380.40
Last Week Close: ₹2,415.00
```

## Integration with Existing Features

### BB Component Features:
- **Bollinger Band Detection** - Stocks touching lower band
- **Pattern Detection** - 9 candlestick patterns
- **Strength Scoring** - 0-100 scale
- **Toggle Views** - Best Patterns vs All Results

### Camarilla Addition:
- **Weekly Timeframe** - Swing trading setups
- **localStorage Cache** - Persistent weekly data
- **Auto-Update** - Friday-Monday save window
- **Pattern Boost** - Enhanced strength at key levels

---

## 🚀 Quick Start

1. **Save:** Click "Save Weekly Data" on Friday afternoon
2. **Detect:** Click "Show Camarilla H3/L3" during the week
3. **Trade:** Focus on H4 breakouts and H3 crosses with patterns
4. **Repeat:** Auto-saves next Friday

**Happy Trading! 🎯📈**
