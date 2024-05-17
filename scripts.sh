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




### 3) signal,BB,VWAP,200,50,20 SMA,oivot.camerlla
// @version=5
// samba siva grow signal
indicator(title='Grow More', overlay=true)
// indicator(title='Combined Moving Averages and VWAP', overlay=true)
src = input(defval=close, title='Source')
per = input.int(defval=100, minval=1, title='Sampling Period')
mult = input.float(defval=3.0, minval=0.1, title='Range Multiplier')
showSignal = input(false, title='Signal')
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
showBB = input(false, title='Show Bollinger Bands')
show200SMA = input(false, title='200 SMA')
show50SMA = input(false, title='50 SMA')
show20SMA = input(false, title='20 SMA')
show9SMA = input(false, title='9 SMA')
showVwap = input(false, title='VWAP')
showPivot = input(false, title='Standard Pivot')
showCamarilla = input(false, title='Camarilla')
previousHL = input(false, title='PH/PL')

// Moving Averages
sma200 = ta.sma(src, 200)
sma50 = ta.sma(src, 50)
sma20 = ta.sma(src, 20)
sma9 = ta.sma(src, 9)

// VWAP (Volume Weighted Average Price)
vwapVal = ta.vwap(hlc3)

// Bollinger Bands (BB) Parameters
length = input.int(20, title='BB Length')
mult1 = input.float(2.0, title='BB Mult')

// Calculate Bollinger Bands
basis = ta.sma(src, length)
dev = mult1 * ta.stdev(src, length)
upperBB = basis + dev
lowerBB = basis - dev

// Plotting
plot(show200SMA?sma200: na,color=color.orange, linewidth=2, title='200 SMA')
plot(show50SMA?sma50:na, color=color.red, linewidth=2, title='50 SMA')
plot(show50SMA?sma20:na, color=color.green, linewidth=2, title='20 SMA')
plot(show9SMA?sma9:na, color=#e6e200, linewidth=2, title='9 SMA')
plot(showVwap?vwapVal:na, color=#6b6b6c, linewidth=2, title='VWAP')

// Plot Bollinger Bands if showBB is true
 
plot(showBB? upperBB: na, color=color.blue, title='Upper BB')
plot(showBB? lowerBB: na, color=color.orange, title='Lower BB')

 

// Previous Day's High, Low, and Close
highPrev = request.security(syminfo.tickerid, "D", high[1], lookahead=barmerge.lookahead_on)
lowPrev = request.security(syminfo.tickerid, "D", low[1], lookahead=barmerge.lookahead_on)
closePrev = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)


// Calculate Pivot Points
pivot = (highPrev + lowPrev + closePrev) / 3
r1 = 2 * pivot - lowPrev
s1 = 2 * pivot - highPrev
r2 = pivot + (highPrev - lowPrev)
s2 = pivot - (highPrev - lowPrev)
r3 = highPrev + 2 * (pivot - lowPrev)
s3 = lowPrev -2 * (highPrev - pivot)


// Plot Pivot Points
plot(showPivot ? pivot : na, style=plot.style_circles, color=color.blue, title="P")
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

// Plot Camarilla Pivot Points
plot(showCamarilla?PP: na,style=plot.style_circles, color=color.white, title='PP')

// plot(showCamarilla?H1: na,style=plot.style_circles, color=color.red, title='H1')
// plot(showCamarilla?H2: na,style=plot.style_circles, color=color.red, title='H2')
plot(showCamarilla?H3: na,style=plot.style_circles, color=color.red, title='H3')
plot(showCamarilla?H4: na,style=plot.style_circles, color=color.red, title='H4')
plot(showCamarilla?H5: na,style=plot.style_circles, color=color.red, title='H5')  // Plot R5
plot(showCamarilla?H6: na,style=plot.style_circles, color=color.orange, title='H6')  // Plot R6 extra formula for R5 only from openAI

// plot(showCamarilla?L1: na,style=plot.style_circles, color=color.green, title='L1')
// plot(showCamarilla?L2: na,style=plot.style_circles, color=color.green, title='L2')
plot(showCamarilla?L3: na,style=plot.style_circles, color=color.green, title='L3')
plot(showCamarilla?L4: na,style=plot.style_circles, color=color.green, title='L4')
plot(showCamarilla?L5: na,style=plot.style_circles, color=color.green, title='L5')  // Plot L5
plot(showCamarilla?L6: na,style=plot.style_circles, color=color.orange, title='L6')  // Plot L6 extra formula for L5 only from openAI



// Add labels at the end of the lines for R1 and S1
// var label r1Label = na
// var label s1Label = na

// if (bar_index == last_bar_index)
//     label.delete(r1Label)
//     label.delete(s1Label)
//     r1Label := label.new(x=bar_index, y=H3, text="H3", color=#ff525202, textcolor=color.white, style=label.style_label_upper_right, size=size.small)
//     s1Label := label.new(x=bar_index, y=L3, text="H4", color=#ff525202, textcolor=color.white, style=label.style_label_right, size=size.small)
