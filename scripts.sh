### 1) orginal grow more
//@version=5
// samba siva grow signal
indicator(title='GrowMore', overlay=true)
src = input(defval=close, title='Source')
per = input.int(defval=100, minval=1, title='Sampling Period')
mult = input.float(defval=3.0, minval=0.1, title='Range Multiplier')
smoothrng(x, t, m) =>
wper = t * 2 - 1
avrng = ta.ema(math.abs(x - x[1]), t)
smoothrng = ta.ema(avrng, wper) * m
smoothrng
smrng = smoothrng(src, per, mult)
rngfilt(x, r) =>
rngfilt = x
rngfilt := x > nz(rngfilt[1]) ? x - r < nz(rngfilt[1]) ? nz(rngfilt[1]) : x - r : x + r > nz(rngfilt[1]) ? nz(rngfilt[1]) : x + r
rngfilt
filt = rngfilt(src, smrng)
upward = 0.0
upward := filt > filt[1] ? nz(upward[1]) + 1 : filt < filt[1] ? 0 : nz(upward[1])
downward = 0.0
downward := filt < filt[1] ? nz(downward[1]) + 1 : filt > filt[1] ? 0 : nz(downward[1])
hband = filt + smrng
lband = filt - smrng
filtcolor = upward > 0 ? color.lime : downward > 0 ? color.red : color.orange
barcolor = src > filt and src > src[1] and upward > 0 ? color.lime : src > filt and src < src[1] and upward > 0 ? color.green : src < filt and src < src[1] and downward > 0 ? color.red : src < filt and src > src[1] and downward > 0 ? color.maroon : color.orange
filtplot = plot(filt, color=filtcolor, linewidth=3, title='Range Filter')
hbandplot = plot(hband, color=color.new(color.aqua, 100), title='High Target')
lbandplot = plot(lband, color=color.new(color.fuchsia, 100), title='Low Target')
fill(hbandplot, filtplot, color=color.new(color.aqua, 90), title='High Target Range')
fill(lbandplot, filtplot, color=color.new(color.fuchsia, 90), title='Low Target Range')
barcolor(barcolor)
longCond = bool(na)
shortCond = bool(na)
longCond := src > filt and src > src[1] and upward > 0 or src > filt and src < src[1] and upward > 0
shortCond := src < filt and src < src[1] and downward > 0 or src < filt and src > src[1] and downward > 0
CondIni = 0
CondIni := longCond ? 1 : shortCond ? -1 : CondIni[1]
longCondition = longCond and CondIni[1] == -1
shortCondition = shortCond and CondIni[1] == 1
plotshape(longCondition, title='Buy Signal', text='Buy', textcolor=color.white, style=shape.labelup, size=size.small,location=location.belowbar, color=color.new(color.green, 0))
plotshape(shortCondition, title='Sell Signal', text='Sell', textcolor=color.white, style=shape.labeldown, size=size.small, location=location.abovebar, color=color.new(color.red, 0))
alertcondition(longCondition, title='Buy Alert', message='BUY')
alertcondition(longCondition, title='Buy Alert', message='BUY')
alertcondition(longCondition, title='Buy Alert', message='BUY')
alertcondition(shortCondition, title='Sell Alert', message='SELL')



### 2) grow more with 200,50,20 ,vwap 

// @version=5
// samba siva grow signal
indicator(title='GrowMore', overlay=true)
// indicator(title='Combined Moving Averages and VWAP', overlay=true)
src = input(defval=close, title='Source')
per = input.int(defval=100, minval=1, title='Sampling Period')
mult = input.float(defval=3.0, minval=0.1, title='Range Multiplier')
smoothrng(x, t, m) =>
    wper = t * 2 - 1
    avrng = ta.ema(math.abs(x - x[1]), t)
    smoothrng = ta.ema(avrng, wper) * m
    smoothrng
smrng = smoothrng(src, per, mult)
rngfilt(x, r) =>
    rngfilt = x
    rngfilt := x > nz(rngfilt[1]) ? x - r < nz(rngfilt[1]) ? nz(rngfilt[1]) : x - r : x + r > nz(rngfilt[1]) ? nz(rngfilt[1]) : x + r
    rngfilt
filt = rngfilt(src, smrng)
upward = 0.0
upward := filt > filt[1] ? nz(upward[1]) + 1 : filt < filt[1] ? 0 : nz(upward[1])
downward = 0.0
downward := filt < filt[1] ? nz(downward[1]) + 1 : filt > filt[1] ? 0 : nz(downward[1])
hband = filt + smrng
lband = filt - smrng
filtcolor = upward > 0 ? color.lime : downward > 0 ? color.red : color.orange
barcolor = src > filt and src > src[1] and upward > 0 ? color.lime : src > filt and src < src[1] and upward > 0 ? color.green : src < filt and src < src[1] and downward > 0 ? color.red : src < filt and src > src[1] and downward > 0 ? color.maroon : color.orange
filtplot = plot(filt, color=filtcolor, linewidth=3, title='Range Filter')
hbandplot = plot(hband, color=color.new(color.aqua, 100), title='High Target')
lbandplot = plot(lband, color=color.new(color.fuchsia, 100), title='Low Target')
fill(hbandplot, filtplot, color=color.new(color.aqua, 90), title='High Target Range')
fill(lbandplot, filtplot, color=color.new(color.fuchsia, 90), title='Low Target Range')
barcolor(barcolor)
longCond = bool(na)
shortCond = bool(na)
longCond := src > filt and src > src[1] and upward > 0 or src > filt and src < src[1] and upward > 0
shortCond := src < filt and src < src[1] and downward > 0 or src < filt and src > src[1] and downward > 0
CondIni = 0
CondIni := longCond ? 1 : shortCond ? -1 : CondIni[1]
longCondition = longCond and CondIni[1] == -1
shortCondition = shortCond and CondIni[1] == 1
plotshape(longCondition, title='Buy Signal', text='Buy', textcolor=color.white, style=shape.labelup, size=size.small,location=location.belowbar, color=color.new(color.green, 0))
plotshape(shortCondition, title='Sell Signal', text='Sell', textcolor=color.white, style=shape.labeldown, size=size.small, location=location.abovebar, color=color.new(color.red, 0))
alertcondition(longCondition, title='Buy Alert', message='BUY')
alertcondition(longCondition, title='Buy Alert', message='BUY')
alertcondition(longCondition, title='Buy Alert', message='BUY')
alertcondition(shortCondition, title='Sell Alert', message='SELL')

// Input Parameters
// Moving Averages
sma200 = ta.sma(src, 200)
sma50 = ta.sma(src, 50)
sma20 = ta.sma(src, 20)

// VWAP (Volume Weighted Average Price)
vwapVal = ta.vwap(hlc3)

// Plotting Moving Averages
plot(sma200, color=color.blue, linewidth=2, title='200 SMA')
plot(sma50, color=color.orange, linewidth=2, title='50 SMA')
plot(sma20, color=color.red, linewidth=2, title='20 SMA')

// Plotting VWAP
plot(vwapVal, color=color.purple, linewidth=2, title='VWAP')

// Determine Buy/Sell Signals
// longCondition = crossover(src, sma20) and crossover(sma20, sma50) and crossover(sma50, sma200) and src > vwapVal
// shortCondition = crossunder(src, sma20) and crossunder(sma20, sma50) and crossunder(sma50, sma200) and src < vwapVal

// Plot Buy/Sell Signals
plotshape(series=longCondition, title='Buy Signal', text='BUY', style=shape.labelup, location=location.belowbar, color=color.green, size=size.small, textcolor=color.white)
plotshape(series=shortCondition, title='Sell Signal', text='SELL', style=shape.labeldown, location=location.abovebar, color=color.red, size=size.small, textcolor=color.white)

// Alerts
alertcondition(condition=longCondition, title='Buy Alert', message='BUY')
alertcondition(condition=shortCondition, title='Sell Alert', message='SELL')




### 3) signal,BB,VWAP,200,50,20 SMA,pivot.camerlla,IB,range table ,candle of doji ,hammer
// @version=5
// samba siva grow signal
indicator(title='Grow More', overlay=true)
// indicator(title='Combined Moving Averages and VWAP', overlay=true)
// src = input(defval=close, title='Source',inline="patterns")
src = close
showSignal = input(false, title='Signal',inline="patterns")
per = input.int(defval=100, minval=1, title='Sampling Period',inline="patterns")
mult = input.float(defval=3.0, minval=0.1, title='Range Multiplier',inline="patterns")
smoothrng(x, t, m) =>
    wper = t * 2 - 1
    avrng = ta.ema(math.abs(x - x[1]), t)
    smoothrng = ta.ema(avrng, wper) * m
    smoothrng
smrng = smoothrng(src, per, mult)
rngfilt(x, r) =>
    rngfilt = x
    rngfilt := x > nz(rngfilt[1]) ? x - r < nz(rngfilt[1]) ? nz(rngfilt[1]) : x - r : x + r > nz(rngfilt[1]) ? nz(rngfilt[1]) : x + r
    rngfilt
filt = rngfilt(src, smrng)
upward = 0.0
upward := filt > filt[1] ? nz(upward[1]) + 1 : filt < filt[1] ? 0 : nz(upward[1])
downward = 0.0
downward := filt < filt[1] ? nz(downward[1]) + 1 : filt > filt[1] ? 0 : nz(downward[1])
hband = filt + smrng
lband = filt - smrng
filtcolor = upward > 0 ? color.lime : downward > 0 ? color.red : color.orange
barcolor = src > filt and src > src[1] and upward > 0 ? color.lime : src > filt and src < src[1] and upward > 0 ? color.green : src < filt and src < src[1] and downward > 0 ? color.red : src < filt and src > src[1] and downward > 0 ? color.maroon : color.orange
filtplot = plot(showSignal? filt:na, color=filtcolor, linewidth=3, title='Range Filter')
hbandplot = plot(showSignal? hband:na, color=color.new(color.aqua, 100), title='High Target')
lbandplot = plot(showSignal?lband:na, color=color.new(color.fuchsia, 100), title='Low Target')
fill(hbandplot, filtplot, color=color.new(color.aqua, 90), title='High Target Range')
fill(lbandplot, filtplot, color=color.new(color.fuchsia, 90), title='Low Target Range')
barcolor(showSignal?barcolor:na)
longCond = bool(na)
shortCond = bool(na)
longCond := src > filt and src > src[1] and upward > 0 or src > filt and src < src[1] and upward > 0
shortCond := src < filt and src < src[1] and downward > 0 or src < filt and src > src[1] and downward > 0
CondIni = 0
CondIni := longCond ? 1 : shortCond ? -1 : CondIni[1]
longCondition = longCond and CondIni[1] == -1
shortCondition = shortCond and CondIni[1] == 1
plotshape(showSignal?longCondition:na, title='Buy Signal', text='B', textcolor=color.white, style=shape.labelup, size=size.tiny,location=location.belowbar, color=color.new(color.green, 0))
plotshape(showSignal?shortCondition:na, title='Sell Signal', text='S', textcolor=color.white, style=shape.labeldown, size=size.tiny, location=location.abovebar, color=color.new(color.red, 0))
// alertcondition(longCondition, title='Buy Alert', message='BUY')
// alertcondition(longCondition, title='Buy Alert', message='BUY')
// alertcondition(longCondition, title='Buy Alert', message='BUY')
// alertcondition(shortCondition, title='Sell Alert', message='SELL')

// flags for showing (BB,SMA's,VWAP,Pivot,Camarilla )
show200SMA = input(false, title='200 SMA',inline="patterns")
show50SMA = input(false, title='50 SMA',inline="patterns")
show20SMA = input(false, title='20 SMA',inline="patterns")
show9SMA = input(false, title='9 SMA',inline="patterns")
showVwap = input(false, title='VWAP',inline="patterns")
dummy = input.bool(true, title="", inline="patterns")
showPivot = input(false, title='Pivots',inline="patterns")
showCamarilla = input(false, title='Camarilla',inline="patterns")
previousHL = input(false, title='PH/PL',inline="patterns")

// Moving Averages
sma200 = ta.sma(src, 200)
sma50 = ta.sma(src, 50)
sma20 = ta.sma(src, 20)
sma9 = ta.sma(src, 9)

// VWAP (Volume Weighted Average Price)
vwapVal = ta.vwap(hlc3)

// Plotting
plot(show200SMA?sma200: na,color=color.orange, linewidth=2, title='200 SMA')
plot(show50SMA?sma50:na, color=color.red, linewidth=2, title='50 SMA')
plot(show50SMA?sma20:na, color=color.green, linewidth=2, title='20 SMA')
plot(show9SMA?sma9:na, color=#e6e200, linewidth=2, title='9 SMA')
plot(showVwap?vwapVal:na, color=#6b6b6c, linewidth=2, title='VWAP')

// Previous Day's High, Low, and Close
highPrev = request.security(syminfo.tickerid, "D", high[1], lookahead=barmerge.lookahead_on)
lowPrev = request.security(syminfo.tickerid, "D", low[1], lookahead=barmerge.lookahead_on)
closePrev = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)

// Calculate Pivot Points
pivot = (highPrev + lowPrev + closePrev) / 3
pivotBC = (highPrev + lowPrev) / 2
pivotTC = pivot + (pivot - pivotBC)

// Threshold to determine if the range is narrow or wide
rangeThreshold = input.float(0.01, title="pivot Range Threshold",inline="patterns")

// Determine if the CPR range is narrow or wide
isNarrow = (pivotTC - pivotBC) < rangeThreshold
rangeType = isNarrow ? "Narrow" : "Wide"

// Create the table if it doesn't exist
var table cprTable = table.new(position.top_right, 2, 5, border_width=1)

// Update the table headers once
if bar_index == 0
    table.cell(cprTable, 0, 0, "Level", bgcolor=color.gray)
    table.cell(cprTable, 1, 0, "Value", bgcolor=color.gray)

// Update the CPR values every new bar
// table.cell(cprTable, 0, 1, "Pivot", bgcolor=color.new(color.blue,0))
// table.cell(cprTable, 1, 1, str.tostring(pivot, format.mintick), bgcolor=color.new(color.blue,0))

// table.cell(cprTable, 0, 2, "BC", bgcolor=color.new(color.green,0))
// table.cell(cprTable, 1, 2, str.tostring(pivotBC, format.mintick), bgcolor=color.new(color.green,0))

// table.cell(cprTable, 0, 3, "TC", bgcolor=color.new(color.red,0))
// table.cell(cprTable, 1, 3, str.tostring(pivotTC, format.mintick), bgcolor=color.new(color.red,0))

table.cell(cprTable, 0, 4, "Range", bgcolor=color.new(color.yellow,0))
table.cell(cprTable, 1, 4, rangeType, bgcolor=color.new(color.yellow,0))

    
r1 = 2 * pivot - lowPrev
s1 = 2 * pivot - highPrev
r2 = pivot + (highPrev - lowPrev)
s2 = pivot - (highPrev - lowPrev)
r3 = highPrev + 2 * (pivot - lowPrev)
s3 = lowPrev -2 * (highPrev - pivot)
 
// Plot Pivot Points
plot(showPivot ? pivot : na, style=plot.style_circles, color=color.blue, title="P")
plot(showPivot ? pivotBC : na, style=plot.style_circles, color=color.blue, title="BC")
plot(showPivot ? pivotTC : na, style=plot.style_circles, color=color.blue, title="TC")
plot(showPivot ? r1 : na, style=plot.style_circles, color=color.red, title="R1")
plot(showPivot ? r2 : na, style=plot.style_circles, color=color.red, title="R2")
plot(showPivot ? r3 : na, style=plot.style_circles, color=color.red, title="R3")
plot(showPivot ? s1 : na, style=plot.style_circles, color=color.green, title="S1")
plot(showPivot ? s2 : na, style=plot.style_circles, color=color.green, title="S2")
plot(showPivot ? s3 : na, style=plot.style_circles, color=color.green, title="S3")
// plotshape(showPivot?r1:na, title='R1', text='R1', textcolor=color.white, style=shape.labelup, size=size.tiny,location=location, color=color.new(color.green, 0))
 

// Plot PH and PL
plot(previousHL?highPrev:na, style=plot.style_circles,color=color.yellow, title='PH',linewidth = 2)
plot(previousHL?lowPrev:na, style=plot.style_circles,color=color.aqua, title='PL',linewidth = 2)


// Calculate Camarilla Pivot Points// Calculate Camarilla Pivot Points
previousDayHigh = request.security(syminfo.tickerid, 'D', high[1], lookahead=barmerge.lookahead_on)
previousDayLow = request.security(syminfo.tickerid, 'D', low[1], lookahead=barmerge.lookahead_on)
previousDayClose = request.security(syminfo.tickerid, 'D', close[1], lookahead=barmerge.lookahead_on)

H = previousDayHigh
L = previousDayLow
C = previousDayClose

PP = (H + L + C) / 3.0
H1 = C + (H - L) * 1.1 / 12.0
H2 = C + (H - L) * 1.1 / 6.0
H3 = C + (H - L) * 1.1 / 4.0
H4 = C + (H - L) * 1.1 / 2.0
H5 = H / L * C  // Corrected formula for R5
H6 = C + (H - L) * 1.1 / 1.0  // Additional level R5

L1 = C - (H - L) * 1.1 / 12.0
L2 = C - (H - L) * 1.1 / 6.0
L3 = C - (H - L) * 1.1 / 4.0
L4 = C - (H - L) * 1.1 / 2.0
L5 = L / H * C  // Corrected formula for L5
L6 = C - (H - L) * 1.1 / 1.0  // Additional level L5

mid = (H3 + L3) / 2
// Plot Camarilla Pivot Points
plot(showCamarilla?PP: na,style=plot.style_circles, color=color.white, title='PP')

// plot(showCamarilla?H1: na,style=plot.style_circles, color=color.red, title='H1')
// plot(showCamarilla?H2: na,style=plot.style_circles, color=color.red, title='H2')
plot(showCamarilla?H3: na,style=plot.style_circles, color=color.red, title='H3')
plot(showCamarilla?H4: na,style=plot.style_circles, color=color.red, title='H4')
plot(showCamarilla?H5: na,style=plot.style_circles, color=color.red, title='H5')  // Plot R5
plot(showCamarilla?H6: na,style=plot.style_circles, color=color.orange, title='H6')  // Plot R6 extra formula for R5 only from openAI

plot(showCamarilla?mid: na,style=plot.style_circles, color=color.purple, title='SL',linewidth = 1) // mid range of H3 and L3 act lik SL

// plot(showCamarilla?L1: na,style=plot.style_circles, color=color.green, title='L1')
// plot(showCamarilla?L2: na,style=plot.style_circles, color=color.green, title='L2')
plot(showCamarilla?L3: na,style=plot.style_circles, color=color.green, title='L3')
plot(showCamarilla?L4: na,style=plot.style_circles, color=color.green, title='L4')
plot(showCamarilla?L5: na,style=plot.style_circles, color=color.green, title='L5')  // Plot L5
plot(showCamarilla?L6: na,style=plot.style_circles, color=color.orange, title='L6')  // Plot L6 extra formula for L5 only from openAI

// Function to create labels next to the lines
createLabel(price, a) =>
    label.new(x=bar_index, y=price, text=a, color=#ffffff00, textcolor=color.gray, style=label.style_label_left, size=size.small, textalign=text.align_left)


// Remove previous labels
var label pivotLabel = na
var label bcLabel = na
var label tcLabel = na
var label sma200Label = na
var label camP = na
var label camH3 = na
var label camH4 = na
var label camH5 = na
var label camH6 = na
var label camL3 = na
var label camL4 = na
var label camL5 = na
var label camL6 = na
var label cammid = na
plot(showCamarilla?PP: na,style=plot.style_circles, color=color.white, title='PP')

// plot(showCamarilla?H1: na,style=plot.style_circles, color=color.red, title='H1')
// plot(showCamarilla?H2: na,style=plot.style_circles, color=color.red, title='H2')
plot(showCamarilla?H3: na,style=plot.style_circles, color=color.red, title='H3')
plot(showCamarilla?H4: na,style=plot.style_circles, color=color.red, title='H4')
plot(showCamarilla?H5: na,style=plot.style_circles, color=color.red, title='H5')  // Plot R5
plot(showCamarilla?H6: na,style=plot.style_circles, color=color.orange, title='H6')  // Plot R6 extra formula for R5 only from openAI

plot(showCamarilla?mid: na,style=plot.style_circles, color=color.purple, title='SL',linewidth = 1) // mid range of H3 and L3 act lik SL

// plot(showCamarilla?L1: na,style=plot.style_circles, color=color.green, title='L1')
// plot(showCamarilla?L2: na,style=plot.style_circles, color=color.green, title='L2')
plot(showCamarilla?L3: na,style=plot.style_circles, color=color.green, title='L3')
plot(showCamarilla?L4: na,style=plot.style_circles, color=color.green, title='L4')
plot(showCamarilla?L5: na,style=plot.style_circles, color=color.green, title='L5')  // Plot L5
plot(showCamarilla?L6: na,style=plot.style_circles, color=color.orange, title='L6')  // Plot L6 extra formula for L5 only from openAI

if (not na(pivotLabel))
    label.delete(pivotLabel)
if (not na(bcLabel))
    label.delete(bcLabel)
if (not na(tcLabel))
    label.delete(tcLabel)
if (not na(sma200Label))
    label.delete(sma200Label)
if (not na(camP))
    label.delete(camP)
if (not na(camH3))
    label.delete(camH3)
if (not na(camH4))
    label.delete(camH4)
if (not na(camH5))
    label.delete(camH5)
if (not na(camH6))
    label.delete(camH6)
if (not na(camL3))
    label.delete(camL3)
if (not na(camL4))
    label.delete(camL4)
if (not na(camL5))
    label.delete(camL5)
if (not na(camL6))
    label.delete(camL6)
if (not na(cammid))
    label.delete(cammid)

// Create new labels
pivotLabel := createLabel(showPivot?pivot:na, "P")
bcLabel := createLabel(showPivot?pivotBC:na, "BC")
tcLabel := createLabel(showPivot?pivotTC:na, "TC")
sma200Label := createLabel(show200SMA?sma200:na, "200SMA")
camP := createLabel(showCamarilla?PP:na, "CP")
camH3 := createLabel(showCamarilla?H3:na, "H3")
camH4 := createLabel(showCamarilla?H4:na, "H4")
camH5 := createLabel(showCamarilla?H5:na, "H5")
camH6 := createLabel(showCamarilla?H6:na, "H6")
camL3 := createLabel(showCamarilla?L3:na, "L3")
camL4:= createLabel(showCamarilla?L4:na, "L4")
camL5:= createLabel(showCamarilla?L5:na, "L5")
camL6:= createLabel(showCamarilla?L6:na, "L6")
cammid:= createLabel(showCamarilla?mid:na, "SL")

// // Function to check for Hammer
// isHammer(open, high, low, close) =>
//     bodySize = math.abs(close - open)
//     upperShadow = high - math.max(open, close)
//     lowerShadow = math.min(open, close) - low
//     isBullishHammer = bodySize < lowerShadow and upperShadow < bodySize and (close > open)
//     isBearishHammer = bodySize < lowerShadow and upperShadow < bodySize and (close < open)
//     [isBullishHammer, isBearishHammer]
showBB = input(false, title='BB',inline="patterns")

// Bollinger Bands (BB) Parameters
length = 20
mult1 = 2.0

// Calculate Bollinger Bands
basis = ta.sma(src, length)
dev = mult1 * ta.stdev(src, length)
upperBB = basis + dev
lowerBB = basis - dev

// Plot Bollinger Bands if showBB is true
plot(showBB? basis:na, color=#2962FF,title="Basis")
plot(showBB? upperBB: na, color=color.red, title='Upper BB')
plot(showBB? lowerBB: na, color=color.green, title='Lower BB')


showDoji = input.bool(false, title="Doji",inline="patterns")
showHammer = input.bool(false, title="Hammer",inline="patterns")

// Function to check for Doji
isDoji(open, high, low, close) =>
    bodySize = math.abs(close - open)
    upperShadow = high - math.max(open, close)
    lowerShadow = math.min(open, close) - low
    totalRange = high - low
    isDoji = (bodySize / totalRange) < 0.1 and upperShadow > bodySize and lowerShadow > bodySize
    isDoji

// Function to check for Hammer
isHammer(open, high, low, close) =>
    bodySize = math.abs(close - open)
    upperShadow = high - math.max(open, close)
    lowerShadow = math.min(open, close) - low
    totalRange = high - low
    isBullishHammer = lowerShadow > 2 * bodySize and upperShadow < bodySize and (close > open) and (bodySize / totalRange < 0.3)
    isBearishHammer = lowerShadow > 2 * bodySize and upperShadow < bodySize and (close < open) and (bodySize / totalRange < 0.3)
    [isBullishHammer, isBearishHammer]


// Identify Doji and Hammers
doji = isDoji(open, high, low, close)
[bullishHammer, bearishHammer] = isHammer(open, high, low, close)

// Plot Doji
plotshape(showDoji? doji: na, location=location.abovebar, color=color.yellow, style=shape.labeldown, text="D")

// Plot Bullish Hammer
plotshape(showHammer?bullishHammer:na, location=location.belowbar, color=color.rgb(70, 215, 75), style=shape.labelup, text="H")

// Plot Bearish Hammer
plotshape(showHammer?bearishHammer:na, location=location.abovebar, color=color.rgb(230, 51, 51), style=shape.labeldown, text="H")

   
  
  ### 4) signal,BB,VWAP,200,50,20 SMA,pivot.camerlla,IB,range table ,candle of doji ,hammer,fair value
// @version=5
// samba siva grow signal
indicator(title='Grow More', overlay=true)
src = close
showSignal = input(false, title='Signal',inline="patterns")
per = input.int(defval=100, minval=1, title='Sampling Period',inline="patterns")
mult = input.float(defval=3.0, minval=0.1, title='Range Multiplier',inline="patterns")
smoothrng(x, t, m) =>
    wper = t * 2 - 1
    avrng = ta.ema(math.abs(x - x[1]), t)
    smoothrng = ta.ema(avrng, wper) * m
    smoothrng
smrng = smoothrng(src, per, mult)
rngfilt(x, r) =>
    rngfilt = x
    rngfilt := x > nz(rngfilt[1]) ? x - r < nz(rngfilt[1]) ? nz(rngfilt[1]) : x - r : x + r > nz(rngfilt[1]) ? nz(rngfilt[1]) : x + r
    rngfilt
filt = rngfilt(src, smrng)
upward = 0.0
upward := filt > filt[1] ? nz(upward[1]) + 1 : filt < filt[1] ? 0 : nz(upward[1])
downward = 0.0
downward := filt < filt[1] ? nz(downward[1]) + 1 : filt > filt[1] ? 0 : nz(downward[1])
hband = filt + smrng
lband = filt - smrng
filtcolor = upward > 0 ? color.lime : downward > 0 ? color.red : color.orange
barcolor = src > filt and src > src[1] and upward > 0 ? color.lime : src > filt and src < src[1] and upward > 0 ? color.green : src < filt and src < src[1] and downward > 0 ? color.red : src < filt and src > src[1] and downward > 0 ? color.maroon : color.orange
filtplot = plot(showSignal? filt:na, color=filtcolor, linewidth=3, title='Range Filter')
hbandplot = plot(showSignal? hband:na, color=color.new(color.aqua, 100), title='High Target')
lbandplot = plot(showSignal?lband:na, color=color.new(color.fuchsia, 100), title='Low Target')
fill(hbandplot, filtplot, color=color.new(color.aqua, 90), title='High Target Range')
fill(lbandplot, filtplot, color=color.new(color.fuchsia, 90), title='Low Target Range')
barcolor(showSignal?barcolor:na)
longCond = bool(na)
shortCond = bool(na)
longCond := src > filt and src > src[1] and upward > 0 or src > filt and src < src[1] and upward > 0
shortCond := src < filt and src < src[1] and downward > 0 or src < filt and src > src[1] and downward > 0
CondIni = 0
CondIni := longCond ? 1 : shortCond ? -1 : CondIni[1]
longCondition = longCond and CondIni[1] == -1
shortCondition = shortCond and CondIni[1] == 1
plotshape(showSignal?longCondition:na, title='Buy Signal', text='B', textcolor=color.white, style=shape.labelup, size=size.tiny,location=location.belowbar, color=color.new(color.green, 0))
plotshape(showSignal?shortCondition:na, title='Sell Signal', text='S', textcolor=color.white, style=shape.labeldown, size=size.tiny, location=location.abovebar, color=color.new(color.red, 0))
// alertcondition(longCondition, title='Buy Alert', message='BUY')
// alertcondition(longCondition, title='Buy Alert', message='BUY')
// alertcondition(longCondition, title='Buy Alert', message='BUY')
// alertcondition(shortCondition, title='Sell Alert', message='SELL')

// flags for showing (BB,SMA's,VWAP,Pivot,Camarilla )
show200SMA = input(false, title='200 SMA',inline="patterns")
show50SMA = input(false, title='50 SMA',inline="patterns")
show20SMA = input(false, title='20 SMA',inline="patterns")
show9SMA = input(false, title='9 SMA',inline="patterns")
showVwap = input(false, title='VWAP',inline="patterns")
dummy = input.bool(true, title="", inline="patterns")
showPivot = input(false, title='Pivots',inline="patterns")
showCamarilla = input(false, title='Camarilla',inline="patterns")
previousHL = input(false, title='PH/PL',inline="patterns")

// Moving Averages
sma200 = ta.sma(src, 200)
sma50 = ta.sma(src, 50)
sma20 = ta.sma(src, 20)
sma9 = ta.sma(src, 9)

// VWAP (Volume Weighted Average Price)
vwapVal = ta.vwap(hlc3)

// Plotting
plot(show200SMA?sma200: na,color=color.orange, linewidth=2, title='200 SMA')
plot(show50SMA?sma50:na, color=color.red, linewidth=2, title='50 SMA')
plot(show50SMA?sma20:na, color=color.green, linewidth=2, title='20 SMA')
plot(show9SMA?sma9:na, color=#e6e200, linewidth=2, title='9 SMA')
plot(showVwap?vwapVal:na, color=#6b6b6c, linewidth=2, title='VWAP')

// Previous Day's High, Low, and Close
highPrev = request.security(syminfo.tickerid, "D", high[1], lookahead=barmerge.lookahead_on)
lowPrev = request.security(syminfo.tickerid, "D", low[1], lookahead=barmerge.lookahead_on)
closePrev = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)

// Calculate Pivot Points
pivot = (highPrev + lowPrev + closePrev) / 3
pivotBC = (highPrev + lowPrev) / 2
pivotTC = pivot + (pivot - pivotBC)

// Threshold to determine if the range is narrow or wide
// rangeThreshold = input.float(0.01, title="pivot Range Threshold",inline="patterns")

// Determine if the CPR range is narrow or wide
// isNarrow = (pivotTC - pivotBC) < rangeThreshold
isNarrowByPrevious_close = (math.abs(pivotTC - pivotBC)/closePrev*100) < 0.25
// rangeType = isNarrow ? "Narrow" : "Wide"
rangeTypeByPivot = isNarrowByPrevious_close ? "Narrow" : "Wide"
// ABS(TC-BC)/PC*100)<0.25
// Create the table if it doesn't exist
var table cprTable = table.new(position.top_right, 2, 5, border_width=1)

// Update the table headers once
if bar_index == 0
    table.cell(cprTable, 0, 0, "Level", bgcolor=color.gray)
    table.cell(cprTable, 1, 0, "Value", bgcolor=color.gray) 

// table.cell(cprTable, 0, 4, "Range", bgcolor=color.new(color.yellow,0))
// table.cell(cprTable, 1, 4, rangeType, bgcolor=color.new(color.yellow,0))
table.cell(cprTable, 0, 3, "Range PC", bgcolor=color.new(color.yellow,0))
table.cell(cprTable, 1, 3, rangeTypeByPivot, bgcolor=color.new(color.yellow,0))

    
r1 = 2 * pivot - lowPrev
s1 = 2 * pivot - highPrev
r2 = pivot + (highPrev - lowPrev)
s2 = pivot - (highPrev - lowPrev)
r3 = highPrev + 2 * (pivot - lowPrev)
s3 = lowPrev -2 * (highPrev - pivot)
 
// Plot Pivot Points
plot(showPivot ? pivot : na, style=plot.style_circles, color=color.blue, title="P")
plot(showPivot ? pivotBC : na, style=plot.style_circles, color=color.blue, title="BC")
plot(showPivot ? pivotTC : na, style=plot.style_circles, color=color.blue, title="TC")
plot(showPivot ? r1 : na, style=plot.style_circles, color=color.red, title="R1")
plot(showPivot ? r2 : na, style=plot.style_circles, color=color.red, title="R2")
plot(showPivot ? r3 : na, style=plot.style_circles, color=color.red, title="R3")
plot(showPivot ? s1 : na, style=plot.style_circles, color=color.green, title="S1")
plot(showPivot ? s2 : na, style=plot.style_circles, color=color.green, title="S2")
plot(showPivot ? s3 : na, style=plot.style_circles, color=color.green, title="S3")
// plotshape(showPivot?r1:na, title='R1', text='R1', textcolor=color.white, style=shape.labelup, size=size.tiny,location=location, color=color.new(color.green, 0))
 

// Plot PH and PL
plot(previousHL?highPrev:na, style=plot.style_circles,color=color.yellow, title='PH',linewidth = 2)
plot(previousHL?lowPrev:na, style=plot.style_circles,color=color.aqua, title='PL',linewidth = 2)


// Calculate Camarilla Pivot Points// Calculate Camarilla Pivot Points
previousDayHigh = request.security(syminfo.tickerid, 'D', high[1], lookahead=barmerge.lookahead_on)
previousDayLow = request.security(syminfo.tickerid, 'D', low[1], lookahead=barmerge.lookahead_on)
previousDayClose = request.security(syminfo.tickerid, 'D', close[1], lookahead=barmerge.lookahead_on)

H = previousDayHigh
L = previousDayLow
C = previousDayClose

PP = (H + L + C) / 3.0
H1 = C + (H - L) * 1.1 / 12.0
H2 = C + (H - L) * 1.1 / 6.0
H3 = C + (H - L) * 1.1 / 4.0
H4 = C + (H - L) * 1.1 / 2.0
H5 = H / L * C  // Corrected formula for R5
H6 = C + (H - L) * 1.1 / 1.0  // Additional level R5

L1 = C - (H - L) * 1.1 / 12.0
L2 = C - (H - L) * 1.1 / 6.0
L3 = C - (H - L) * 1.1 / 4.0
L4 = C - (H - L) * 1.1 / 2.0
L5 = L / H * C  // Corrected formula for L5
L6 = C - (H - L) * 1.1 / 1.0  // Additional level L5

mid = (H3 + L3) / 2
// Plot Camarilla Pivot Points 
// Function to create labels next to the lines
createLabel(price, a) =>
    label.new(x=bar_index, y=price, text=a, color=#ffffff00, textcolor=color.white, style=label.style_label_left, size=size.normal, textalign=text.align_left)


// Remove previous labels
var label pivotLabel = na
var label bcLabel = na
var label tcLabel = na
var label sma200Label = na
var label sma20Label = na
var label sma50Label = na
var label camP = na
var label camH3 = na
var label camH4 = na
var label camH5 = na
var label camH6 = na
var label camL3 = na
var label camL4 = na
var label camL5 = na
var label camL6 = na
var label cammid = na
plot(showCamarilla?PP: na,style=plot.style_circles, color=color.white, title='PP')
// plot(showCamarilla?H1: na,style=plot.style_circles, color=color.red, title='H1')
// plot(showCamarilla?H2: na,style=plot.style_circles, color=color.red, title='H2')
plot(showCamarilla?H3: na,style=plot.style_circles, color=color.red, title='H3')
plot(showCamarilla?H4: na,style=plot.style_circles, color=color.red, title='H4')
plot(showCamarilla?H5: na,style=plot.style_circles, color=color.red, title='H5')  // Plot R5
plot(showCamarilla?H6: na,style=plot.style_circles, color=color.orange, title='H6')  // Plot R6 extra formula for R5 only from openAI

plot(showCamarilla?mid: na,style=plot.style_circles, color=color.purple, title='SL',linewidth = 1) // mid range of H3 and L3 act lik SL

// plot(showCamarilla?L1: na,style=plot.style_circles, color=color.green, title='L1')
// plot(showCamarilla?L2: na,style=plot.style_circles, color=color.green, title='L2')
plot(showCamarilla?L3: na,style=plot.style_circles, color=color.green, title='L3')
plot(showCamarilla?L4: na,style=plot.style_circles, color=color.green, title='L4')
plot(showCamarilla?L5: na,style=plot.style_circles, color=color.green, title='L5')  // Plot L5
plot(showCamarilla?L6: na,style=plot.style_circles, color=color.orange, title='L6')  // Plot L6 extra formula for L5 only from openAI

if (not na(pivotLabel))
    label.delete(pivotLabel)
if (not na(bcLabel))
    label.delete(bcLabel)
if (not na(tcLabel))
    label.delete(tcLabel)
if (not na(sma200Label))
    label.delete(sma200Label)
if (not na(sma50Label))
    label.delete(sma50Label)
if (not na(sma20Label))
    label.delete(sma20Label)
if (not na(camP))
    label.delete(camP)
if (not na(camH3))
    label.delete(camH3)
if (not na(camH4))
    label.delete(camH4)
if (not na(camH5))
    label.delete(camH5)
if (not na(camH6))
    label.delete(camH6)
if (not na(camL3))
    label.delete(camL3)
if (not na(camL4))
    label.delete(camL4)
if (not na(camL5))
    label.delete(camL5)
if (not na(camL6))
    label.delete(camL6)
if (not na(cammid))
    label.delete(cammid)

// Create new labels
pivotLabel := createLabel(showPivot?pivot:na, "P")
bcLabel := createLabel(showPivot?pivotBC:na, "BC")
tcLabel := createLabel(showPivot?pivotTC:na, "TC")
sma200Label := createLabel(show200SMA?sma200:na, "200 SMA")
sma50Label := createLabel(show50SMA?sma50:na, "50 SMA")
sma20Label := createLabel(show20SMA?sma20:na, "20 SMA")
camP := createLabel(showCamarilla?PP:na, "CP")
camH3 := createLabel(showCamarilla?H3:na, "H3 Entry")
camH4 := createLabel(showCamarilla?H4:na, "H4 T1")
camH5 := createLabel(showCamarilla?H5:na, "H5 T2")
camH6 := createLabel(showCamarilla?H6:na, "H6")
camL3 := createLabel(showCamarilla?L3:na, "L3 Entry")
camL4:= createLabel(showCamarilla?L4:na, "L4 T1")
camL5:= createLabel(showCamarilla?L5:na, "L5 T2")
camL6:= createLabel(showCamarilla?L6:na, "L6")
cammid:= createLabel(showCamarilla?mid:na, "SL")

showBB = input(false, title='BB',inline="patterns")

// Bollinger Bands (BB) Parameters
length = 20
mult1 = 2.0

// Calculate Bollinger Bands
basis = ta.sma(src, length)
dev = mult1 * ta.stdev(src, length)
upperBB = basis + dev
lowerBB = basis - dev

// Plot Bollinger Bands if showBB is true
plot(showBB? basis:na, color=#2962FF,title="Basis")
plot(showBB? upperBB: na, color=color.red, title='Upper BB')
plot(showBB? lowerBB: na, color=color.green, title='Lower BB')


showDoji = input.bool(false, title="Doji",inline="patterns")
showHammer = input.bool(false, title="Hammer",inline="patterns")

// Function to check for Doji
isDoji(open, high, low, close) =>
    bodySize = math.abs(close - open)
    upperShadow = high - math.max(open, close)
    lowerShadow = math.min(open, close) - low
    totalRange = high - low
    isDoji = (bodySize / totalRange) < 0.1 and upperShadow > bodySize and lowerShadow > bodySize
    isDoji

// Function to check for Hammer
isHammer(open, high, low, close) =>
    bodySize = math.abs(close - open)
    upperShadow = high - math.max(open, close)
    lowerShadow = math.min(open, close) - low
    totalRange = high - low
    isBullishHammer = (bodySize < lowerShadow and upperShadow < bodySize and (close > open)) or (lowerShadow > 2 * bodySize and upperShadow < bodySize and (close > open) and (bodySize / totalRange < 0.3))
    isBearishHammer = (bodySize < lowerShadow and upperShadow < bodySize and (close < open)) or (lowerShadow > 2 * bodySize and upperShadow < bodySize and (close < open) and (bodySize / totalRange < 0.3))
    [isBullishHammer, isBearishHammer]


// Identify Doji and Hammers
doji = isDoji(open, high, low, close)
[bullishHammer, bearishHammer] = isHammer(open, high, low, close)

// Plot Doji
plotshape(showDoji? doji: na, location=location.abovebar, color=color.yellow, style=shape.labeldown, text="D")

// Plot Bullish Hammer
plotshape(showHammer?bullishHammer:na, location=location.belowbar, color=color.rgb(70, 215, 75), style=shape.labelup, text="H")

// Plot Bearish Hammer
plotshape(showHammer?bearishHammer:na, location=location.abovebar, color=color.rgb(230, 51, 51), style=shape.labeldown, text="H")


 // fair value 
 
// thresholdPer = 0.5
thresholdPer = input.float(0, "Threshold %", minval=0, maxval=100, step=0.1, inline='extend', group='FAIRVALUE')
tf = input.timeframe('', "Timeframe", inline='extend', group='FAIRVALUE')
showFairValue = input(false, "fairvalue", inline='extend', group='FAIRVALUE')
extend = input.int(20, 'Extend', minval=0, inline='extend', group='FAIRVALUE') 

//-----------------------------------------------------------------------------
// Detection Function
//-----------------------------------------------------------------------------
detect() =>
    var float threshold =  thresholdPer / 100
    bull_fvg = low > high[2] and close[1] > high[2] and (low - high[2]) / high[2] > threshold
    bear_fvg = high < low[2] and close[1] < low[2] and (low[2] - high) / high > threshold
    
    [bull_fvg, bear_fvg, low, high[2], low[2], high]

[bull_fvg, bear_fvg, bull_min, bull_max, bear_min, bear_max] = request.security(syminfo.tickerid, tf, detect())

if bull_fvg and showFairValue
    linefill.new(line.new(bar_index-2, bull_max, bar_index+extend, bull_max,color=#0899816e), line.new(bar_index-2, bull_min, bar_index+extend, bull_min,color=#0899816e), color=#0899812d)

if bear_fvg and showFairValue
    linefill.new(line.new(bar_index-2, bear_max, bar_index+extend, bear_max,color=#f2364667), line.new(bar_index-2, bear_min, bar_index+extend, bear_min,color=#f2364667), color=#f236461a)



// // Function to detect inside bars
// isInsideBar = (high < high[1] and low > low[1])

// // Plotting inside bars with different colors for bullish and bearish inside bars
// bullishInsideBar = isInsideBar and close > open
// bearishInsideBar = isInsideBar and close < open

// plotshape(series=bullishInsideBar, location=location.belowbar, color=color.green, style=shape.triangleup, title="Bullish Inside Bar")
// plotshape(series=bearishInsideBar, location=location.abovebar, color=color.red, style=shape.triangledown, title="Bearish Inside Bar")

// // Highlight inside bars on the chart
// // bgcolor(isInsideBar ? color.new(color.yellow, 90) : na)






-__________**********_________latest by 4th Oct 2024**********



// @version=5
// samba siva grow signal
indicator(title='Grow More', overlay=true)
src = close
showSignal = input(false, title='Signal',inline="patterns")
per = input.int(defval=100, minval=1, title='Sampling Period',inline="patterns")
mult = input.float(defval=3.0, minval=0.1, title='Range Multiplier',inline="patterns")
smoothrng(x, t, m) =>
    wper = t * 2 - 1
    avrng = ta.ema(math.abs(x - x[1]), t)
    smoothrng = ta.ema(avrng, wper) * m
    smoothrng
smrng = smoothrng(src, per, mult)
rngfilt(x, r) =>
    rngfilt = x
    rngfilt := x > nz(rngfilt[1]) ? x - r < nz(rngfilt[1]) ? nz(rngfilt[1]) : x - r : x + r > nz(rngfilt[1]) ? nz(rngfilt[1]) : x + r
    rngfilt
filt = rngfilt(src, smrng)
upward = 0.0
upward := filt > filt[1] ? nz(upward[1]) + 1 : filt < filt[1] ? 0 : nz(upward[1])
downward = 0.0
downward := filt < filt[1] ? nz(downward[1]) + 1 : filt > filt[1] ? 0 : nz(downward[1])
hband = filt + smrng
lband = filt - smrng
// filtcolor = upward > 0 ? color.lime : downward > 0 ? color.red : color.orange
// barcolor = src > filt and src > src[1] and upward > 0 ? color.lime : src > filt and src < src[1] and upward > 0 ? color.green : src < filt and src < src[1] and downward > 0 ? color.red : src < filt and src > src[1] and downward > 0 ? color.maroon : color.orange
// filtplot = plot(showSignal? filt:na, color=filtcolor, linewidth=3, title='Range Filter')
// hbandplot = plot(showSignal? hband:na, color=color.new(color.aqua, 100), title='High Target')
// lbandplot = plot(showSignal?lband:na, color=color.new(color.fuchsia, 100), title='Low Target')
// fill(hbandplot, filtplot, color=color.new(color.aqua, 90), title='High Target Range')
// fill(lbandplot, filtplot, color=color.new(color.fuchsia, 90), title='Low Target Range')
// barcolor(showSignal?barcolor:na)
longCond = bool(na)
shortCond = bool(na)
longCond := src > filt and src > src[1] and upward > 0 or src > filt and src < src[1] and upward > 0
shortCond := src < filt and src < src[1] and downward > 0 or src < filt and src > src[1] and downward > 0
CondIni = 0
CondIni := longCond ? 1 : shortCond ? -1 : CondIni[1]
longCondition = longCond and CondIni[1] == -1
shortCondition = shortCond and CondIni[1] == 1
plotshape(showSignal?longCondition:na, title='Buy Signal', text='B', textcolor=color.white, style=shape.labelup, size=size.tiny,location=location.belowbar, color=color.new(color.green, 0))
plotshape(showSignal?shortCondition:na, title='Sell Signal', text='S', textcolor=color.white, style=shape.labeldown, size=size.tiny, location=location.abovebar, color=color.new(color.red, 0))

// flags for showing (BB,SMA's,VWAP,Pivot,Camarilla )
show200SMA = input(false, title='200 SMA',inline="patterns")
show50SMA = input(false, title='50 SMA',inline="patterns")
show20SMA = input(false, title='20 SMA',inline="patterns")
show9SMA = input(false, title='9 SMA',inline="patterns")
showVwap = input(false, title='VWAP',inline="patterns")
dummy = input.bool(true, title="", inline="patterns")
showPivot = input(false, title='Pivots',inline="patterns")
onlyPivot = input(false, title='Only Pivots',inline="patterns")
showCamarilla = input(false, title='Camarilla',inline="patterns")
previousHL = input(false, title='PH/PL',inline="patterns")
// Create a dropdown menu for selecting the timeframe
timeframeOptions = input.string(defval="D", title="Select Timeframe", options=["12M","M","W","D"])
// Moving Averages
sma200 = ta.sma(src, 200)
sma50 = ta.sma(src, 50)
sma20 = ta.sma(src, 20)
sma9 = ta.sma(src, 9)

// VWAP (Volume Weighted Average Price)
vwapVal = ta.vwap(hlc3)

// Plotting
plot(show200SMA?sma200: na,color=color.orange, linewidth=2, title='200 SMA')
plot(show50SMA?sma50:na, color=color.red, linewidth=2, title='50 SMA')
plot(show20SMA?sma20:na, color=color.green, linewidth=2, title='20 SMA')
plot(show9SMA?sma9:na, color=#e6e200, linewidth=2, title='9 SMA')
plot(showVwap?vwapVal:na, color=#6b6b6c, linewidth=2, title='VWAP')

// Previous Day's High, Low, and Close
highPrev = request.security(syminfo.tickerid, timeframeOptions, high[1], lookahead=barmerge.lookahead_on)
lowPrev = request.security(syminfo.tickerid, timeframeOptions, low[1], lookahead=barmerge.lookahead_on)
closePrev = request.security(syminfo.tickerid, timeframeOptions, close[1], lookahead=barmerge.lookahead_on)

// Calculate Pivot Points
pivot = (highPrev + lowPrev + closePrev) / 3
pivotBC = (highPrev + lowPrev) / 2
pivotTC = pivot + (pivot - pivotBC)

// Determine if the CPR range is narrow or wide
 // Determine range type based on thresholds
tooNarrow = 0.10
narrow = 0.25
wide = 0.75
cprRange = math.abs(pivotTC - pivotBC)

rangeType =  (cprRange / closePrev * 100) < tooNarrow ? "Too Narrow" :  (cprRange / closePrev * 100) < narrow ? "Narrow" : (cprRange / closePrev * 100) < wide ? "Wide" : "Too Wide"


// ABS(TC-BC)/PC*100)<0.25
// Create the table if it doesn't exist
var table cprTable = table.new(position.top_right, 2, 5, border_width=1)

// Update the table headers once
if bar_index == 0
    table.cell(cprTable, 0, 0, "Level", bgcolor=color.gray)
    table.cell(cprTable, 1, 0, "Value", bgcolor=color.gray) 

table.cell(cprTable, 0, 4, "Range", bgcolor=color.new(color.yellow,0))
table.cell(cprTable, 1, 4, rangeType, bgcolor=color.new(color.yellow,0))

    
r1 = 2 * pivot - lowPrev
s1 = 2 * pivot - highPrev
r2 = pivot + (highPrev - lowPrev)
s2 = pivot - (highPrev - lowPrev)
r3 = highPrev + 2 * (pivot - lowPrev)
s3 = lowPrev -2 * (highPrev - pivot)
// Calculate Pivot Point (P)
// Calculate Bottom Central Pivot (BC)
bc = (highPrev + lowPrev) / 2
// Calculate Top Central Pivot (TC)
tc = pivot + (pivot - bc)
// Calculate Extended Resistance (R4) and Support (S4)
 

// Calculate Extended Resistance (R4) and Support (S4)
// r4 = tc + (tc - bc)
// s4 = bc - (tc - bc)
// Calculate Extended Resistance (R4) and Support (S4)
// r4 = highPrev + 3 * (pivot - lowPrev)
// s4 = lowPrev - 3 * (highPrev - pivot)


 
// Plot Pivot Points
plot(showPivot ? pivot : na, style=plot.style_circles, color=color.blue, title="P")
plot(showPivot ? pivotBC : na, style=plot.style_circles, color=color.blue, title="BC")
plot(showPivot ? pivotTC : na, style=plot.style_circles, color=color.blue, title="TC")

plot(onlyPivot ? pivot : na, style=plot.style_circles, color=color.blue, title="P")
plot(onlyPivot ? pivotBC : na, style=plot.style_circles, color=color.blue, title="BC")
plot(onlyPivot ? pivotTC : na, style=plot.style_circles, color=color.blue, title="TC")

plot(showPivot ? r1 : na, style=plot.style_circles, color=color.red, title="R1")
plot(showPivot ? r2 : na, style=plot.style_circles, color=color.red, title="R2")
plot(showPivot ? r3 : na, style=plot.style_circles, color=color.red, title="R3")
// plot(showPivot ? r4 : na, style=plot.style_circles, color=color.red, title="R4")
plot(showPivot ? s1 : na, style=plot.style_circles, color=color.green, title="S1")
plot(showPivot ? s2 : na, style=plot.style_circles, color=color.green, title="S2")
plot(showPivot ? s3 : na, style=plot.style_circles, color=color.green, title="S3")
// plot(showPivot ? s4: na, style=plot.style_circles, color=color.green, title="S4")
// plotshape(showPivot?r1:na, title='R1', text='R1', textcolor=color.white, style=shape.labelup, size=size.tiny,location=location, color=color.new(color.green, 0))
 

// Plot PH and PL
plot(previousHL?highPrev:na, style=plot.style_circles,color=color.rgb(255, 235, 59), title='PH',linewidth = 2)
plot(previousHL?lowPrev:na, style=plot.style_circles,color=color.rgb(255, 235, 59), title='PL',linewidth = 2)


// Calculate Camarilla Pivot Points// Calculate Camarilla Pivot Points
previousDayHigh = request.security(syminfo.tickerid, timeframeOptions, high[1], lookahead=barmerge.lookahead_on)
previousDayLow = request.security(syminfo.tickerid, timeframeOptions, low[1], lookahead=barmerge.lookahead_on)
previousDayClose = request.security(syminfo.tickerid, timeframeOptions, close[1], lookahead=barmerge.lookahead_on)

H = previousDayHigh
L = previousDayLow
C = previousDayClose

PP = (H + L + C) / 3.0
H1 = C + (H - L) * 1.1 / 12.0
H2 = C + (H - L) * 1.1 / 6.0
H3 = C + (H - L) * 1.1 / 4.0
H4 = C + (H - L) * 1.1 / 2.0
H5 = H / L * C  // Corrected formula for R5
H6 = C + (H - L) * 1.1 / 1.0  // Additional level R5

L1 = C - (H - L) * 1.1 / 12.0
L2 = C - (H - L) * 1.1 / 6.0
L3 = C - (H - L) * 1.1 / 4.0
L4 = C - (H - L) * 1.1 / 2.0
L5 = (L / H) * C  // Corrected formula for L5
L6 = C - (H - L) * 1.1 / 1.0  // Additional level L5

mid = (H3 + L3) / 2
// Plot Camarilla Pivot Points 
// Function to create labels next to the lines
createLabel(price, a) =>
    label.new(x=bar_index, y=price, text=a, color=#ffffff00, textcolor=color.white, style=label.style_label_left, size=size.normal, textalign=text.align_left)


// Remove previous labels
var label pivotLabel = na
var label bcLabel = na
var label tcLabel = na
var label sma200Label = na
var label sma20Label = na
var label sma50Label = na
var label sma9Label = na
var label camP = na
var label camH3 = na
var label camH4 = na
var label camH5 = na
var label camH6 = na
var label camL3 = na
var label camL4 = na
var label camL5 = na
var label camL6 = na
var label cammid = na
var label prevHigh = na
var label prevLow = na
plot(showCamarilla?PP: na,style=plot.style_circles, color=color.white, title='PP',linewidth = 1)
// plot(showCamarilla?H1: na,style=plot.style_circles, color=color.green, title='H1')
// plot(showCamarilla?H2: na,style=plot.style_circles, color=color.green, title='H2')
plot(showCamarilla?H3: na,style=plot.style_circles, color=color.green, title='H3',linewidth = 1)
plot(showCamarilla?H4: na,style=plot.style_circles, color=color.green, title='H4',linewidth = 1)
plot(showCamarilla?H5: na,style=plot.style_circles, color=color.green, title='H5',linewidth = 1)  // Plot R5
// plot(showCamarilla?H6: na,style=plot.style_circles, color=color.orange, title='H6')  // Plot R6 extra formula for R5 only from openAI

plot(showCamarilla?mid: na,style=plot.style_circles, color=color.purple, title='SL',linewidth = 2) // mid range of H3 and L3 act like SL

// plot(showCamarilla?L1: na,style=plot.style_circles, color=color.red, title='L1')
// plot(showCamarilla?L2: na,style=plot.style_circles, color=color.red, title='L2')
plot(showCamarilla?L3: na,style=plot.style_circles, color=color.red, title='L3',linewidth = 1)
plot(showCamarilla?L4: na,style=plot.style_circles, color=color.red, title='L4',linewidth = 1)
plot(showCamarilla?L5: na,style=plot.style_circles, color=color.red, title='L5',linewidth = 1)  // Plot L5
// plot(showCamarilla?L6: na,style=plot.style_circles, color=color.orange, title='L6')  // Plot L6 extra formula for L5 only from openAI

if (not na(pivotLabel))
    label.delete(pivotLabel)
if (not na(bcLabel))
    label.delete(bcLabel)
if (not na(tcLabel))
    label.delete(tcLabel)
if (not na(sma200Label))
    label.delete(sma200Label)
if (not na(sma50Label))
    label.delete(sma50Label)
if (not na(sma20Label))
    label.delete(sma20Label)
if (not na(sma9Label))
    label.delete(sma9Label)
if (not na(camP))
    label.delete(camP)
if (not na(camH3))
    label.delete(camH3)
if (not na(camH4))
    label.delete(camH4)
if (not na(camH5))
    label.delete(camH5)
if (not na(camH6))
    label.delete(camH6)
if (not na(camL3))
    label.delete(camL3)
if (not na(camL4))
    label.delete(camL4)
if (not na(camL5))
    label.delete(camL5)
if (not na(camL6))
    label.delete(camL6)
if (not na(cammid))
    label.delete(cammid)
if (not na(prevHigh))
    label.delete(prevHigh)
if (not na(prevLow))
    label.delete(prevLow)

// Create new labels
pivotLabel := createLabel(showPivot?pivot:na, "     P")
bcLabel := createLabel(showPivot?pivotBC:na, "      BC")
tcLabel := createLabel(showPivot?pivotTC:na, "      TC")
sma200Label := createLabel(show200SMA?sma200:na, "     200 SMA")
sma50Label := createLabel(show50SMA?sma50:na, "        50 SMA")
sma20Label := createLabel(show20SMA?sma20:na, "        20 SMA")
camP := createLabel(showCamarilla?PP:na,  "         CP")
camH3 := createLabel(showCamarilla?H3:na, "         CE")
camH4 := createLabel(showCamarilla?H4:na, "         T1")
camH5 := createLabel(showCamarilla?H5:na, "         T2")
camH6 := createLabel(showCamarilla?H6:na, "         H6")
camL3 := createLabel(showCamarilla?L3:na, "         PE")
camL4:= createLabel(showCamarilla?L4:na, "          T1")
camL5:= createLabel(showCamarilla?L5:na, "          T2 " + ' '+ str.tostring(L5, "#.##"))
camL6:= createLabel(showCamarilla?L6:na, "          L6")
cammid:= createLabel(showCamarilla?mid:na, "        SL")
prevHigh:= createLabel(previousHL?highPrev:na, "    PH")
prevLow:= createLabel(previousHL?lowPrev:na, "      PL")

showBB = input(false, title='BB',inline="patterns")

// Bollinger Bands (BB) Parameters
length = 20
mult1 = 2.0

// Calculate Bollinger Bands
basis = ta.sma(src, length)
dev = mult1 * ta.stdev(src, length)
upperBB = basis + dev
lowerBB = basis - dev

// Plot Bollinger Bands if showBB is true
plot(showBB? basis:na, color=#2962FF,title="Basis")
plot(showBB? upperBB: na, color=color.red, title='Upper BB')
plot(showBB? lowerBB: na, color=color.green, title='Lower BB')


showDoji = input.bool(false, title="Doji",inline="patterns")
showHammer = input.bool(false, title="Hammer",inline="patterns")

// Function to check for Doji
isDoji(open, high, low, close) =>
    bodySize = math.abs(close - open)
    upperShadow = high - math.max(open, close)
    lowerShadow = math.min(open, close) - low
    totalRange = high - low
    isDoji = (bodySize / totalRange) < 0.1 and upperShadow > bodySize and lowerShadow > bodySize
    isDoji

// Function to check for Hammer
isHammer(open, high, low, close) =>
    bodySize = math.abs(close - open)
    upperShadow = high - math.max(open, close)
    lowerShadow = math.min(open, close) - low
    totalRange = high - low
    isBullishHammer = (bodySize < lowerShadow and upperShadow < bodySize and (close > open)) or (lowerShadow > 2 * bodySize and upperShadow < bodySize and (close > open) and (bodySize / totalRange < 0.3))
    isBearishHammer = (bodySize < lowerShadow and upperShadow < bodySize and (close < open)) or (lowerShadow > 2 * bodySize and upperShadow < bodySize and (close < open) and (bodySize / totalRange < 0.3))
    [isBullishHammer, isBearishHammer]


// Identify Doji and Hammers
doji = isDoji(open, high, low, close)
[bullishHammer, bearishHammer] = isHammer(open, high, low, close)

// Plot Doji
plotshape(showDoji? doji: na, location=location.abovebar, color=color.yellow, style=shape.labeldown, text="D")

// Plot Bullish Hammer
plotshape(showHammer?bullishHammer:na, location=location.belowbar, color=color.rgb(70, 215, 75), style=shape.labelup, text="H")

// Plot Bearish Hammer
plotshape(showHammer?bearishHammer:na, location=location.abovebar, color=color.rgb(230, 51, 51), style=shape.labeldown, text="H")

// Getting inputs
fast_length = input(title = "Fast Length", defval = 12)
slow_length = input(title = "Slow Length", defval = 26)
src11 = input(title = "Source", defval = close)
signal_length = input.int(title = "Signal Smoothing",  minval = 1, maxval = 50, defval = 9, display = display.data_window)
sma_source = input.string(title = "Oscillator MA Type",  defval = "EMA", options = ["SMA", "EMA"], display = display.data_window)
sma_signal = input.string(title = "Signal Line MA Type", defval = "EMA", options = ["SMA", "EMA"], display = display.data_window)
// Calculating
// fast_ma = sma_source == "SMA" ? ta.sma(src11, fast_length) : ta.ema(src11, fast_length)
// slow_ma = sma_source == "SMA" ? ta.sma(src11, slow_length) : ta.ema(src11, slow_length)
// macd = fast_ma - slow_ma
// signal = sma_signal == "SMA" ? ta.sma(macd, signal_length) : ta.ema(macd, signal_length)
// hist = macd - signal

// alertcondition(hist[1] >= 0 and hist < 0, title = 'Rising to falling', message = 'The MACD histogram switched from a rising to falling state')
// alertcondition(hist[1] <= 0 and hist > 0, title = 'Falling to rising', message = 'The MACD histogram switched from a falling to rising state')

// hline(0, "Zero Line", color = color.new(#787B86, 50))
// plot(hist, title = "Histogram", style = plot.style_columns, color = (hist >= 0 ? (hist[1] < hist ? #26A69A : #B2DFDB) : (hist[1] < hist ? #FFCDD2 : #FF5252)))
// plot(macd,   title = "MACD",   color = #2962FF)
// plot(signal, title = "Signal", color = #FF6D00)

// Bullish Engulfin
signal = open[1] > close[1] ? close > open ? close >= open[1] ? close[1] >= open ? close - open > open[1] - close[1] ? true :false :false : false : false : false
barcolor(signal ? color.yellow :na )

 // fair value 
 
// thresholdPer = 0.5
thresholdPer = input.float(0, "Threshold %", minval=0, maxval=100, step=0.1, inline='extend', group='FAIRVALUE')
tf = input.timeframe('', "Timeframe", inline='extend', group='FAIRVALUE')
showFairValue = input(false, "fairvalue", inline='extend', group='FAIRVALUE')
extend = input.int(20, 'Extend', minval=0, inline='extend', group='FAIRVALUE') 



//-----------------------------------------------------------------------------
// Detection Function
//-----------------------------------------------------------------------------
detect() =>
    var float threshold =  thresholdPer / 100
    bull_fvg = low > high[2] and close[1] > high[2] and (low - high[2]) / high[2] > threshold
    bear_fvg = high < low[2] and close[1] < low[2] and (low[2] - high) / high > threshold
    
    [bull_fvg, bear_fvg, low, high[2], low[2], high]

[bull_fvg, bear_fvg, bull_min, bull_max, bear_min, bear_max] = request.security(syminfo.tickerid, tf, detect())

if bull_fvg and showFairValue
    linefill.new(line.new(bar_index-2, bull_max, bar_index+extend, bull_max,color=#0899816e), line.new(bar_index-2, bull_min, bar_index+extend, bull_min,color=#0899816e), color=#0899812d)

if bear_fvg and showFairValue
    linefill.new(line.new(bar_index-2, bear_max, bar_index+extend, bear_max,color=#f2364667), line.new(bar_index-2, bear_min, bar_index+extend, bear_min,color=#f2364667), color=#f236461a)



