const express = require('express');
const request = require('request-promise').defaults({ strictSSL: false });
var cors = require('cors');

var app = express()
app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.port || 5000;
// test1();

async function test1(indexType) {
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
				{
					"left": "exchange",
					"operation": "equal",
					"right": "NSE"
				},
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
				"EMA20",
				"SMA20",
				"SMA50",
				"SMA200",
				"average_volume_10d_calc",
				"average_volume_30d_calc",
				"VWAP",
				"sector"
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

	// var reqObj = {
	// 	uri: 'https://3.129.46.124/dna/intent/api/v1/site?type=building',
	// 	method: 'GET',
	// 	headers:{
	// 		'X-Auth-Token': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDE5YmFmYzFlOGY5MzE3MTY0MzE4ZDAiLCJhdXRoU291cmNlIjoiaW50ZXJuYWwiLCJ0ZW5hbnROYW1lIjoiVE5UMCIsInJvbGVzIjpbIjY0YWZmNzM0ZGMyOWU1MjkyOTkyNjUwMCJdLCJ0ZW5hbnRJZCI6IjYzOWQ4ZDc0ZWE4NTJiMTNkODhiNTYzZCIsImV4cCI6MTcwODYwMDYzMiwiaWF0IjoxNzA4NTk3MDMyLCJqdGkiOiI2OWY2NjhlMi02NWM0LTQyNTUtYjA5Zi1iYTMyYjMyZjM3ZWQiLCJ1c2VybmFtZSI6Im5ldGFkbWluIn0.gyWwVzS5BloEuH_FtkuIMNUL477j-5fqr1rh5qyfVzcfjeqgPax11AoqJ67wLARM-29gzEQ8RW1nYBnkBkSqpiv6rKrfMpXv46UDA4aGYFR62Vs5eOxLpAQh7oF6XzuNxN0L4N8hsC5vxaeoJkth3xI_MD8CArRuCrsOK1yrarNSHmoAEauwvC7ro3kY6ttam7Eul0P9WqDgf6B29SKZowRaN3PbgJfA0G1NiXO0BQmwfR-cYxOE-u8oLJf8qMBjfIgHNr_5v0HvlRyyxkC0PlLw-s5SwiV72k8gUsIbLe90TDqRFjQp18fgrgX7X_ZrDp6llPgb-GktsRNDJNl4ZQ'
	// 	},
	// 	json: true
	// };
	let result = await request(reqObj);
	// "data": [
	// 	{
	// 		"s": "NSE:MARUTI",
	// 		"d": [
	// 			"MARUTI",
	// 			11442.1,
	// 			11333.093122,

	// let filterEMa = result['data'].filter((res) => res['d'][2] > res['d'][1] )
	// let result = []
	// filterEMa.array.forEach(element => {
	// 	let data = (element['d'][2] - element['d'][1])*100%
	// });
	// console.log('-dsadasdas', result.data.length, JSON.stringify(result))
	return result
}
app.get('/getData', async (req, res) => {
	// res.send('hello...')
	console.log('-req.query', req.query, req.params)
	let result = await test1(req.query);
	res.send(result)
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
			console.log('--external payload', reqObj)
			let result = await request(reqObj);
			return res.status(200).json(result)
		} catch (e) {
			return res.status(e['statusCode']).json(e['error'] ? e['error'] : e)
		}

	}
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


// { "filter": [{ "left": "type", "operation": "in_range", "right": ["stock", "dr", "fund"] },
//  { "left": "subtype", "operation": "in_range", "right": ["common", "foreign-issuer", "", "etf", "etf,odd", "etf,otc", "etf,cfd"] }, 
// { "left": "is_primary", "operation": "equal", "right": true }, { "left": "active_symbol", "operation": "equal", "right": true }],
//  "options": { "lang": "en" }, "markets": ["india"], "symbols": { "query": { "types": [] }, "tickers": [] }, 
//  "columns": ["logoid", "name", "premarket_close", "premarket_change", "premarket_gap", "premarket_volume", "close", "change", "volume", "postmarket_close", "postmarket_change", "postmarket_volume", "Recommend.All", "market_cap_basic", "change_from_open", "change_from_open_abs", "description", "type", "subtype", "update_mode", "pricescale", "minmov", "fractional", "minmove2", "currency", "fundamental_currency_code"], 
//  "sort": { "sortBy": "market_cap_basic", "sortOrder": "desc" }, "price_conversion": { "to_symbol": false }, "range": [0, 150] }





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