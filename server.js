const express = require('express');
const request = require('request-promise').defaults({ strictSSL: false });
var cors = require('cors');

var app = express()
app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

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
		reqObj['body']['symbols']['tickers'] = ["NSE:NIFTY", "NSE:BANKNIFTY", "BSE:SENSEX", "NSE:INDIAVIX"]
	}
	
	if (indexType && indexType['nseTop']) {
		reqObj['body']['symbols']['tickers'] = ["NSE:HDFCBANK","NSE:RELIANCE","NSE:ICICIBANK","NSE:INFY","NSE:ITC","NSE:TCS","NSE:LT","NSE:BHARTIARTL","NSE:AXISBANK","NSE:SBIN"] 
	}
	let result = await request(reqObj);
	return result
}
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
app.listen(port, () => console.log(`Example app listening on port... ${port}!`))
 
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