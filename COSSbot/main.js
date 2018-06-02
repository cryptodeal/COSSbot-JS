const CossIOLib = require('./../lib'); //these need to be usable from below
const cossAPI = require('./coss-api'); //these need to be usable from below


const main = async () => {
    const api = cossAPI(); //these need to be usable from the trading portion of below
    var readlineSync = require('readline-sync')
    var sync = require('synchronize');
    var util = require('util')
    var stopBot = 0;
    var data1 = 'kxclkjvlkjsdfjoiwjeif';
    var data2 = 'alsdjflkaj[weoijfpioqjweoijfiojpsdf';
    var data3 = 'as;lkdjf;lwjeoirjfpqewiojfpoijsdojflkd';

    const child = require('child_process').fork('./Server', [], { silent: true });

    console.log('COSSbot initializing...');
    console.log('');
    console.log('');
    console.log('Please follow these steps: ');
    console.log('  ');
    console.log('1. Open session of google chrome. ');
    console.log('2. Log into coss.io.');
    console.log('3. Select the exchange tab once you have logged in.');
    console.log('4. You have 30 seconds to click the COSSbot Validator Chrome Extension.');

    
  
    child.on('message', function(msg) {
        var cookie = JSON.stringify(msg);
        didUpdateCookie(cookie);
    });
    function didUpdateCookie() { //function wraps the remainder of the bot so that data1, data2, and data3 are accessible to the bot for validation
       
        console.log(cookie);
        console.log('COSSbot successfully received validation data...' + '\n' + '-----------Testing connection to coss.io -----------')
         var array = cookie.split(",");
         var data1 = array[0];
         var data2 = array[1];
         var data3 = array[2];
         console.log(data1) //these 3 values need to be accessible from the processes below aka the trading portion
         console.log(data2)
         console.log(data3)
    
        
try {
        const cossIO =  new CossIOLib.CossIO({
          cfduid: data1,
          coss: data2,
          xsrf: data3,
        });
    
    
        const session = await cossIO.requestSession(); //now getting an error here saying that reference error, unexpected identifier cossIO
        console.log('Session:', session);
        console.log('---------------------------------');

        //implement listener so Command Line waits for user to pres m, a, or q and then enter to set value to tradingMode variable.
        var tradingMode = 0;
        while (tradingMode !== 'm' || tradingMode !== 'a') {
        //var tradingMode = readlineSync.question('Use COSSbot manually (m), automatic trading (a), or quit (q)?  ');
        if (tradingMode === 'm') {
            console.log('You have selected COSSbot Manual trading mode.');
            console.log(' Manual trading mode initializing...');
            
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
                        var buyType = readlineSync.question('Would you like to place a limit buy (1) or market buy (2):  ');
                        if (buyType === '1'){
                        console.log('You have selected to place a limit buy...');
                        console.log('-----------------------------------------------');
                        console.log('');
                        var pairSelected = readlineSync.question('Enter a trading pair (currency-pairing) e.g. coss-eth:  ');
                        var sellPrice = readlineSync.question('Please enter your desired ask price per unit in pairing (e.g. ETH/BTC)  :  ');
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
                        console.log('-----------------------------------------------');
                        console.log('');
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        var amount = readlineSync.question('Please enter the amount you want to sell at market value:  ');
                          try {
                            const placedOrder = await cossIO.placeOrder({
                            symbol: pairSelected,
                            side: CossIOLib.CossIOOrderSide.SELL,
                            type: CossIOLib.CossIOOrderType.MARKET,
                            //price: buyPrice,
                            amount: amount,
                            session,
                            });
                            console.log('Placed Order:', placedOrder);
                            console.log('---------------------------------');
                        } catch (error) {
                            console.error('Failed to place market sell order...', error);
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
                        var buyPrice = readlineSync.question('Please enter the price of your bid in (pairing, e.g. ETH/BTC  :  ');
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
                        console.log('-----------------------------------------------');
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        var amount = readlineSync.question('Please enter the amount you want to buy:  ');
                          try {
                            const placedOrder = await cossIO.placeOrder({
                            symbol: pairSelected,
                            side: CossIOLib.CossIOOrderSide.BUY,
                            type: CossIOLib.CossIOOrderType.MARKET,
                            //price: buyPrice,
                            amount: amount,
                            session,
                            });
                            console.log('Placed Order:', placedOrder);
                            console.log('---------------------------------');
                        } catch (error) {
                            console.error('Failed to place market buy order...', error);
                        }
                        }
                    //} else if (manualCommand === '8'){
                    //     var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                    //    try {
                    //        const tickerCossETH = await cossIO.requestTicker({ symbol: pairSelected });
                    //        console.log('Ticker: ', pairSelected);
                    //        console.log(`Current Price: '${tickerCossETH.price.toFixed(8)}'`);
                    //        console.log('---------------------------------');
                    
                    //        const tickerCossBTC = await cossIO.requestTicker({ symbol: 'coss-btc' });
                    //        console.log('Ticker: COSS/BTC');
                    //        console.log(`Current Price: '${tickerCossBTC.price.toFixed(8)}'`);
                    //        console.log('---------------------------------');
                    //      } catch (error) {
                    //        console.error('Failed to request ticker', error);
                    //      }

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
            console.log(' You have selected COSSbot Automated trading mode. ');
            function automatedMode(){
            //Implement automatated trading functionality w/ ability to run custom strategies on chosen pairings
        }


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

