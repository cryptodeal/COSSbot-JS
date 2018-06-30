const CossIOLib = require('./../lib');
const cossAPI = require('./coss-api');
var symbols = []
var cryptos = []
var exchange = []
var ask = []
var bid = []
var openordersid = []
var openordersprice = []
var totalpr
var totalvol
var crpr
var crvol
var openordersvolume = []
var base = {} 
var pairbasicopopulatedinfo = {'ASK' : '2', 'BID' : '1', 'quote' : 'COSS', 'base' : 'LTC', 'lotsize' : '10'}
var inputcfduid = 'xx'
var inputcoss = 'xx'
var inputxsrf = 'xx'
var data
var pr
var l 
var m 
var rpair
var n
var i
var o
var temp
var placements = 0
var symbols = []
var pairs = []; 
var symbols = [];
var balances = [];
var allowtrade = [];
var buys;
var treshold = 0.00000250
var rlots
var rtp
var rtreshold
var rbet
var buyIDs = [];
var buyIDsnew = [];
var buysymbols =[];
var buysymbolsnew =[];
var buyprices = [];
var buypricesnew = [];
var sells;
var trueprice
var IDtoCancel ;
var counter = 0;
var tradingpattern = 1;
var highestsellid = []
var pr;
var increaseliquid = []
var ethbtclots
var userOrders
var averagedown = []
var agpreth
var agprbtc
var agpercent = []
var agprices = [[0,0]]
var temp
var temp2
symbols[0] = 'coss-eth'
symbols[1] = 'coss-btc'
symbols[2] = 'eth-btc'
var buyQty = 10.05 
var pumpQty = 10.00
var sellQty = 10 
var buylevel = 99 
var selllevel = 101 
var checklevel = 0.01 
var pumplevel = 101 
var timeframe = 600000000000  
var fs = require('fs');
var lot
var r
var m
var indexbids
var indexasks
var datacheck1 = Date.now();
var datacheck2 = Date.now();
var lowestbuyprice
var highestsellprice
var highestsellID
var lowestbuyID
var cancelsell =false
var cancelbuy = false
exchange[0] = 'COSS'
base[exchange[0]] = {} 
const getem = async () => {
try {
	const cossIO = new CossIOLib.CossIO({
      cfduid: inputcfduid,
      coss: inputcoss,
      xsrf: inputxsrf,
    });
	
        const tickers = await cossIO.requestTickers();
        console.log('---------------------------------');
		l = tickers.length
		symbols = []
		cryptos = ['BTC']
		for(i=0;i<l;i++)
		{
			base[exchange[0]][tickers[i].tradingPair.id] =  {}
			base[exchange[0]][tickers[i].tradingPair.id]['quote'] = tickers[i].tradingPair.quote
			base[exchange[0]][tickers[i].tradingPair.id]['base'] = tickers[i].tradingPair.base
			base[exchange[0]][tickers[i].tradingPair.id]['volume'] = tickers[i].volumeUsd
			base[exchange[0]][tickers[i].tradingPair.id]['blokbuyprice'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['blokbuyid'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['bloksellprice'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['bloksellid'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['lotsize'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['spreadsreduced'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['register'] = []
			base[exchange[0]][tickers[i].tradingPair.id]['register'].push({price : 0, lock : 'open' , id : '0'})
			base[exchange[0]][tickers[i].tradingPair.id]['sells'] = []
			base[exchange[0]][tickers[i].tradingPair.id]['positions'] = []
			base[exchange[0]][tickers[i].tradingPair.id]['newsells'] = []
			base[exchange[0]][tickers[i].tradingPair.id]['buyset'] = false
			base[exchange[0]][tickers[i].tradingPair.id]['errorcounter'] = 0
			base[exchange[0]][tickers[i].tradingPair.id]['placement'] = 1
			base[exchange[0]][tickers[i].tradingPair.id]['liquid'] = 0
			
			symbols.push(tickers[i].tradingPair.id);
			m=cryptos.length
			var setcrypto = true;
			for(n = 0;n<m;n++)
			{
				if(cryptos[n] == tickers[i].tradingPair.quote){setcrypto = false}
			}
			if(setcrypto == true){cryptos.push(tickers[i].tradingPair.quote)}
		}
		base[exchange[0]]['symbols'] = symbols
		base[exchange[0]]['cryptos'] = cryptos
		
		console.log('--symbols and cryptos populated--');
		console.log('---------------------------------');
		setInterval(main, 40000);
		base[exchange[0]][rpair]['lotsize'] = rlots
		main();
      } catch (error) {
        console.error('Failed to request ticker', error);
      }
}






const main = async () => {
	try {
	  const cossIO = new CossIOLib.CossIO({
      cfduid: inputcfduid,
      coss: inputcoss,
      xsrf: inputxsrf,
    });
	const session = await cossIO.requestSession();
	
	l = base[exchange[0]]['symbols'].length
	
	
	
	for(i=0;i<l;i++)
	{
		if(base[exchange[0]][base[exchange[0]]['symbols'][i]]['lotsize'] > 0)
		{
			try {
				var sblset=[base[exchange[0]]['symbols'][i]]
			const depth = await cossIO.requestDepth({ symbol: base[exchange[0]]['symbols'][i] });
			
			m = depth.bids.length
			
			for(n=m-1;n>-1;n--)
			{
				
				if(depth.bids[n].volume>0.00099)
				{
					
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['bid'] = depth.bids[n].price
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['bvolume'] = depth.bids[n].volume
					
				}
			}
			m = depth.asks.length
			
			for(n=m-1;n>-1;n--)
			{
				if(depth.asks[n].volume>0.00099)
				{
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask'] = depth.asks[n].price
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['avolume'] = depth.asks[n].volume
				}
			}
			
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['spreadabsolute'] = base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask'] - base[exchange[0]][base[exchange[0]]['symbols'][i]]['bid']
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['spread'] = (base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask'] - base[exchange[0]][base[exchange[0]]['symbols'][i]]['bid'])/base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']*100
			m = base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']*100000000
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['placement'] = 1
			for(m = base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']*100000000;m>99;m=m-100)
			{
				base[exchange[0]][base[exchange[0]]['symbols'][i]]['placement']++
			}
			
			
			try{
			const userOrdersget2 = await cossIO.requestUserOrders({ symbol: base[exchange[0]]['symbols'][i] });
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['positions'] = userOrdersget2
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid'] = base[exchange[0]][base[exchange[0]]['symbols'][i]]['positions'].length*base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']
			if(base[exchange[0]][base[exchange[0]]['symbols'][i]]['base'] = 'BTC'){base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid']=base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid']}
			
			
			console.log([base[exchange[0]]['symbols'][i]]+' spread in %: ' + base[exchange[0]][base[exchange[0]]['symbols'][i]]['spread']);
			
			await tradinglogic(sblset,session,cossIO);
			}catch (error) {
			console.error('Failed to request orders', error);
			}
			
			} catch (error) {
			console.error('Failed to request depth', error);
			}
		}
	}
	try {
	const userWallet = await cossIO.requestUserWallets();
	
	l = userWallet.length
	
	base[exchange[0]]['wallet'] = {}
	for(i=0;i<l;i++)
	{
		
		base[exchange[0]]['wallet'][userWallet[i]['currencyName']] = userWallet[i]['availableBalance'];
	}
	
	var calcu = 10
	
	
     } catch (error) {
       console.error('Failed to request user wallets', error);
     }
	
  }catch (error) {console.log(error)}
}


const tradinglogic = async (sbl,session,cossIO) => {
	try {	
	
	
			lowestbuyprice = 99
	highestsellprice = 99
	const userOrders = await cossIO.requestUserOrders({ symbol: sbl+'' });
	  var l = userOrders.length;
				for (i = 0; i < l; i++) {
					
						if(userOrders[i].side == 'buy')
							{
								
								if(lowestbuyprice > userOrders[i].price)
								{
									
									lowestbuyprice = userOrders[i].price; lowestbuyID = userOrders[i]
								}
								
								
							}
						if(userOrders[i].side == 'sell')
							{
							
								if(highestsellprice > userOrders[i].price)
								{
									
									highestsellprice = userOrders[i].price; highestsellID = userOrders[i]
									
								}
							}
					
				}
				try {
					if(agprices[0][0] != 0 && agprices[0][1] != 0)
					{
					
						totalpr = 0
						totalvol = 0
						l = agprices.length
						for(i = 0;i<l;i++)
						{
							totalpr += (agprices[i][0] * agprices[i][1])
							totalvol += agprices[i][1]
							o = i
						}
						crpr = totalpr / totalvol
						console.log('AGPRICES: '+crpr,agprices[o][0] - rtreshold,base[exchange[0]][sbl]['ask'],base[exchange[0]][sbl]['lotsize'],base[exchange[0]][sbl]['avolume'])
						
						if(agprices[o][0] - rtreshold > base[exchange[0]][sbl]['ask'] && base[exchange[0]][sbl]['lotsize'] <= base[exchange[0]][sbl]['avolume'] )
						{
							try{
									const placedOrder = await cossIO.placeOrder({
									symbol: sbl,
									side: CossIOLib.CossIOOrderSide.BUY,
									type: CossIOLib.CossIOOrderType.LIMIT,
									price: base[exchange[0]][sbl]['ask'],
									amount: base[exchange[0]][sbl]['lotsize'],
									session,
									});
									agprices.push([base[exchange[0]][sbl]['ask'],base[exchange[0]][sbl]['lotsize']])
									console.log(agprices)
									console.log('Averaging down: ', placedOrder);
								}catch (error) {
												console.error('Failed to place treshold buy order', error);
												}
						}
						if(crpr < base[exchange[0]][sbl]['bid']- rtp  && base[exchange[0]][sbl]['lotsize'] <= base[exchange[0]][sbl]['bvolume'])
						{
						try{
									const placedOrder = await cossIO.placeOrder({
									symbol: sbl,
									side: CossIOLib.CossIOOrderSide.SELL,
									type: CossIOLib.CossIOOrderType.LIMIT,
									price: base[exchange[0]][sbl]['bid'],
									amount: base[exchange[0]][sbl]['lotsize'],
									session,
									});
									if(totalvol - base[exchange[0]][sbl]['lotsize'] > 0)
                                    {
                                    agprices = [[crpr,totalvol - base[exchange[0]][sbl]['lotsize']]]
                                    }
                                    if(totalvol - base[exchange[0]][sbl]['lotsize'] <= 0)
                                    {
                                    agprices = [[0,0]]
                                    }
                                    console.log(agprices)
                                    console.log('Taken profit: ', placedOrder);
									
								}catch (error) {
												console.error('Failed to place treshold buy order', error);
												}
						
					}}
					if(agprices[0][0] == 0 && agprices[0][1] == 0)
					{
						try{
						const placedOrder = await cossIO.placeOrder({
         				symbol: sbl,
         				side: CossIOLib.CossIOOrderSide.BUY,
         				type: CossIOLib.CossIOOrderType.LIMIT,
         				price: base[exchange[0]][sbl]['ask'],
         				amount: base[exchange[0]][sbl]['lotsize'],
         				session,
						});
						agprices = [[base[exchange[0]][sbl]['ask'],base[exchange[0]][sbl]['lotsize']]]
						console.log('Placed Order:', placedOrder);
						console.log('log: ',agprices)
					}catch (error) {
					
					console.error('Failed to place null buy order', error);
							}
					}
					
					}catch (error) {
					console.error('Fail in ag', error);
							}
	}catch (error) {
					console.error('Fail in tradinglogic', error);
							}
}
exports.setconfig = function(p1,p2,p3,p4,p5,p6,p7,p8){
	inputcfduid = p1
	inputcoss = p2
	inputxsrf = p3
	rpair = p4
	rlots = p5
	rbet = p6
	rtreshold = p7
	rtp = p8
	getem(); 
}