// Load environment variables
require('dotenv').config();

const express = require('express');
const request = require('request-promise').defaults({ strictSSL: false });
var cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

var app = express()
app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5001;

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tradeApp';
const COLLECTION_NAME = 'camarillaData';

let db;
let mongoClient;

// Connect to MongoDB
async function connectToMongoDB() {
	try {
		mongoClient = new MongoClient(MONGODB_URI);
		await mongoClient.connect();
		db = mongoClient.db(DB_NAME);
		console.log('✅ Connected to MongoDB successfully');
		return db;
	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		// Fallback to file system if MongoDB fails
		console.log('⚠️  Falling back to file system storage');
		return null;
	}
}

// Create data directory if it doesn't exist (fallback)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
	fs.mkdirSync(DATA_DIR);
}

const WEEKLY_DATA_FILE = path.join(DATA_DIR, 'weekly-camarilla.json');
const DAILY_DATA_FILE = path.join(DATA_DIR, 'daily-camarilla.json');

async function fetchTradingViewData(indexType) {
	let query = []
	if (indexType && indexType['index']) {
		query = [
			{
				"type": "index",
				"values": [
					`NSE:${indexType['index']}`
				]
			}

		]
	}
	var reqObj = {
		'method': 'POST',
		'json': true,
		'url': 'https://scanner.tradingview.com/india/scan',
		'body': {
			"filter": [
				// {
				// 	"left": "exchange",
				// 	"operation": "equal",
				// 	"right": "NSE"
				// },
				{
					"left": "is_primary",
					"operation": "equal",
					"right": true
				},
				{
					"left": "active_symbol",
					"operation": "equal",
					"right": true
				}
			],
			"options": {
				"lang": "en"
			},
			"markets": [
				"india"
			],
			"symbols": {
				"query": {
					"types": []
				},
				"tickers": [],
				"groups": query
			},
			"columns": [
				"name",
				"open",
				"high",
				"low",
				"close",
				"change",
				"change_abs",
				"volume",
				"Value.Traded",
				"change_from_open",
				"change_from_open_abs",
				"SMA20",
				"SMA20|5",
				"SMA50|5",
				"SMA200",
				"average_volume_10d_calc",
				"average_volume_30d_calc",
				"VWAP",
				"sector",
				"change_abs|5",
				"change|5",
				"BB.lower|1W",
				"open|1W",
				"high|1W",
				"low|1W",
				"close|1W",
				"SMA20|1W",
				"RSI",
				"price_52_week_high",
				"MACD.macd",
				"MACD.signal",
		        "industry.tr",
				// for mommentan stocks intrda day for pivot logic
				"average_volume_90d_calc", // > 500k if less stocks there means > 300k
				"relative_volume_10d_calc", // > 1.2 or 1.5
				"market_cap_basic", // > 2B to 2000B,
				"float_shares_outstanding",
				"price_52_week_low",
				"EMA5|5",
				"EMA10|5",
				"EMA14|60",
				"EMA21|60",
				"EMA50|60",
				"RSI|60",
				"exchange",
				"debt_to_equity"
			],
			"sort": {
				"sortBy": "close",
				"sortOrder": "desc"
			},
			"price_conversion": {
				"to_symbol": false
			},
			"range": [
				0, 6500
			]
		}
	}
	if (indexType && indexType['sector']) {
		reqObj['body']['filter'].push(
			{
				"left": "sector",
				"operation": "in_range",
				"right": [indexType['sector']]
			})
	}

	if (indexType && indexType['indexs']) {
		reqObj['body']['symbols']['tickers'] = ["NSE:NIFTY", "NSE:BANKNIFTY", "BSE:SENSEX", "NSE:INDIAVIX", "NSE:CNXIT"]
	}
	
	if (indexType && indexType['nseTop']) {
		// Combined list: Nifty Top 10 + All IT stocks
		reqObj['body']['symbols']['tickers'] = [
			// Nifty Top 10
			"NSE:HDFCBANK","NSE:RELIANCE","NSE:ICICIBANK","NSE:INFY","NSE:ITC","NSE:TCS","NSE:LT","NSE:BHARTIARTL","NSE:AXISBANK","NSE:SBIN",
			// IT Stocks (avoiding duplicates INFY, TCS already in top 10)
			"NSE:WIPRO","NSE:TECHM","NSE:HCLTECH","NSE:LTIM","NSE:PERSISTENT","NSE:COFORGE","NSE:MPHASIS","NSE:LTTS"
		]
	}
	
	if (indexType && indexType['niftyIT']) {
		reqObj['body']['symbols']['tickers'] = ["NSE:INFY","NSE:TCS","NSE:WIPRO","NSE:TECHM","NSE:HCLTECH","NSE:LTIM","NSE:PERSISTENT","NSE:COFORGE","NSE:MPHASIS","NSE:LTTS"] 
	}
	let result = await request(reqObj);
	return result
}

// Health check endpoint for server wake-up
// Health check endpoint with smart data save check
app.get('/health', async (req, res) => {
	const checkData = req.query.checkData === 'true';
	
	if (checkData) {
		// Calculate IST time
		const now = new Date();
		const istOffset = 5.5 * 60 * 60 * 1000;
		const istTime = new Date(now.getTime() + istOffset);
		const istMinutes = istTime.getUTCHours() * 60 + istTime.getUTCMinutes();
		const currentDay = istTime.getUTCDay();
		
		const isAfter330PM = istMinutes >= 930;
		const isFriday = currentDay === 5;
		const isWeekday = currentDay >= 1 && currentDay <= 5;
		
		// Check if we need to save data
		if (db && isWeekday && isAfter330PM) {
			try {
				const collection = db.collection(COLLECTION_NAME);
				const dailyData = await collection.findOne({ _id: 'daily' });
				const weeklyData = await collection.findOne({ _id: 'weekly' });
				
				const now = new Date();
				let needsSave = false;
				
				// Check daily data
				if (dailyData) {
					const savedDate = new Date(dailyData.timestamp);
					const hoursSinceLastSave = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);
					if (hoursSinceLastSave > 20) { // More than 20 hours old
						console.log('⚠️ [HEALTH] Daily data is stale, triggering save...');
						await autoSaveDailyData('health-check');
						needsSave = true;
					}
				}
				
				// Check weekly data (Friday only)
				if (isFriday && weeklyData) {
					const savedDate = new Date(weeklyData.timestamp);
					const daysSinceLastSave = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
					if (daysSinceLastSave >= 5) {
						console.log('⚠️ [HEALTH] Weekly data is stale, triggering save...');
						await autoSaveWeeklyData('health-check');
						needsSave = true;
					}
				}
				
				return res.status(200).json({
					status: 'OK',
					mongodb: 'connected',
					dataChecked: true,
					savedData: needsSave
				});
			} catch (error) {
				console.error('[HEALTH] Error checking data:', error.message);
			}
		}
	}
	
	res.status(200).json({
		status: 'OK',
		mongodb: db ? 'connected' : 'not connected'
	});
});

// ============ CAMARILLA AUTO-SAVE FUNCTIONS ============

/**
 * Process weekly data for Camarilla calculations
 */
function processWeeklyData(tradingViewData) {
	if (!tradingViewData || !tradingViewData.data) return [];
	
	return tradingViewData.data.map(stock => ({
		name: stock.d[0],
		weeklyOpen: stock.d[22],
		weeklyHigh: stock.d[23],
		weeklyLow: stock.d[24],
		weeklyClose: stock.d[25]
	})).filter(stock => stock.weeklyHigh && stock.weeklyLow && stock.weeklyClose);
}

/**
 * Process daily data for Camarilla calculations
 * Column indices from TradingView API:
 * [0] = name
 * [1] = open
 * [2] = high
 * [3] = low
 * [4] = close
 * [5] = change (%)
 */
function processDailyData(tradingViewData) {
	if (!tradingViewData || !tradingViewData.data) return [];
	
	return tradingViewData.data.map(stock => ({
		name: stock.d[0],
		dailyHigh: stock.d[2],  // Fixed: [2] = high (was [3])
		dailyLow: stock.d[3],   // Fixed: [3] = low (was [4])
		dailyClose: stock.d[4]  // Fixed: [4] = close (was [5] which was change%)
	})).filter(stock => stock.dailyHigh && stock.dailyLow && stock.dailyClose);
}

/**
 * Auto-save WEEKLY Camarilla data
 * Runs every Friday at 3:30 PM IST (10:00 UTC)
 */
async function autoSaveWeeklyData(triggeredBy = 'auto-cron') {
	console.log('🕒 [CRON] Auto-saving WEEKLY Camarilla data...');
	
	try {
		const data = await fetchTradingViewData({});
		const weeklyData = processWeeklyData(data);
		
		const saveData = {
			_id: 'weekly',
			data: weeklyData,
			timestamp: new Date().toISOString(),
			timeframe: 'weekly',
			savedBy: triggeredBy
		};
		
		// Save to MongoDB (with file system fallback)
		if (db) {
			try {
				const collection = db.collection(COLLECTION_NAME);
				await collection.replaceOne(
					{ _id: 'weekly' },
					saveData,
					{ upsert: true }
				);
				console.log(`✅ [MONGODB] Weekly data saved! ${weeklyData.length} stocks processed.`);
			} catch (mongoError) {
				console.error('❌ [MONGODB] Error, falling back to file system:', mongoError.message);
				fs.writeFileSync(WEEKLY_DATA_FILE, JSON.stringify(saveData, null, 2));
				console.log(`✅ [FILE] Weekly data saved to file! ${weeklyData.length} stocks processed.`);
			}
		} else {
			// Fallback to file system if MongoDB not connected
			fs.writeFileSync(WEEKLY_DATA_FILE, JSON.stringify(saveData, null, 2));
			console.log(`✅ [FILE] Weekly data saved to file! ${weeklyData.length} stocks processed.`);
		}
	} catch (error) {
		console.error('❌ [CRON] Error saving weekly data:', error.message);
	}
}

/**
 * Auto-save DAILY Camarilla data
 * Runs every weekday at 3:30 PM IST (10:00 UTC)
 */
async function autoSaveDailyData(triggeredBy = 'auto-cron') {
	console.log(`🕒 [SAVE] Auto-saving DAILY Camarilla data... (triggered by: ${triggeredBy})`);
	
	// SAFETY CHECK: Prevent saving during market hours on weekdays
	const now = new Date();
	const istOffset = 5.5 * 60 * 60 * 1000;
	const istTime = new Date(now.getTime() + istOffset);
	const istHour = istTime.getUTCHours();
	const istMinutes = istHour * 60 + istTime.getUTCMinutes();
	const currentDay = istTime.getUTCDay();
	const isWeekday = currentDay >= 1 && currentDay <= 5;
	const isWeekend = currentDay === 0 || currentDay === 6;
	const isAfter330PM_IST = istMinutes >= 930;
	
	// CRITICAL: On weekdays, ONLY save after 3:30 PM IST OR before 9:15 AM IST (pre-market)
	// Between 9:15 AM - 3:30 PM = Market hours, prices changing, don't save!
	const isDuringMarketHours = isWeekday && istMinutes >= 555 && istMinutes < 930; // 9:15 AM - 3:30 PM
	
	if (isDuringMarketHours && triggeredBy !== 'manual-trigger') {
		console.log(`❌ [SAVE] BLOCKING Daily data save during market hours! (${istHour}:${String(istTime.getUTCMinutes()).padStart(2, '0')} IST on weekday)`);
		console.log(`⏰ [SAVE] Will save after 3:30 PM IST or before 9:15 AM IST. Current triggeredBy: ${triggeredBy}`);
		return; // Don't save!
	}
	
	try {
		const data = await fetchTradingViewData({});
		const dailyData = processDailyData(data);
		
		const saveData = {
			_id: 'daily',
			data: dailyData,
			timestamp: new Date().toISOString(),
			timeframe: 'daily',
			savedBy: triggeredBy
		};
		
		// Save to MongoDB (with file system fallback)
		if (db) {
			try {
				const collection = db.collection(COLLECTION_NAME);
				await collection.replaceOne(
					{ _id: 'daily' },
					saveData,
					{ upsert: true }
				);
				console.log(`✅ [MONGODB] Daily data saved! ${dailyData.length} stocks processed. (triggered by: ${triggeredBy})`);
			} catch (mongoError) {
				console.error('❌ [MONGODB] Error, falling back to file system:', mongoError.message);
				fs.writeFileSync(DAILY_DATA_FILE, JSON.stringify(saveData, null, 2));
				console.log(`✅ [FILE] Daily data saved to file! ${dailyData.length} stocks processed. (triggered by: ${triggeredBy})`);
			}
		} else {
			// Fallback to file system if MongoDB not connected
			fs.writeFileSync(DAILY_DATA_FILE, JSON.stringify(saveData, null, 2));
			console.log(`✅ [FILE] Daily data saved to file! ${dailyData.length} stocks processed. (triggered by: ${triggeredBy})`);
		}
	} catch (error) {
		console.error('❌ [SAVE] Error saving daily data:', error.message);
	}
}

// Schedule WEEKLY auto-save: Every Friday at 3:30 PM IST (10:00 UTC)
cron.schedule('0 10 * * 5', autoSaveWeeklyData, {
	timezone: "UTC"
});
console.log('📅 Scheduled WEEKLY Camarilla auto-save: Every Friday at 3:30 PM IST');

// Schedule DAILY auto-save: Every weekday at 3:30 PM IST (10:00 UTC)
cron.schedule('0 10 * * 1-5', autoSaveDailyData, {
	timezone: "UTC"
});
console.log('📅 Scheduled DAILY Camarilla auto-save: Mon-Fri at 3:30 PM IST');

// ============ PERIODIC DATA FRESHNESS CHECKER ============
// This runs every 15 minutes to ensure data is saved even if cron misses
// Solves the problem: Render restarts → cron lost → data not saved
let periodicCheckRunning = false;

async function periodicDataCheck() {
	if (periodicCheckRunning) {
		console.log('⏭️  [PERIODIC] Check already running, skipping...');
		return;
	}
	
	periodicCheckRunning = true;
	
	try {
		const now = new Date();
		const istOffset = 5.5 * 60 * 60 * 1000;
		const istTime = new Date(now.getTime() + istOffset);
		const istHour = istTime.getUTCHours();
		const istMinutes = istHour * 60 + istTime.getUTCMinutes();
		const currentDay = istTime.getUTCDay();
		
		const isWeekday = currentDay >= 1 && currentDay <= 5;
		const isWeekend = currentDay === 0 || currentDay === 6;
		const isFriday = currentDay === 5;
		const isAfter330PM_IST = istMinutes >= 930;
		const isBeforeMarketOpen_IST = istMinutes < 555;
		
		console.log(`\n🔄 [PERIODIC] Data freshness check... (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][currentDay]} ${istHour}:${String(istTime.getUTCMinutes()).padStart(2, '0')} IST)`);
		
		// Check DAILY data
		if (db) {
			try {
				const collection = db.collection(COLLECTION_NAME);
				const savedDailyData = await collection.findOne({ _id: 'daily' });
				
				if (savedDailyData) {
					const savedDate = new Date(savedDailyData.timestamp);
					const savedDateIST = new Date(savedDate.getTime() + istOffset);
					const daysSince = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
					const hoursSince = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60));
					
					const isSameDay = savedDateIST.getUTCDate() === istTime.getUTCDate() && 
					                  savedDateIST.getUTCMonth() === istTime.getUTCMonth() && 
					                  savedDateIST.getUTCFullYear() === istTime.getUTCFullYear();
					
					// Save if data is stale AND we're after 3:30 PM
					if (!isSameDay && (isAfter330PM_IST || isWeekend)) {
						console.log(`📊 [PERIODIC] DAILY data is ${daysSince} days old. Saving fresh data...`);
						await autoSaveDailyData('periodic-check');
					} else if (isSameDay) {
						console.log(`✅ [PERIODIC] DAILY data is current (saved today, ${hoursSince} hours ago)`);
					} else {
						console.log(`⏸️  [PERIODIC] DAILY data is old but waiting for 3:30 PM IST`);
					}
				} else if (isAfter330PM_IST || isWeekend) {
					console.log(`⚠️  [PERIODIC] No DAILY data found. Saving now...`);
					await autoSaveDailyData('periodic-check');
				}
				
				// Check WEEKLY data
				const savedWeeklyData = await collection.findOne({ _id: 'weekly' });
				
				if (savedWeeklyData) {
					const savedDate = new Date(savedWeeklyData.timestamp);
					const daysSince = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
					
					// Save if it's Friday after 3:30 PM and data is 5+ days old
					if (isFriday && isAfter330PM_IST && daysSince >= 5) {
						console.log(`📅 [PERIODIC] WEEKLY data is ${daysSince} days old and it's Friday. Saving fresh data...`);
						await autoSaveWeeklyData('periodic-check');
					} else if (isWeekend && daysSince >= 5) {
						console.log(`📅 [PERIODIC] WEEKLY data is ${daysSince} days old (weekend). Saving Friday's data...`);
						await autoSaveWeeklyData('periodic-check');
					} else {
						console.log(`✅ [PERIODIC] WEEKLY data is current (${daysSince} days old)`);
					}
				} else if ((isFriday && isAfter330PM_IST) || isWeekend) {
					console.log(`⚠️  [PERIODIC] No WEEKLY data found. Saving now...`);
					await autoSaveWeeklyData('periodic-check');
				}
				
			} catch (error) {
				console.error('❌ [PERIODIC] Error checking data:', error.message);
			}
		}
	} finally {
		periodicCheckRunning = false;
	}
}

// Run periodic check every 2 hours (7200000 ms)
// This is enough since we only need to check after 3:30 PM IST
setInterval(periodicDataCheck, 2 * 60 * 60 * 1000);
console.log('⏰ Scheduled periodic data freshness check: Every 2 hours');

// Run first check after 10 minutes (to let server fully initialize)
setTimeout(periodicDataCheck, 10 * 60 * 1000);
console.log('⏰ First periodic check will run in 10 minutes');

/**
 * Check if data needs to be saved on server startup
 * This handles:
 * 1. Server restarts after 3:30 PM (missed cron window)
 * 2. First-time setup (no data exists)
 * 3. Missed cron runs (server was down)
 */
async function checkAndSaveOnStartup() {
	console.log('\n🔍 [STARTUP] Checking if Camarilla data needs to be saved...');
	
	const now = new Date();
	
	// Convert to IST (UTC + 5:30)
	const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
	const istTime = new Date(now.getTime() + istOffset);
	const istHour = istTime.getUTCHours(); // Use UTC methods after adding offset
	const istMinutes = istHour * 60 + istTime.getUTCMinutes();
	const currentDay = istTime.getUTCDay(); // Get IST day of week (0=Sunday, 1=Monday, ..., 5=Friday)
	
	// Check if it's a weekday (in IST timezone)
	const isWeekday = currentDay >= 1 && currentDay <= 5; // Mon-Fri
	
	// Check if it's after 3:30 PM IST (15:30 = 930 minutes)
	const isAfter330PM_IST = istMinutes >= 930; // After 3:30 PM IST
	const isBeforeMarketOpen_IST = istMinutes < 555; // Before 9:15 AM IST
	
	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	console.log(`📅 Current IST time: ${dayNames[currentDay]}, ${istHour}:${String(istTime.getUTCMinutes()).padStart(2, '0')}`);
	console.log(`🕐 IST Minutes from midnight: ${istMinutes} (After 3:30 PM: ${isAfter330PM_IST}, Before 9:15 AM: ${isBeforeMarketOpen_IST})`);
	
	// ===== CHECK DAILY DATA =====
	// IMPORTANT: 
	// - Mon-Fri: Save ONLY after 3:30 PM IST (market close - final prices for Camarilla)
	// - Sat-Sun: Save ANYTIME (we just need Friday's close data for Monday's Camarilla calculation)
	const isWeekend = currentDay === 0 || currentDay === 6; // Saturday or Sunday
	
	if (isWeekday || isWeekend) {
		try {
			let savedDailyData = null;
			
			// Check MongoDB first
			if (db) {
				try {
					const collection = db.collection(COLLECTION_NAME);
					savedDailyData = await collection.findOne({ _id: 'daily' });
				} catch (mongoError) {
					console.error('❌ [MONGODB] Error reading daily data:', mongoError.message);
				}
			}
			
			// Fallback to file if MongoDB didn't have data
			if (!savedDailyData && fs.existsSync(DAILY_DATA_FILE)) {
				savedDailyData = JSON.parse(fs.readFileSync(DAILY_DATA_FILE, 'utf8'));
			}
			
			if (!savedDailyData) {
				// Weekday: Save if after 3:30 PM IST OR before 9:15 AM IST (pre-market uses previous day close)
				// Weekend: Save anytime (Friday's close data already available)
				if (isWeekend || isAfter330PM_IST || isBeforeMarketOpen_IST) {
					console.log(`📊 [STARTUP] No DAILY data found. Saving now... (${isWeekend ? 'Weekend - anytime OK' : isAfter330PM_IST ? 'After 3:30 PM - market close' : 'Before 9:15 AM - pre-market'})`);
					await autoSaveDailyData('startup-check');
				} else {
					console.log('⏸️  [STARTUP] No DAILY data, but waiting until after 3:30 PM IST (need today\'s market close for Camarilla)');
				}
			} else {
				const savedDate = new Date(savedDailyData.timestamp);
				const savedDateIST = new Date(savedDate.getTime() + istOffset);
				const todayIST = new Date(now.getTime() + istOffset);
				
				// Check if saved data is from today (IST date comparison)
				const isSameDay = savedDateIST.getUTCDate() === todayIST.getUTCDate() && 
				                  savedDateIST.getUTCMonth() === todayIST.getUTCMonth() && 
				                  savedDateIST.getUTCFullYear() === todayIST.getUTCFullYear();
				
				// Save if:
				// 1. Data is from a different day AND (after 3:30 PM OR before 9:15 AM OR weekend)
				// 2. Same day BUT after 3:30 PM AND data was saved before 3:30 PM (refresh with market close)
				const savedTimeMinutes = savedDateIST.getUTCHours() * 60 + savedDateIST.getUTCMinutes();
				const wasSavedBefore330PM = savedTimeMinutes < 930; // Saved before 3:30 PM IST
				
				if (!isSameDay && (isAfter330PM_IST || isBeforeMarketOpen_IST || isWeekend)) {
					console.log(`📊 [STARTUP] DAILY data is from previous day. Saving fresh data... (${isWeekend ? 'Weekend - anytime OK' : isAfter330PM_IST ? 'After 3:30 PM - market close' : 'Before 9:15 AM - pre-market'})`);
					await autoSaveDailyData('startup-refresh');
				} else if (isSameDay && isAfter330PM_IST && wasSavedBefore330PM) {
					console.log(`📊 [STARTUP] DAILY data saved before 3:30 PM today. Refreshing with market close data...`);
					await autoSaveDailyData('startup-refresh');
				} else if (!isSameDay && isWeekday && !isAfter330PM_IST && !isBeforeMarketOpen_IST) {
					console.log(`⏸️  [STARTUP] DAILY data is old, but waiting until after 3:30 PM IST for today's market close`);
				} else {
					console.log(`✅ [STARTUP] DAILY data is current (saved: ${savedDate.toLocaleString()})`);
				}
			}
		} catch (error) {
			console.error('❌ [STARTUP] Error checking daily data:', error.message);
		}
	}
	
	// ===== CHECK WEEKLY DATA =====
	// IMPORTANT: Weekly data should ONLY be saved on FRIDAY after 3:30 PM IST
	const isFriday = currentDay === 5;
	
	try {
		let savedWeeklyData = null;
		
		// Check MongoDB first
		if (db) {
			try {
				const collection = db.collection(COLLECTION_NAME);
				savedWeeklyData = await collection.findOne({ _id: 'weekly' });
			} catch (mongoError) {
				console.error('❌ [MONGODB] Error reading weekly data:', mongoError.message);
			}
		}
		
		// Fallback to file if MongoDB didn't have data
		if (!savedWeeklyData && fs.existsSync(WEEKLY_DATA_FILE)) {
			savedWeeklyData = JSON.parse(fs.readFileSync(WEEKLY_DATA_FILE, 'utf8'));
		}
		
		if (!savedWeeklyData) {
			// Save if it's Friday after 3:30 PM IST
			if (isFriday && isAfter330PM_IST) {
				console.log('📅 [STARTUP] No WEEKLY data found and it\'s Friday after 3:30 PM IST. Saving now...');
				await autoSaveWeeklyData('startup-check');
			}
			// OR if it's weekend (missed Friday save) - save Friday's data
			else if (isWeekend) {
				console.log('📅 [STARTUP] No WEEKLY data found and it\'s weekend. Saving Friday\'s data now...');
				await autoSaveWeeklyData('startup-check');
			}
			else {
				console.log('⏳ [STARTUP] No WEEKLY data found, but waiting for Friday 3:30 PM IST to save...');
			}
		} else {
			const savedDate = new Date(savedWeeklyData.timestamp);
			const savedDateIST = new Date(savedDate.getTime() + istOffset);
			const todayIST = new Date(now.getTime() + istOffset);
			
			// Check if saved data is from this week (compare week numbers)
			const daysSinceLastSave = Math.floor((now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
			
			// Save if:
			// 1. It's Friday after 3:30 PM IST AND data is >=5 days old (new week - Friday to Friday = 7 days, but check >=5 to be safe)
			// 2. OR it's weekend AND data is >=5 days old (missed Friday save)
			if ((isFriday && isAfter330PM_IST && daysSinceLastSave >= 5) || 
			    (isWeekend && daysSinceLastSave >= 5)) {
				console.log(`📅 [STARTUP] WEEKLY data is old (${daysSinceLastSave} days ago). Saving fresh data for this week...`);
				await autoSaveWeeklyData('startup-refresh');
			} else {
				console.log(`✅ [STARTUP] WEEKLY data is current (saved: ${savedDate.toLocaleString()}, ${daysSinceLastSave} days ago)`);
				if (!isFriday && !isWeekend) {
					console.log(`   ⏰ Next save: Friday 3:30 PM IST`);
				}
			}
		}
	} catch (error) {
		console.error('❌ [STARTUP] Error checking weekly data:', error.message);
	}
	
	console.log('✅ [STARTUP] Data check complete!\n');
}

// Run startup check after a short delay (to let server fully initialize)
setTimeout(checkAndSaveOnStartup, 2000);

// ============ CAMARILLA API ENDPOINTS ============

/**
 * Get saved Camarilla data (weekly or daily)
 * If data is missing, checks if it should auto-save based on current time
 */
app.get('/getCamarillaData', async (req, res) => {
	const timeframe = req.query.timeframe || 'weekly'; // 'daily' or 'weekly'
	
	try {
		let savedData = null;
		
		// Try MongoDB first
		if (db) {
			try {
				const collection = db.collection(COLLECTION_NAME);
				savedData = await collection.findOne({ _id: timeframe });
				
				if (savedData) {
					console.log(`📊 [MONGODB] Serving ${timeframe} Camarilla data (${savedData.data.length} stocks)`);
					return res.json({
						success: true,
						data: savedData.data,
						timestamp: savedData.timestamp,
						timeframe: timeframe,
						savedBy: savedData.savedBy || 'unknown',
						source: 'mongodb'
					});
				}
			} catch (mongoError) {
				console.error('❌ [MONGODB] Read error, trying file system:', mongoError.message);
			}
		}
		
		// Fallback to file system
		const file = timeframe === 'weekly' ? WEEKLY_DATA_FILE : DAILY_DATA_FILE;
		
		// If file doesn't exist, check if we should save it now
		if (!fs.existsSync(file) && !savedData) {
			console.log(`⚠️ No ${timeframe} data found. Checking if we should save now...`);
			
			// Calculate IST time
			const now = new Date();
			const istOffset = 5.5 * 60 * 60 * 1000;
			const istTime = new Date(now.getTime() + istOffset);
			const istHour = istTime.getUTCHours(); // Use UTC methods after adding offset
			const istMinutes = istHour * 60 + istTime.getUTCMinutes();
			const currentDay = istTime.getUTCDay(); // Get IST day of week
			
			const isWeekday = currentDay >= 1 && currentDay <= 5;
			const isFriday = currentDay === 5;
			const isWeekend = currentDay === 0 || currentDay === 6;
			const isAfter330PM_IST = istMinutes >= 930; // After 3:30 PM IST
			const isBeforeMarketOpen_IST = istMinutes < 555; // Before 9:15 AM IST
			
			const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			console.log(`🕐 [API] Current IST: ${dayNames[currentDay]}, ${istHour}:${String(istTime.getUTCMinutes()).padStart(2, '0')}`);
			
			let shouldSave = false;
			
			if (timeframe === 'daily') {
				// IMPORTANT: 
				// - Mon-Fri: Save ONLY after 3:30 PM IST OR before 9:15 AM IST
				// - Sat-Sun: Save ANYTIME (Friday's close already available for Monday's Camarilla)
				if (isWeekend || (isWeekday && (isAfter330PM_IST || isBeforeMarketOpen_IST))) {
					console.log(`💾 [API] Saving DAILY data (${isWeekend ? 'Weekend - anytime OK' : isAfter330PM_IST ? 'After 3:30 PM - market close' : 'Before 9:15 AM - pre-market'})`);
					shouldSave = true;
					await autoSaveDailyData('api-request');
				} else {
					console.log(`⏸️  [API] NOT saving DAILY data: Waiting for 3:30 PM IST market close (need final prices for Camarilla)`);
				}
			} else if (timeframe === 'weekly') {
				// Save weekly data if:
				// 1. Friday after 3:30 PM IST
				// 2. OR weekend (catch up from missed Friday)
				if ((isFriday && isAfter330PM_IST) || isWeekend) {
					console.log(`💾 [API] Saving WEEKLY data (${isWeekend ? 'weekend catchup' : 'Friday after 3:30 PM'})`);
					shouldSave = true;
					await autoSaveWeeklyData('api-request');
				} else {
					console.log(`⏸️  [API] NOT saving WEEKLY data: Waiting for Friday 3:30 PM or weekend`);
				}
			}
			
			// If we saved, try to read from MongoDB or file
			if (shouldSave) {
				if (db) {
					const collection = db.collection(COLLECTION_NAME);
					savedData = await collection.findOne({ _id: timeframe });
				}
				
				if (savedData) {
					console.log(`📊 Serving freshly saved ${timeframe} Camarilla data from MongoDB (${savedData.data.length} stocks)`);
					return res.json({
						success: true,
						data: savedData.data,
						timestamp: savedData.timestamp,
						timeframe: timeframe,
						savedBy: savedData.savedBy || 'api-triggered',
						source: 'mongodb'
					});
				} else if (fs.existsSync(file)) {
					savedData = JSON.parse(fs.readFileSync(file, 'utf8'));
					console.log(`📊 Serving freshly saved ${timeframe} Camarilla data from file (${savedData.data.length} stocks)`);
					return res.json({
						success: true,
						data: savedData.data,
						timestamp: savedData.timestamp,
						timeframe: timeframe,
						savedBy: savedData.savedBy || 'api-triggered',
						source: 'file'
					});
				}
			}
			
			// Still no data - return 404
			return res.status(404).json({
				success: false,
				message: `No ${timeframe} data found. ${timeframe === 'weekly' ? 'Waiting for Friday 3:30 PM IST' : 'Waiting for weekday after 3:30 PM IST'}`,
				timeframe: timeframe
			});
		}
		
		// File exists - serve it
		if (!savedData && fs.existsSync(file)) {
			savedData = JSON.parse(fs.readFileSync(file, 'utf8'));
			console.log(`📊 [FILE] Serving ${timeframe} Camarilla data (${savedData.data.length} stocks)`);
		}
		
		if (savedData) {
			res.json({
				success: true,
				data: savedData.data,
				timestamp: savedData.timestamp,
				timeframe: timeframe,
				savedBy: savedData.savedBy || 'unknown',
				source: 'file'
			});
		} else {
			return res.status(404).json({
				success: false,
				message: `No ${timeframe} data found`,
				timeframe: timeframe
			});
		}
	} catch (error) {
		console.error('Error reading Camarilla data:', error);
		res.status(500).json({
			success: false,
			message: 'Error reading saved data',
			error: error.message
		});
	}
});

/**
 * Manual trigger for saving Camarilla data (for testing/override)
 */
app.post('/saveCamarillaData', async (req, res) => {
	const timeframe = req.body.timeframe || 'weekly';
	
	console.log(`📝 Manual save triggered for ${timeframe} data`);
	
	try {
		if (timeframe === 'weekly') {
			await autoSaveWeeklyData('manual-trigger');
		} else {
			await autoSaveDailyData('manual-trigger');
		}
		
		res.json({
			success: true,
			message: `${timeframe} data saved successfully`,
			timeframe: timeframe
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Error saving data',
			error: error.message
		});
	}
});

// ============ EXISTING ENDPOINTS ============


app.get('/getData', async (req, res) => {
	// res.send('hello...')
	console.log('req.query:', req.query, req.params)
	try {
		let result = await fetchTradingViewData(req.query);
	    res.send(result)
	} catch(err) {
		console.error('fetch error -->',err)
		res.send({})
	}
})

// Get first 5-minute candle data (9:15-9:20 AM)
// NOTE: TradingView's |5 gives current 5-min candle, not historical first candle
// This endpoint should only be called during 9:15-9:20 AM for accurate results
app.get('/getFirst5MinCandle', async (req, res) => {
	console.log('Fetching first 5-min candle data:', req.query);
	
	// Check if current time is within first 5 minutes of trading (9:15-9:20 AM IST)
	const now = new Date();
	const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
	const istTime = new Date(now.getTime() + istOffset);
	const hours = istTime.getUTCHours();
	const minutes = istTime.getUTCMinutes();
	const currentMinutes = hours * 60 + minutes;
	
	// 9:15 AM = 555 minutes, 9:20 AM = 560 minutes
	const isFirstFiveMinutes = currentMinutes >= 555 && currentMinutes <= 560;
	
	if (!isFirstFiveMinutes) {
		// Return warning if not in first 5 minutes
		console.warn('WARNING: Not in first 5 minutes of trading. Data may not reflect first candle.');
	}
	
	try {
		let query = []
		if (req.query && req.query['index']) {
			query = [
				{
					"type": "index",
					"values": [
						`NSE:${req.query['index']}`
					]
				}
			]
		}
		
		var reqObj = {
			'method': 'POST',
			'json': true,
			'url': 'https://scanner.tradingview.com/india/scan',
			'body': {
				"filter": [
					{
						"left": "is_primary",
						"operation": "equal",
						"right": true
					},
					{
						"left": "active_symbol",
						"operation": "equal",
						"right": true
					}
				],
				"options": {
					"lang": "en"
				},
				"markets": [
					"india"
				],
				"symbols": {
					"query": {
						"types": []
					},
					"tickers": [],
					"groups": query
				},
				"columns": [
					"name",
					"open",         // Day's open (9:15 AM open)
					"high",         // Day's high so far
					"low",          // Day's low so far
					"close",        // Current close
					"volume",       // Total volume
					"change",
					"change_from_open",
					"SMA20",
					"SMA50",
					"RSI",
					"VWAP",
					"price_52_week_high",
					"MACD.macd",
					"MACD.signal",
					"industry.tr"
				],
				"sort": {
					"sortBy": "volume",
					"sortOrder": "desc"
				},
				"range": [0, 5000]
			}
		};
		
		let result = await request(reqObj);
		
		// Add metadata about timing
		if (result && result.data) {
			result.metadata = {
				fetchTime: istTime.toISOString(),
				isFirstFiveMinutes: isFirstFiveMinutes,
				note: isFirstFiveMinutes ? 
					'Data captured during first 5 minutes (9:15-9:20 AM)' : 
					'WARNING: Data not from first 5 minutes. Open/High/Low may be from entire day so far.'
			};
		}
		
		res.send(result);
	} catch(err) {
		console.error('fetch first 5-min candle error -->', err)
		res.send({})
	}
})

// News API endpoints
app.get('/news/market', async (req, res) => {
	console.log('Fetching market news');
	try {
		// Sample news data - in production, integrate with NewsAPI.org or other news API
		const sampleNews = {
			status: 'ok',
			totalResults: 4,
			articles: [
				{
					source: { name: 'Economic Times' },
					title: 'Nifty 50 reaches new high amid strong market sentiment',
					description: 'The benchmark Nifty 50 index touched a new record high today as investors showed strong confidence in the Indian market.',
					url: 'https://economictimes.com',
					urlToImage: null,
					publishedAt: new Date().toISOString(),
					content: 'Full article content here...'
				},
				{
					source: { name: 'Business Standard' },
					title: 'IT stocks rally on positive Q4 earnings outlook',
					description: 'Information Technology stocks saw significant gains as major companies reported better-than-expected earnings.',
					url: 'https://business-standard.com',
					urlToImage: null,
					publishedAt: new Date(Date.now() - 3600000).toISOString(),
					content: 'Full article content here...'
				},
				{
					source: { name: 'MoneyControl' },
					title: 'Banking sector shows resilience despite global headwinds',
					description: 'Indian banking stocks continue to perform well despite challenges in the global financial markets.',
					url: 'https://moneycontrol.com',
					urlToImage: null,
					publishedAt: new Date(Date.now() - 7200000).toISOString(),
					content: 'Full article content here...'
				},
				{
					source: { name: 'LiveMint' },
					title: 'FII inflows boost market sentiment',
					description: 'Foreign Institutional Investors continue to pour money into Indian equities, boosting overall market sentiment.',
					url: 'https://livemint.com',
					urlToImage: null,
					publishedAt: new Date(Date.now() - 10800000).toISOString(),
					content: 'Full article content here...'
				}
			]
		};
		
		res.json(sampleNews);
	} catch(err) {
		console.error('News fetch error -->', err);
		res.status(500).json({ status: 'error', message: 'Failed to fetch news' });
	}
});

app.get('/news/stock', async (req, res) => {
	const symbol = req.query.symbol;
	console.log('Fetching news for stock:', symbol);
	try {
		// Sample stock-specific news
		const sampleNews = {
			status: 'ok',
			totalResults: 2,
			articles: [
				{
					source: { name: 'Economic Times' },
					title: `${symbol} reports strong quarterly results`,
					description: `${symbol} has announced better-than-expected quarterly earnings with significant growth in revenue.`,
					url: 'https://economictimes.com',
					urlToImage: null,
					publishedAt: new Date().toISOString(),
					content: 'Full article content here...'
				},
				{
					source: { name: 'MoneyControl' },
					title: `Analysts upgrade ${symbol} target price`,
					description: `Major brokerage firms have upgraded their target price for ${symbol} citing strong fundamentals.`,
					url: 'https://moneycontrol.com',
					urlToImage: null,
					publishedAt: new Date(Date.now() - 3600000).toISOString(),
					content: 'Full article content here...'
				}
			]
		};
		
		res.json(sampleNews);
	} catch(err) {
		console.error('Stock news fetch error -->', err);
		res.status(500).json({ status: 'error', message: 'Failed to fetch stock news' });
	}
});

// NSE India API Integration
app.get('/nse/option-chain/:symbol', async (req, res) => {
	const symbol = req.params.symbol; // NIFTY or BANKNIFTY
	console.log('Fetching option chain for:', symbol);
	try {
		const options = {
			method: 'GET',
			url: `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.5',
				'Accept-Encoding': 'gzip, deflate, br'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('NSE Option Chain error:', err.message);
		res.status(500).json({ error: 'Failed to fetch option chain', message: err.message });
	}
});

app.get('/nse/quote/:symbol', async (req, res) => {
	const symbol = req.params.symbol;
	console.log('Fetching NSE quote for:', symbol);
	try {
		const options = {
			method: 'GET',
			url: `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': '*/*',
				'Accept-Language': 'en-US,en;q=0.5'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('NSE Quote error:', err.message);
		res.status(500).json({ error: 'Failed to fetch quote', message: err.message });
	}
});

app.get('/nse/market-status', async (req, res) => {
	console.log('Fetching market status');
	try {
		const options = {
			method: 'GET',
			url: 'https://www.nseindia.com/api/marketStatus',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': '*/*'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('Market status error:', err.message);
		res.status(500).json({ error: 'Failed to fetch market status', message: err.message });
	}
});

app.get('/nse/gainers', async (req, res) => {
	console.log('Fetching top gainers');
	try {
		const options = {
			method: 'GET',
			url: 'https://www.nseindia.com/api/live-analysis-variations?index=gainers',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': '*/*'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('Gainers error:', err.message);
		res.status(500).json({ error: 'Failed to fetch gainers', message: err.message });
	}
});

app.get('/nse/losers', async (req, res) => {
	console.log('Fetching top losers');
	try {
		const options = {
			method: 'GET',
			url: 'https://www.nseindia.com/api/live-analysis-variations?index=losers',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': '*/*'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('Losers error:', err.message);
		res.status(500).json({ error: 'Failed to fetch losers', message: err.message });
	}
});

// NSE Sector Data API - Optimized for Sector Tracker
app.get('/nse/sectors', async (req, res) => {
	console.log('Fetching all sector data');
	try {
		const sectorIndices = {
			'IT': 'NIFTY%20IT',
			'BANKING': 'NIFTY%20BANK',
			'AUTO': 'NIFTY%20AUTO',
			'PHARMA': 'NIFTY%20PHARMA',
			'FMCG': 'NIFTY%20FMCG',
			'METAL': 'NIFTY%20METAL',
			'REALTY': 'NIFTY%20REALTY',
			'ENERGY': 'NIFTY%20ENERGY',
			'INFRA': 'NIFTY%20INFRASTRUCTURE',
			'FINANCIAL': 'NIFTY%20FINANCIAL%20SERVICES'
		};

		const sectorPromises = Object.entries(sectorIndices).map(async ([sectorKey, indexName]) => {
			try {
				const options = {
					method: 'GET',
					url: `https://www.nseindia.com/api/equity-stockIndices?index=${indexName}`,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
						'Accept': '*/*'
					}
				};
				
				const response = await request(options);
				const data = JSON.parse(response);
				
				// Calculate sector metrics
				const stocks = data.data || [];
				const advancers = stocks.filter(s => s.pChange > 0).length;
				const decliners = stocks.filter(s => s.pChange < 0).length;
				const avgChange = stocks.length > 0 
					? stocks.reduce((sum, s) => sum + (s.pChange || 0), 0) / stocks.length 
					: 0;
				const strength = stocks.length > 0 ? (advancers / stocks.length) * 100 : 50;
				const topStock = stocks.reduce((max, s) => 
					(s.pChange || 0) > (max.pChange || 0) ? s : max
				, stocks[0] || {});

				return {
					name: sectorKey,
					displayName: indexName.replace(/%20/g, ' '),
					avgChange,
					advancers,
					decliners,
					strength,
					totalVolume: stocks.reduce((sum, s) => sum + (s.totalTradedVolume || 0), 0),
					topStock: topStock ? {
						name: topStock.symbol,
						change: topStock.pChange || 0,
						price: topStock.lastPrice || 0
					} : null,
					stocks: stocks.slice(0, 10) // Top 10 stocks per sector
				};
			} catch (err) {
				console.error(`Error fetching ${sectorKey}:`, err.message);
				return {
					name: sectorKey,
					displayName: sectorKey,
					avgChange: 0,
					advancers: 0,
					decliners: 0,
					strength: 50,
					totalVolume: 0,
					topStock: null,
					stocks: []
				};
			}
		});

		const sectors = await Promise.all(sectorPromises);
		res.json({
			status: 'success',
			timestamp: new Date().toISOString(),
			data: sectors.sort((a, b) => b.avgChange - a.avgChange)
		});
	} catch(err) {
		console.error('Sectors API error:', err.message);
		res.status(500).json({ error: 'Failed to fetch sector data', message: err.message });
	}
});

// Individual Sector Data
app.get('/nse/sector/:sector', async (req, res) => {
	const sector = req.params.sector.toUpperCase();
	console.log('Fetching sector:', sector);
	
	const sectorMap = {
		'IT': 'NIFTY%20IT',
		'BANKING': 'NIFTY%20BANK',
		'AUTO': 'NIFTY%20AUTO',
		'PHARMA': 'NIFTY%20PHARMA',
		'FMCG': 'NIFTY%20FMCG',
		'METAL': 'NIFTY%20METAL',
		'REALTY': 'NIFTY%20REALTY',
		'ENERGY': 'NIFTY%20ENERGY',
		'INFRA': 'NIFTY%20INFRASTRUCTURE',
		'FINANCIAL': 'NIFTY%20FINANCIAL%20SERVICES'
	};
	
	const indexName = sectorMap[sector];
	if (!indexName) {
		return res.status(400).json({ error: 'Invalid sector name' });
	}
	
	try {
		const options = {
			method: 'GET',
			url: `https://www.nseindia.com/api/equity-stockIndices?index=${indexName}`,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Accept': '*/*'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('Sector API error:', err.message);
		res.status(500).json({ error: 'Failed to fetch sector data', message: err.message });
	}
});

// Yahoo Finance API Integration
app.get('/yahoo/quote/:symbol', async (req, res) => {
	const symbol = req.params.symbol + '.NS'; // Add .NS for NSE stocks
	console.log('Fetching Yahoo quote for:', symbol);
	try {
		const options = {
			method: 'GET',
			url: `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('Yahoo quote error:', err.message);
		res.status(500).json({ error: 'Failed to fetch Yahoo quote', message: err.message });
	}
});

app.get('/yahoo/historical/:symbol', async (req, res) => {
	const symbol = req.params.symbol + '.NS';
	const period1 = req.query.period1 || Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60); // 1 year ago
	const period2 = req.query.period2 || Math.floor(Date.now() / 1000);
	const interval = req.query.interval || '1d'; // 1d, 1wk, 1mo
	
	console.log('Fetching historical data for:', symbol);
	try {
		const options = {
			method: 'GET',
			url: `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`,
			headers: {
				'User-Agent': 'Mozilla/5.0'
			}
		};
		
		const response = await request(options);
		res.json(JSON.parse(response));
	} catch(err) {
		console.error('Yahoo historical error:', err.message);
		res.status(500).json({ error: 'Failed to fetch historical data', message: err.message });
	}
});

// Enhanced stock scanner endpoint
app.get('/scanner/breakouts', async (req, res) => {
	console.log('Fetching breakout stocks');
	try {
		const reqObj = {
			method: 'POST',
			json: true,
			url: 'https://scanner.tradingview.com/india/scan',
			body: {
				filter: [
					{
						left: "change",
						operation: "greater",
						right: 3 // Stocks up more than 3%
					},
					{
						left: "volume",
						operation: "greater",
						right: 100000 // Minimum volume
					},
					{
						left: "is_primary",
						operation: "equal",
						right: true
					}
				],
				options: { lang: "en" },
				symbols: { query: { types: [] }, tickers: [] },
				columns: ["name", "close", "change", "change_abs", "high", "low", "volume", "Recommend.All"],
				sort: { sortBy: "change", sortOrder: "desc" },
				range: [0, 50]
			}
		};
		
		const response = await request(reqObj);
		res.json(response);
	} catch(err) {
		console.error('Breakouts scanner error:', err.message);
		res.status(500).json({ error: 'Failed to fetch breakouts', message: err.message });
	}
});

app.get('/scanner/volume-spike', async (req, res) => {
	console.log('Fetching volume spike stocks');
	try {
		const reqObj = {
			method: 'POST',
			json: true,
			url: 'https://scanner.tradingview.com/india/scan',
			body: {
				filter: [
					{
						left: "volume",
						operation: "greater",
						right: 500000 // High volume
					},
					{
						left: "is_primary",
						operation: "equal",
						right: true
					}
				],
				options: { lang: "en" },
				symbols: { query: { types: [] }, tickers: [] },
				columns: ["name", "close", "volume", "change", "relative_volume_10d_calc"],
				sort: { sortBy: "relative_volume_10d_calc", sortOrder: "desc" },
				range: [0, 50]
			}
		};
		
		const response = await request(reqObj);
		res.json(response);
	} catch(err) {
		console.error('Volume spike scanner error:', err.message);
		res.status(500).json({ error: 'Failed to fetch volume spikes', message: err.message });
	}
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
	const apiDocs = {
		message: 'Trading App API Documentation',
		version: '2.0',
		endpoints: {
			tradingView: {
				'/getData': 'Get stock data from TradingView (existing)',
				'/getData?index=BANKNIFTY': 'Get Bank Nifty stocks',
				'/getData?nseTop=true': 'Get top NSE stocks'
			},
			nse: {
				'/nse/option-chain/:symbol': 'Get option chain (NIFTY/BANKNIFTY)',
				'/nse/quote/:symbol': 'Get stock quote from NSE',
				'/nse/market-status': 'Get market status',
				'/nse/gainers': 'Get top gainers',
				'/nse/losers': 'Get top losers'
			},
			yahoo: {
				'/yahoo/quote/:symbol': 'Get stock quote from Yahoo Finance',
				'/yahoo/historical/:symbol': 'Get historical data (params: period1, period2, interval)'
			},
			scanner: {
				'/scanner/breakouts': 'Get stocks breaking out (>3% move)',
				'/scanner/volume-spike': 'Get stocks with volume spikes'
			},
			news: {
				'/news/market': 'Get market news',
				'/news/stock?symbol=RELIANCE': 'Get stock-specific news'
			}
		},
		examples: {
			optionChain: 'http://localhost:5001/nse/option-chain/NIFTY',
			quote: 'http://localhost:5001/nse/quote/RELIANCE',
			historical: 'http://localhost:5001/yahoo/historical/TCS?interval=1d',
			breakouts: 'http://localhost:5001/scanner/breakouts'
		}
	};
	
	res.json(apiDocs);
});

app.all('/*', async (req, res) => {
	console.log('url:', req.url.substring(1))
	if (req.url) {
		try {
			var reqObj = {
				uri: req.url.substring(1),
				method: req.method,
				body: req.body,
				json: true
			};

			if (req['headers']) {
				reqObj['headers'] = req.headers
			}
			if(reqObj['url']) {
			console.log('--external payload', reqObj)
			let result = await request(reqObj);
			return res.status(200).json(result)
			} else {
				return res.status(500).json()
			}
		} catch (e) {
			return res.status(e['statusCode']).json(e['error'] ? e['error'] : e)
		}

	}
})

// Start server with MongoDB connection
async function startServer() {
	// Connect to MongoDB
	await connectToMongoDB();
	
	// Start Express server
	app.listen(port, () => {
		console.log(`✅ Server listening on port ${port}`);
		console.log(`🔗 MongoDB: ${db ? 'Connected' : 'Not connected (using file system fallback)'}`);
	});
}

startServer().catch(err => {
	console.error('Failed to start server:', err);
	process.exit(1);
});
 
// Percentage Difference Calculator
// Result: 50

// Difference of 500 and 300 are 50%

// Steps:

// Difference of 500 and 300 =	(|500 - 300|)/((500 + 300)/2)   = 200/400 = 0.5 = 50% 


// 300 is a 40% decrease of 500.

// Steps:

// Percentage of increase =	(|500 – 300|)/500 = 200/500 = 0.4 = 40%
 		// CNX200
		// BANKNIFTY
		// NIFTY
		// CNXAUTO
		// CNXIT
		// NIFTYJR
		// SENSEX
		// CNXMETAL

		
// 		Current price  < 2000 AND
//  ((Return on equity >= 15 AND
// Return on capital employed >=15 AND
// Debt to equity  < 0.2 AND
// (Sales growth >=10 OR
// Sales growth 3Years >=10) AND
// Profit growth >=10 AND
// Pledged percentage =0 AND
//  Price to Earning < Industry PE 
// ) AND
// ((Sales 2quarters back >   Sales 3quarters back AND
// Sales preceding quarter > Sales 2quarters back) OR

// Sales latest quarter > Sales preceding quarter OR

// (Net profit 2quarters back > Net profit 3quarters back AND
// Net Profit preceding quarter > Net profit 2quarters back AND
// Net Profit latest quarter > Net Profit preceding year)))


// 1) return_on_equity >= 15
// 2) debt_to_equity < 0.2

// 3) Price to Earning 20 to 25


// "price_earnings_ttm",(15 to 10)
//         "earnings_per_share_basic_ttm",
//         "basic_eps_net_income",(high)
//         "price_book_ratio",(<1)
//         "Perf.5Y", (postive high)
//         "return_on_equity" (ROE 15 to 20)