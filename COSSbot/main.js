const CossIOLib = require('./../lib'); //these need to be usable from below
const cossAPI = require('./coss-api'); //these need to be usable from below
var cookie
var data1 
         var data2 
         var data3 


const main = async () => {
    const api = cossAPI(); //these need to be usable from the trading portion of below
    var readlineSync = require('readline-sync')
   
    
    const child = require('child_process').fork('./Server', [], { silent: true });
    
    var request = new XMLHttpRequest();
    request.open("POST", "http://localhost:8080")
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    request.send("test message")

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
        console.log('---------------------------------');

        //3- NEED THE BELOW LISTENER TO WAIT UNTIL SESSION HAS BEEN DECLARED PRIOR TO PROMPTING THE USER FOR INPUT
        //implement listener so Command Line waits for user to pres m, a, or q and then enter to set value to tradingMode variable.
        var tradingMode = 0;
        while (tradingMode !== 'm' || tradingMode !== 'a') {
        var tradingMode = readlineSync.question('Use COSSbot manually (m), automatic trading (a), or quit (q)?  ');
        if (tradingMode === 'm') {
            console.log('You have selected COSSbot Manual trading mode.');
            console.log('Manual trading mode initializing...\n');
            
                while (manualCommand !== 'b' || manualCommand !== 'back'){
                    var manualCommand = readlineSync.question('Please select a command for COSSbot to execute. Type help (h) to see all options:   ');
                    if (manualCommand === 'h' || manualCommand === 'help'){
                         //add available api commands and names here with else if statements for each to allow the user to execute all API calls manually
                        console.log('Here is a list of the available commands: Get Balance (1), Place Buy (2), Place Sell (3) Cancel Order (4), Get Pair Depth (5), Get Order History (6), Check Market Pairs (7), Get Market Pair Ticker Data (8), Get ALL Ticker Data (9), Help (h), Quit (q)... ');
                        //TODO: Implement Place Sell (3), Re-order functions by # for ease of use 

                    //gets highest bid and lowest ask prices for specified pair
                    } else if (manualCommand === '5') {
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        try {
                            //const depth = await api.depth(pairSelected);
                            const depth = await cossIO.requestDepth({ symbol: pairSelected });
                            console.log('First Bid', depth.bids[0]);
                            console.log('First Ask', depth.asks[0]);
                        } catch(error) {
                            console.error('Failed to request depth data', error);
                        } 
                            

                    //Place sell order (market or limit)   
                    } else if (manualCommand === '3'){
                        console.log('You have selected to place a sell order....')
                        console.log('----------------------------------------------');
                        console.log('');
                        var buyType = readlineSync.question('Would you like to place a limit sell (1) or market sell (2):  ');
                        if (buyType === '1'){
                        console.log('You have selected to place a limit sell...');
                        console.log('-----------------------------------------------');
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
                            console.log('---------------------------------');
                        } catch (error) {
                            console.error('Failed to place limit sell order...', error);
                        }
                        }
                        else if (buyType === '2'){
                            console.log('You have selected to place a market sell...');
                            console.log('----------------------------------------------- \n');
                            var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                                const depth = await cossIO.requestDepth({ symbol: pairSelected });
                                console.log('First Bid', depth.bids[0]);
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
                                console.log('---------------------------------');
                            } catch (error) {
                                console.error('Failed to place market sell order...', error);
                            }
                        }
                        else {
                            console.log('You are attempting to attempting to sell more than the volume of the best bid. \n Please try again...')
                            
                        }
                        }    



                    //gets all market pairs & the corresponding data     
                    } else if (manualCommand === '7') {
                        try {
                            const marketPairs = await api.marketPairs();
                            console.log('Market Pairs', marketPairs);
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
                              const firstOrder = userOrders[0];
                              console.log('Cancel first Order:', firstOrder);
                              await cossIO.cancelOrder({ order: firstOrder });
                            }
                            console.log('---------------------------------');
                          } catch (error) {
                            console.error('Failed to request user orders', error);
                          }
                    
                    //gets and returns all order history for a specified pair
                        } else if (manualCommand === '6') {
                            var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                            try {
                                const orderHistory = await cossIO.requestOrderHistory({ symbol: pairSelected });
                                console.log('Order History:', orderHistory);
                                console.log('---------------------------------');
                                } catch (error) {
                                console.error('Failed to request order history', error);
                                }


                    //gets all user balances
                    //TODO: get user balances above a certain threshold (so not spammed w 0 values)
                    }else if (manualCommand === '1') {
                        try {
                            const userWallets = await cossIO.requestUserWallets();
                            console.log('User Wallet Balances:');
                            for (const wallet of userWallets) {
                            console.log(
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
                        console.log('----------------------------------------------');
                        var buyType = readlineSync.question('Would you like to place a limit buy (1) or market buy (2):  ');
                        if (buyType === '1'){
                        console.log('You have selected to place a limit buy...');
                        console.log('-----------------------------------------------');
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
                            console.log('---------------------------------');
                        } catch (error) {
                            console.error('Failed to place limit buy order...', error);
                        }
                        }
                        else if (buyType === '2'){
                        console.log('You have selected to place a market buy...');
                        console.log('----------------------------------------------- \n');
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                            const depth = await cossIO.requestDepth({ symbol: pairSelected });
                            console.log('First Ask', depth.asks[0]);
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
                            console.log('---------------------------------');
                        } catch (error) {
                            console.error('Failed to place market buy order...', error);
                        }
                    }
                    else {
                        console.log('You are attempting to attempting to buy more than the volume of the best ask. \n Please try again...')
                        
                    }
                        }
                    } else if (manualCommand === '8'){
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        try {
                            const tickerPairSelected = await cossIO.requestTicker({ symbol: pairSelected });
                            console.log('Ticker: ', pairSelected);
                            console.log(`Current Price: '${tickerPairSelected.price.toFixed(8)}'`);
                            console.log('---------------------------------\n');
                    
                    
                          } catch (error) {
                            console.error('Failed to request ticker', error);
                          }

                    } else if (manualCommand === '9'){
                        try {
                            const tickers = await cossIO.requestTickers();
                            console.log('All Tickers:');
                            for (const pair of tickers) {
                              console.log(`- '${pair.tradingPair.id}' - Price: '${pair.price.toFixed(8)}'`);
                            }
                            console.log('---------------------------------');
                          } catch (error) {
                            console.error('Failed to request ticker list', error);
                          }
                    
                    //quits COSSbot    
                    } else if (manualCommand === 'q' || manualCommand === 'quit'){
                        console.log(' You have selected to quit COSSbot... ');
                        console.log(' Goodbye! '); 
                        child.kill()
                        process.exit(main.js)
                        


                    } else if (manualCommand !== 'b' || manualCommand !== 'back') 
                        console.log('Invalid command; Please try again...');

                }
            //Implement manual functionality w/ ability to manually call all API commands
            




//THE AUTOMATED CODING SECTION IMMEDIATELY BELOW WILL UTILIZE THE SAME COMMANDS AS THE MANUAL SECTION, BUT W A SIMPLE LOGICAL TRADING ALGO

        } else if (tradingMode === 'a') {
            console.log(' You have selected COSSbot Automated trading mode.\n');
            var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth for COSSbot to trade on:  ');
            var curArray = pairSelected.split("-")
            var currencyName = curArray[0]
            console.log('In order to protect user funds, COSSbot requires a parameter of order size. \nThis will prevent COSSbot from making buy/sell orders larger than the specified size.\n')
            var orderSize = readlineSync.question('What is the maximimum order size you want COSSbot to make in units of '+ currencyName+ ':  ') 
            
            //implement automated trading strategy here

        } else if (tradingMode === 'q'){
            //implemented user selection q to exit code
            console.log(' You have selected to quit COSSbot... ')
            console.log(' Goodbye! ') 
            child.kill()
            process.exit(main.js)
            


         } else 
            console.log('Invalid command; Please try again...')
        }
    
    } catch (error) {
        console.error('Something bad happend :/', error);
      }

    } //end of function didUpdateCookie(cookie)
    
};

main();

