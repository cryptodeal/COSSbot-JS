const CossIOLib = require('./../lib'); //these need to be usable from below
const cossAPI = require('./coss-api'); //these need to be usable from below
const strat = require('./strat.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var aggregationPrice = [];
var aggregationPercent = [];
var automatedOn = 0;
var cookie
var automatedsetup = false;
var data1 
         var data2 
         var data3 
         


const main = async () => {
    const api = cossAPI(); //these need to be usable from the trading portion of below
    var readlineSync = require('readline-sync')


    function postMessage(message){
		var payload = {
			'sender' : 'COSSbot',
			'msg'	 : message }
		var request = new XMLHttpRequest();
		request.open("POST", "http://localhost:8080")
		request.setRequestHeader("Content-Type", "application/json")
		request.send(JSON.stringify(payload))
    }
    
    const child = require('child_process').fork('./Server', [], { silent: true });

    
    postMessage("test message")


    console.log('COSSbot initializing...');
    console.log('');
    console.log('');
    console.log('Please follow these steps: ');
    console.log('  ');
    console.log('1. Open session of google chrome. ');
    console.log('2. Log into coss.io.');
    console.log('3. Select the exchange tab once you have logged in.');
    console.log('4. Once you are on the Coss.io Exchange tab, please click on the COSSbot Validator chrome extension.');
    
    child.on('message', function(msg) {
        cookie = JSON.stringify(msg);
        didUpdateCookie(cookie);
    });
    async function didUpdateCookie() { //function wraps the remainder of the bot so that data1, data2, and data3 are accessible to the bot for validation
       
        //console.log(cookie);
        console.log('COSSbot successfully received validation data...' + '\n' + '-----------Testing connection to coss.io -----------') 
	postMessage('COSSbot successfully received validation data... \n -----------Testing connection to coss.io -----------')
        var array = cookie.split(",");
        data1 = array[0];
		data1 = data1.replace(/['"]+/g, '')
        data2 = array[1];
		 
        data3 = array[2];
		data3 = data3.replace(/['"]+/g, '')
		 
         //console.log(data1) //these 3 values need to be accessible from the processes below aka the trading portion
         //console.log(data2)
         //console.log(data3)
    
//1- need bot to wait for the values of data1, data2, and data3 to have been parsed above before executing this try        
try {
        const cossIO =  new CossIOLib.CossIO({
          cfduid: data1,
          coss: data3,
          xsrf: data2,
        });
    
    //2- need the above creation of const cossIO to have occurred prior to the below creation of const session
        const session = await cossIO.requestSession(); //now getting an error here saying that reference error, unexpected identifier cossIO
        console.log('Session:', session);
		postMessage('Session:')
		postMessage(JSON.stringify(session));
        //SpecialPost below copy/paste as needed
        var specialPost = new XMLHttpRequest();
        specialPost.open("POST", "http://localhost:4000/data1");
        specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        specialPost.send("Session:", session)
        console.log('---------------------------------');
        postMessage('---------------------------------')

        //3- NEED THE BELOW LISTENER TO WAIT UNTIL SESSION HAS BEEN DECLARED PRIOR TO PROMPTING THE USER FOR INPUT
        //implement listener so Command Line waits for user to pres m, a, or q and then enter to set value to tradingMode variable.
        var tradingMode = 0;
        var tradingMode = readlineSync.question('Use COSSbot manually (m), automatic trading (a), or quit (q)?  ');
        while (automatedsetup !== true) {
        if (tradingMode === 'm') {
            console.log('You have selected COSSbot Manual trading mode.');
            postMessage("You have selected COSSbot Manual trading mode.")
            console.log('Manual trading mode initializing...\n');
            postMessage("Manual trading mode initializing...\n")
            
                while (manualCommand !== 'b' || manualCommand !== 'back'){
                    var manualCommand = readlineSync.question('Please select a command for COSSbot to execute. Type help (h) to see all options:   ');
                    if (manualCommand === 'h' || manualCommand === 'help'){
                         //add available api commands and names here with else if statements for each to allow the user to execute all API calls manually
                        console.log('Here is a list of the available commands: Get Balance (1), Place Buy (2), Place Sell (3) Cancel Order (4), Get Pair Depth (5), Get Order History (6), Check Market Pairs (7), Get Market Pair Ticker Data (8), Get ALL Ticker Data (9), Help (h), Quit (q)... ');
                        postMessage("Here is a list of the available commands: Get Balance (1), Place Buy (2), Place Sell (3) Cancel Order (4), Get Pair Depth (5), Get Order History (6), Check Market Pairs (7), Get Market Pair Ticker Data (8), Get ALL Ticker Data (9), Help (h), Quit (q)... ")
                        //TODO: Implement Place Sell (3), Re-order functions by # for ease of use 

                    //gets highest bid and lowest ask prices for specified pair
                    } else if (manualCommand === '5') {
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        try {
                            //const depth = await api.depth(pairSelected);
                            const depth = await cossIO.requestDepth({ symbol: pairSelected });
                            console.log('First Bid', depth.bids[0]);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("First Bid", depth.bids[0])
                            console.log('First Ask', depth.asks[0]);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("First Ask", depth.asks[0])
                        } catch(error) {
                            console.error('Failed to request depth data', error);
                        } 
                            

                    //Place sell order (market or limit)   
                    } else if (manualCommand === '3'){
                        console.log('You have selected to place a sell order....')
                        postMessage("You have selected to place a sell order....")
                        console.log('----------------------------------------------');
                        postMessage("----------------------------------------------\n")
                        console.log('');
                        var buyType = readlineSync.question('Would you like to place a limit sell (1) or market sell (2):  ');
                        if (buyType === '1'){
                        console.log('You have selected to place a limit sell...');
                        postMessage("You have selected to place a limit sell...")
                        console.log('-----------------------------------------------');
                        postMessage("----------------------------------------------\n")
                        console.log('');
                        var pairSelected = readlineSync.question('Enter a trading pair (currency-pairing) e.g. coss-eth:  ');
                        var sellPrice = readlineSync.question('Please enter your desired ask price per unit in pairing (e.g. ETH/BTC/FIAT):  ');
                        var amount = readlineSync.question('Please enter the amount you want to sell:  ');
                          try {
                            const placedOrder = await cossIO.placeOrder({
                            symbol: pairSelected,
                            side: CossIOLib.CossIOOrderSide.SELL,
                            type: CossIOLib.CossIOOrderType.LIMIT,
                            price: sellPrice,
                            amount: amount,
                            session,
                            });
                            console.log('Placed Order:', placedOrder);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Placed Order:", placedOrder)
                            console.log('---------------------------------');
                            postMessage("---------------------------------")
                        } catch (error) {
                            console.error('Failed to place limit sell order...', error);
                        }
                        }
                        else if (buyType === '2'){
                            console.log('You have selected to place a market sell...');
                            postMessage("You have selected to place a market sell...")
                            console.log('----------------------------------------------- \n');
                            postMessage("----------------------------------------------- \n")
                            var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                                const depth = await cossIO.requestDepth({ symbol: pairSelected });
                                console.log('First Bid', depth.bids[0]);
                                var specialPost = new XMLHttpRequest();
                                specialPost.open("POST", "http://localhost:4000/data1");
                                specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                                specialPost.send("First Bid", depth.bids[0])
                                sellPrice = depth.bids[0].price
                            var amount = readlineSync.question('Please enter the amount you want to sell:  ');
                            if (depth.bids[0].volume >= amount)
                            {
                              try {
                                const placedOrder = await cossIO.placeOrder({
                                symbol: pairSelected,
                                side: CossIOLib.CossIOOrderSide.SELL,
                                type: CossIOLib.CossIOOrderType.LIMIT,
                                price: buyPrice,
                                amount: amount,
                                session,
                                });
                                console.log('Placed Order:', placedOrder);
                                var specialPost = new XMLHttpRequest();
                                specialPost.open("POST", "http://localhost:4000/data1");
                                specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                                specialPost.send("Placed Order:", placedOrder)
                                console.log('---------------------------------');
                                postMessage("---------------------------------")
                            } catch (error) {
                                console.error('Failed to place market sell order...', error);
                            }
                        }
                        else {
                            console.log('You are attempting to attempting to sell more than the volume of the best bid. \n Please try again...')
                            postMessage("You are attempting to attempting to sell more than the volume of the best bid. \n Please try again...")
                        }
                        }    



                    //gets all market pairs & the corresponding data     
                    } else if (manualCommand === '7') {
                        try {
                            const marketPairs = await api.marketPairs();
                            console.log('Market Pairs', marketPairs);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Market Pairs", marketPairs)
                        } catch(error) {
                            console.error('Failed to request market pairs', error);
                        }


                    //gets and cancels first order for pair 
                    } else if (manualCommand === '4') {
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        try {
                            const userOrders = await cossIO.requestUserOrders({ symbol: pairSelected });
                            if (userOrders && userOrders.length > 0) {
                              console.log('User Orders:', userOrders);
                              var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("User Orders:", userOrders)
                              const firstOrder = userOrders[0];
                              console.log('Cancel first Order:', firstOrder);
                              var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Cancel first Order:", firstOrder)
                              
                              await cossIO.cancelOrder({ order: firstOrder });
                            }
                            console.log('---------------------------------');
                            postMessage("---------------------------------")
                          } catch (error) {
                            console.error('Failed to request user orders', error);
                          }
                    
                    //gets and returns all order history for a specified pair
                        } else if (manualCommand === '6') {
                            var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                            try {
                                const orderHistory = await cossIO.requestOrderHistory({ symbol: pairSelected });
                                console.log('Order History:', orderHistory);
                                var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Order History:", orderHistory)
                                console.log('---------------------------------');
                                postMessage("---------------------------------")
                                } catch (error) {
                                console.error('Failed to request order history', error);
                                }


                    //gets all user balances
                    //TODO: get user balances above a certain threshold (so not spammed w 0 values)
                    }else if (manualCommand === '1') {
                        try {
                            const userWallets = await cossIO.requestUserWallets();
                            console.log('User Wallet Balances:');
                            postMessage("User Wallet Balances:")
                            for (const wallet of userWallets) {
                            console.log(
                            `- '${wallet.currencyDisplayLabel} (${
                            wallet.currencyCode
                            })' :  ${wallet.availableBalance.toFixed(8)}`,
                            );
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send(
                                `- '${wallet.currencyDisplayLabel} (${
                                wallet.currencyCode
                                })' :  ${wallet.availableBalance.toFixed(8)}`,
                                );
                        }
                        } catch(error) {
                            console.error('Failed to get account balance', error);
                        }


                    // place  buy
                    }else if (manualCommand === '2'){
                        console.log('You have selected to place a buy order....')
                        postMessage("You have selected to place a buy order....")
                        console.log('----------------------------------------------');
                        postMessage("----------------------------------------------")
                        var buyType = readlineSync.question('Would you like to place a limit buy (1) or market buy (2):  ');
                        if (buyType === '1'){
                        console.log('You have selected to place a limit buy...');
                        postMessage("You have selected to place a limit buy...")
                        console.log('-----------------------------------------------');
                        postMessage("-----------------------------------------------")
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        var buyPrice = readlineSync.question('Please enter the price of your bid price in (pairing, e.g. ETH/BTC/FIAT):  ');
                        var amount = readlineSync.question('Please enter the amount you want to buy:  ');
                          try {
                            const placedOrder = await cossIO.placeOrder({
                            symbol: pairSelected,
                            side: CossIOLib.CossIOOrderSide.BUY,
                            type: CossIOLib.CossIOOrderType.LIMIT,
                            price: buyPrice,
                            amount: amount,
                            session,
                            });
                            console.log('Placed Order:', placedOrder);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Placed Order:", placedOrder)
                            postMessage("---------------------------------")
                            console.log('---------------------------------');
                        } catch (error) {
                            console.error('Failed to place limit buy order...', error);
                        }
                        }
                        else if (buyType === '2'){
                        console.log('You have selected to place a market buy...');
                        postMessage("You have selected to place a market buy...")
                        console.log('----------------------------------------------- \n');
                        postMessage("----------------------------------------------- \n")
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                            const depth = await cossIO.requestDepth({ symbol: pairSelected });
                            console.log('First Ask', depth.asks[0]);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("First Ask", depth.asks[0])
                            buyPrice = depth.asks[0].price
                        var amount = readlineSync.question('Please enter the amount you want to buy:  ');
                        if (depth.asks[0].volume >= amount)
                        {
                          try {
                            const placedOrder = await cossIO.placeOrder({
                            symbol: pairSelected,
                            side: CossIOLib.CossIOOrderSide.BUY,
                            type: CossIOLib.CossIOOrderType.LIMIT,
                            price: buyPrice,
                            amount: amount,
                            session,
                            });
                            console.log('Placed Order:', placedOrder);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Placed Order:", placedOrder)
                            console.log('---------------------------------');
                            postMessage("---------------------------------")
                        } catch (error) {
                            console.error('Failed to place market buy order...', error);
                        }
                    }
                    else {
                        console.log('You are attempting to attempting to buy more than the volume of the best ask. \n Please try again...')
                        postMessage("You are attempting to attempting to buy more than the volume of the best ask. \n Please try again...")
                    }
                        }
                    } else if (manualCommand === '8'){
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        try {
                            const tickerPairSelected = await cossIO.requestTicker({ symbol: pairSelected });
                            console.log('Ticker: ', pairSelected);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send("Ticker: ", pairSelected)
                            console.log(`Current Price: '${tickerPairSelected.price.toFixed(8)}'`);
                            var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send(`Current Price: '${tickerPairSelected.price.toFixed(8)}'`)
                            console.log('---------------------------------\n');
                            postMessage("---------------------------------\n")
                    
                    
                          } catch (error) {
                            console.error('Failed to request ticker', error);
                          }

                    } else if (manualCommand === '9'){
                        try {
                            const tickers = await cossIO.requestTickers();
                            console.log('All Tickers:');
                            postMessage("All Tickers:")
                            for (const pair of tickers) {
                                var specialPost = new XMLHttpRequest();
                            specialPost.open("POST", "http://localhost:4000/data1");
                            specialPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                            specialPost.send(`- '${pair.tradingPair.id}' - Price: '${pair.price.toFixed(8)}'`)
                              console.log(`- '${pair.tradingPair.id}' - Price: '${pair.price.toFixed(8)}'`);
                            }
                            console.log('---------------------------------');
                            postMessage("---------------------------------")
                          } catch (error) {
                            console.error('Failed to request ticker list', error);
                          }
                    
                    //quits COSSbot    
                    } else if (manualCommand === 'q' || manualCommand === 'quit'){
                        console.log(' You have selected to quit COSSbot... ');
                        postMessage("You have selected to quit COSSbot... ")
                        console.log(' Goodbye! '); 
                        postMessage("Goodbye! ")
                        child.kill()
                        process.exit(main.js)
                        


                    } else if (manualCommand !== 'b' || manualCommand !== 'back') 
                        console.log('Invalid command; Please try again...');
                        postMessage("Invalid command; Please try again...")

                }
            





        } if (tradingMode === 'a') {

            function automatedTrading(){
                console.log(' You have selected COSSbot Automated trading mode.\n');
                console.log('The bot will execute trades using the following strategy: \n1. Place a market buy of specified order size \n2. If the market rises, COSSbot will take profit at the user specified percent \n3. If the market dips, COSSbot will cost average your purchase price down by buying at user specified percent price decrease. \n4. The bot will cost average down and hold accumulated funds until it can take profit at a specified percent above average purchase price. \n5. Once the bot has taken profit the automated strategy will restart from step 1.' )
                console.log('--------------------------------------------------------\n')
                var p4 = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ') 
                var curArray = p4.split("-")
                var currencyName = curArray[0]
                var pairingName = curArray[1]
                console.log('\nIn order to protect user funds, COSSbot requires a parameter of order size. \nThis will prevent COSSbot from making buy/sell orders larger than the specified size. \nNote: User must ensure that they have adequate funds in' + pairingName + ' balance so that COSSbot can make purchases.')
				var p5 = readlineSync.questionFloat('What is the order size you want COSSbot to make in units of '+ currencyName+ ':  ') // number of COSS bought at each purchase (for both initial and averaging down)
                var p6 = '' 
                var price = readlineSync.questionFloat('Please enter the current price of '+ currencyName+ ' in '+ pairingName+': ')
                var profitPercent = readlineSync.questionFloat('At what percent would you like COSSbot to take profit (please enter as a percent, e.g. 5, 10, or 4.25, do not include % sign): ')
                var takeProfitPercent = (profitPercent/100)
                var priceDrop = readlineSync.questionFloat('At what percent would you like COSSbot to take cost average down? (please enter as a percent, e.g. 5, 10, or 4.25, do not include % sign): ')
                var priceDropPercent = (priceDrop/100)
                var priceDropNum = (priceDropPercent*price)
                var takeProfitNum = (takeProfitPercent*price)
                var p7 = priceDropNum.toFixed(8) // distance between each averagedown **in ETH**
                var p8 = takeProfitNum.toFixed(8) // distance above costaverage to take profit **in ETH**
            strat.setconfig(data1,data3,data2,p4,p5,p6,p7,p8)
            automatedsetup = true;
            }
    
        
           automatedTrading()
           
        } else if (tradingMode === 'q'){
            //implemented user selection q to exit code
            console.log(' You have selected to quit COSSbot... ');
            postMessage("You have selected to quit COSSbot... ")
            console.log(' Goodbye! '); 
            postMessage("Goodbye! ")
            child.kill()
            process.exit(main.js)
            


         } else 
            console.log('Invalid command; Please try again...')
            postMessage("Invalid command; Please try again...")
        }
    
    } catch (error) {
        console.error('Something bad happend :/', error);
      }

    } //end of function didUpdateCookie(cookie)
    
};


main();
