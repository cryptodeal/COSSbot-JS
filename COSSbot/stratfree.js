//declarations
const CossIOLib = require('./../lib'); //these need to be usable from below
const cossAPI = require('./coss-api'); //these need to be usable from below
var symbols = []//pair symbols
var cryptos = [] // single symbols (for funds fetching)
var exchange = [] // either exchange number or name
var ask = [] //ask value
var bid = [] //bid value
var openordersid = [] // open orders ids
var openordersprice = []
var totalpr
var totalvol
var crpr
var crvol
var openordersvolume = [] //lotsize
var base = {} //nested object containing information
var pairbasicopopulatedinfo = {'ASK' : '2', 'BID' : '1', 'quote' : 'COSS', 'base' : 'LTC', 'lotsize' : '10'}
var inputcfduid = 'xx'
var inputcoss = 'xx'
var inputxsrf = 'xx'
var data
var pr
var l //temp array length
var m //temp array length
var n
var i
var o
var temp
var placements = 0
var symbols = []
var pairs = []; // value of ticker on trading pair
var symbols = [];//trading pair
var balances = [];
var allowtrade = [];
var buys;
var treshold = 0.00000250
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
var buyQty = 10.05 //change to your preference, minimum 10 coss is recommended
var pumpQty = 10.00
var sellQty = 10 //change to your preference, minimum 10 coss is recommended
var buylevel = 99 // nominated in % vs ticker
var selllevel = 101 //nominated in sell level vs buy filled price
var checklevel = 0.01 // 0.03 => 3 % up and down check => 6 % range only 1  order allowed to prevent account drainage at same level
var pumplevel = 101 //price to base sell upon needs to be big enough so the buy limit gets filled directly.
var timeframe = 600000000000  // 1800000 for each 30 mins
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
//launch sequences
//-populate exchanges
exchange[0] = 'COSS'
base[exchange[0]] = {} // store empty to prevent error
const getem = async () => {
try {
	const cossIO = new CossIOLib.CossIO({
      cfduid: inputcfduid,
      coss: inputcoss,
      xsrf: inputxsrf,
    });
	
        const tickers = await cossIO.requestTickers();
        console.log('---------------------------------');
		//console.log('Ticker: COSS/ETH');
        //console.log(tickers[0].tradingPair);
		l = tickers.length
		//console.log(l)
		symbols = []
		cryptos = ['BTC']
		for(i=0;i<l;i++)
		{
			base[exchange[0]][tickers[i].tradingPair.id] =  {}
			//console.log(tickers[i].tradingPair.id)
			//console.log(tickers[i].tradingPair.quote)
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
			//console.log(base)
			//console.log(base[exchange[0]]);
		}
		base[exchange[0]]['symbols'] = symbols
		base[exchange[0]]['cryptos'] = cryptos
		
		console.log('--symbols and cryptos populated--');
		console.log('---------------------------------');
		setInterval(main, 40000);
		//setInterval(main2, 10000);
		main();
		//data = JSON.parse(tickers[0])
		//console.log(data);splice
		//console.log(data.tradingpair);
		//console.log(base)
      } catch (error) {
        console.error('Failed to request ticker', error);
      }
}
getem();




//engine - information handling and position execution
//COSS engine
const main = async () => {
	try {
	  //console.log('test');
	  const cossIO = new CossIOLib.CossIO({
      cfduid: inputcfduid,
      coss: inputcoss,
      xsrf: inputxsrf,
    });
	const session = await cossIO.requestSession();
	//depth updates
	l = base[exchange[0]]['symbols'].length
	//console.log(l) positions
	base[exchange[0]]['coss-eth']['lotsize'] = 100
	//base[exchange[0]]['coss-btc']['lotsize'] = 100
	//base[exchange[0]]['coss-usd']['lotsize'] = 100
	/*
	//base[exchange[0]]['coss-eth']['lotsize'] = 20;
	//base[exchange[0]]['coss-btc']['lotsize'] = 20
	base[exchange[0]]['eth-btc']['lotsize'] = 0.01
	base[exchange[0]]['ltc-btc']['lotsize'] = 0.01
	base[exchange[0]]['pgt-btc']['lotsize'] = 50
	base[exchange[0]]['pgt-eth']['lotsize'] = 50;
	//base[exchange[0]]['xdce-btc']['lotsize'] = 10000
	base[exchange[0]]['eth-ltc']['lotsize'] = 0.01
	*/
	
	
	
	for(i=0;i<l;i++)
	{
		if(base[exchange[0]][base[exchange[0]]['symbols'][i]]['lotsize'] > 0)
		{
			try {
				var sblset=[base[exchange[0]]['symbols'][i]]
			const depth = await cossIO.requestDepth({ symbol: base[exchange[0]]['symbols'][i] });
			
			m = depth.bids.length
			//console.log(m)
			for(n=m-1;n>-1;n--)
			{
				//console.log(depth.bids[n].volume)
				if(depth.bids[n].volume>0.00099)
				{
					//console.log(base[exchange[0]]['symbols'][i] + ' price: '+depth.bids[n].price);
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['bid'] = depth.bids[n].price
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['bvolume'] = depth.bids[n].volume
					//console.log(base[exchange[0]]['symbols'][i] + ' price: '+depth.bids[n].price);
				}
			}
			m = depth.asks.length
			//console.log(m)
			for(n=m-1;n>-1;n--)
			{
				if(depth.asks[n].volume>0.00099)
				{
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask'] = depth.asks[n].price
					base[exchange[0]][base[exchange[0]]['symbols'][i]]['avolume'] = depth.asks[n].volume
				}
			}
			//discover optimal spread reduction rate
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['spreadabsolute'] = base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask'] - base[exchange[0]][base[exchange[0]]['symbols'][i]]['bid']
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['spread'] = (base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask'] - base[exchange[0]][base[exchange[0]]['symbols'][i]]['bid'])/base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']*100
			m = base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']*100000000
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['placement'] = 1
			for(m = base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']*100000000;m>99;m=m-100)
			{
				base[exchange[0]][base[exchange[0]]['symbols'][i]]['placement']++
			}
			//console.log(base[exchange[0]][base[exchange[0]]['symbols'][i]]+': '+base[exchange[0]][base[exchange[0]]['symbols'][i]]['placement'])
			
			
			//positions part:
			try{
			const userOrdersget2 = await cossIO.requestUserOrders({ symbol: base[exchange[0]]['symbols'][i] });
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['positions'] = userOrdersget2
			base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid'] = base[exchange[0]][base[exchange[0]]['symbols'][i]]['positions'].length*base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']
			if(base[exchange[0]][base[exchange[0]]['symbols'][i]]['base'] = 'BTC'){base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid']=base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid']}
			//console.log(base[exchange[0]][base[exchange[0]]['symbols'][i]]['positions'].length+base[exchange[0]][base[exchange[0]]['symbols'][i]]['base'])
			
			//console.log('First Bid', depth.bids[0]);
			//console.log('First Bid', depth.bids[0].price);
			//console.log('First Bid', depth.bids[0].volume);
			console.log([base[exchange[0]]['symbols'][i]]+' spread in %: ' + base[exchange[0]][base[exchange[0]]['symbols'][i]]['spread']);
			// console.log('First Ask', base[exchange[0]][base[exchange[0]]['symbols'][i]]['ask']);
			//if(base[exchange[0]][base[exchange[0]]['symbols'][i]]['spread']>0){
			await tradinglogic(sblset,session,cossIO);
			}catch (error) {
			console.error('Failed to request orders', error);
			}
			//}
			} catch (error) {
			console.error('Failed to request depth', error);
			}
		}
	}/*
	0xba201355175830a0b80700c67597b970b5449469
	console.log('---------------------------------');
	console.log('----------depth updated----------');
	console.log('---------------------------------');
	console.log('---------------------------------');
		console.log('--------Positions updated--------');
		console.log('---------------------------------');*/
	//wallet updates
	try {
    const userWallet = await cossIO.requestUserWallets();
	//var wally = JSON.parse(userWallets[0])
    l = userWallet.length
	//console.log(l)
	base[exchange[0]]['wallet'] = {}
	for(i=0;i<l;i++)
	{
		//console.log(userWallet[i]['currencyName']+':   '+ userWallet[i]['availableBalance']);
		base[exchange[0]]['wallet'][userWallet[i]['currencyName']] = userWallet[i]['availableBalance'];
	}
	//console.log(cryptos[0]+":  "+base[exchange[0]]['wallet'][cryptos[0]])
	//console.log('User Wallets:' + userWallet[0]['currencyName'] + userWallet[0]['availableBalance'])
	//console.log('User Wallets:' + userWallets.base[exchange[0]]['cryptos'][0])
	/*
	console.log('---------------------------------');
	console.log('---------Wallets updated---------');
    console.log('---------------------------------');*/
	console.log('Total Times Spreads reduced: '+placements);
	console.log('---------Updated-----------');
	var calcu = 10
	
	//console.log('calcu:' + 10/calcu)
     } catch (error) {
       console.error('Failed to request user wallets', error);
     }
	//position updates
  }catch (error) {console.log(error)}
}


const tradinglogic = async (sbl,session,cossIO) => {
	try {
		/*
	const cossIO = new CossIOLib.CossIO({
      cfduid: inputcfduid,
      coss: inputcoss,
      xsrf: inputxsrf,
    });
	const session = await cossIO.requestSession();*/
	
	console.log('liquidest taken: '+base[exchange[0]][base[exchange[0]]['symbols'][i]]['liquid'])
	
	
	
			lowestbuyprice = 99
	highestsellprice = 99
	const userOrders = await cossIO.requestUserOrders({ symbol: sbl+'' });
	  var l = userOrders.length;
				for (i = 0; i < l; i++) {
					//if symbol is matched => debugged is correct
					//console.log(userOrders[i].symbol)
					//console.log(symbols[y])
					
				//console.log('symbols match')
				//console.log(userOrders[i].side)=> debugged is correct
						if(userOrders[i].side == 'buy')
							{
								//console.log('orderside is buy check match') => debugged
								//console.log('allowtrade:' + allowtrade[y])
								//console.log(pairs[y]-pairs[y]*0.03) 
								//console.log(userOrders[i].price)
								//count buys
								//buys++
								//within range => no trade
								
								
								//lowest buy => remember ID
								if(lowestbuyprice > userOrders[i].price)
								{
									//console.log('lower buy found')
									lowestbuyprice = userOrders[i].price; lowestbuyID = userOrders[i]
								}
								//if order ID matches => log this cycle => delete entry/set to 0
								
								// log buy into new buy list
								
							}
						if(userOrders[i].side == 'sell')
							{
								//console.log('order side sell matched ')
								//count sells
								//sells++
								//within range => no trade
								if(highestsellprice > userOrders[i].price)
								{
									//console.log('highre sell found')
									highestsellprice = userOrders[i].price; highestsellID = userOrders[i]
									
								}
							}
					
				}
				try {
					console.log('AGPRICES:')
					if(agprices[0][0] != 0 && agprices[0][1] != 0)
					{
						
						//console.log('AGPRICES HERE:')
						totalpr = 0
						totalvol = 0
						l = agprices.length
						for(i = 0;i<l;i++)
						{
							//console.log(agprices,agprices[i])
							totalpr += (agprices[i][0] * agprices[i][1])
							//console.log(totalpr,totalvol)
							totalvol += agprices[i][1]
							o = i
						}
						console.log(totalpr,totalvol)
						crpr = totalpr / totalvol
						console.log('AGPRICES: '+crpr,agprices[o][0] - treshold,base[exchange[0]][sbl]['ask'],base[exchange[0]][sbl]['lotsize'],base[exchange[0]][sbl]['avolume'])
						
						if(agprices[o][0] - treshold > base[exchange[0]][sbl]['ask'] && base[exchange[0]][sbl]['lotsize'] <= base[exchange[0]][sbl]['avolume'] )
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
						console.log(crpr , ' <? ' , base[exchange[0]][sbl]['bid']- treshold)
						if(crpr < base[exchange[0]][sbl]['bid']- treshold  && base[exchange[0]][sbl]['lotsize'] <= base[exchange[0]][sbl]['bvolume'])
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
									agprices = [crpr,totalvol - base[exchange[0]][sbl]['lotsize']]
									console.log(agprices)
									console.log('Taken profit: ', placedOrder);
									
								}catch (error) {
												console.error('Failed to place treshold buy order', error);
												}
							
					}}
					if(agprices[0][0] == 0 && agprices[0][1] == 0)
					{
						console.log('default placing: ');
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
console.log('end of: ' +sbl+'----- Times Spread Reduced: '+base[exchange[0]][sbl]['spreadsreduced'])	 
}