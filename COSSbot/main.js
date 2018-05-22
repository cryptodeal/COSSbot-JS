const CossIOLib = require('./../lib');
const cossAPI = require('./coss-api');
const opn = require('opn');
const express = require('express');


const main = async () => {
    const api = cossAPI();
    const app = express();
    app.get('/', (req, res) => res.send('Welcome to COSSbot localhost; Please leave this tab open. GUI functionalities coming soon.'));

    app.listen(3000, () => console.log('Example app listening on port 3000!'));
    
    console.log('COSSbot server available and running at http://localhost:3000');
    console.log('');
    //TODO: Implement COSSbot GUI on localhost server.
    console.log('Please follow these steps: ');
    console.log('  ');
    console.log('1. Open session of google chrome. ');
    console.log('2. Log into coss.io.');
    console.log('3. Select the exchange once you have logged in.');
    
    
   
    var readlineSync = require('readline-sync');
    //request Private API verification from user
    var cfduid = readlineSync.question('Please copy and paste the value for __cfduid:  ');
    var coss = readlineSync.question('Please copy and paste the value for coss.s:  ');
    var xsrf = readlineSync.question('Please copy and paste the value for XSRF-TOKEN:  ');


    try {
        const cossIO = new CossIOLib.CossIO({
          cfduid: cfduid,
          coss: coss,
          xsrf: xsrf,
        });
    
        const session = await cossIO.requestSession();
        console.log('Session:', session);
        console.log('---------------------------------');

        //implement listener so Command Line waits for user to pres m, a, or q and then enter to set value to tradingMode variable.
        var tradingMode = 0;
        while (tradingMode !== 'm' || tradingMode !== 'a') {
        var tradingMode = readlineSync.question('Use COSSbot manually (m), automatic trading (a), or quit (q)?  ');
        if (tradingMode === 'm') {
            console.log('You have selected COSSbot Manual trading mode.');
            console.log(' Manual trading mode initializing...');
            
                while (manualCommand !== 'b' || manualCommand !== 'back'){
                    var manualCommand = readlineSync.question('Please select a command for COSSbot to execute. Type help (h) to see all options:   ');
                    if (manualCommand === 'h' || manualCommand === 'help'){
                         //add available api commands and names here with else if statements for each to allow the user to execute all API calls manually
                        console.log('Here is a list of the available commands: Get Balance (g),  Cancel Order (c), Get Order History (f), Check Market Pairs (p), Pair Depth (d), Help (h), Quit (q), or XYZ ')


                    //gets highest bid and lowest ask prices for specified pair
                    } else if (manualCommand === 'd' || manualCommand === 'depth') {
                        var pairSelected = readlineSync.question('Enter a pairing (currency-pairing) e.g. coss-eth:  ');
                        try {
                            const depth = await api.depth(pairSelected);
                            console.log('First Bid', depth.bids[0]);
                            console.log('First Ask', depth.asks[0]);
                        } catch(error) {
                            console.error('Failed to request depth data', error);
                        } 


                    //gets all market pairs & the corresponding data    
                    } else if (manualCommand === 'p') {
                        try {
                            const marketPairs = await api.marketPairs();
                            console.log('Market Pairs', marketPairs);
                        } catch(error) {
                            console.error('Failed to request market pairs', error);
                        }


                    //gets and cancels first order for pair 
                    } else if (manualCommand === 'c') {
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
                        } else if (manualCommand === 'f') {
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
                    }else if (manualCommand === 'g') {
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
                    }else if (manualCommand === 'z'){
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
                        var buyPrice = readlineSync.question('Please enter the price of your bid in (pairing, e.g. ETH/BTC  :  ');
                        var amount = readlineSync.question('Please enter the amount you want to buy:  ');
                          try {
                            const placedOrder = await cossIO.placeOrder({
                            symbol: pairSelected,
                            side: CossIOLib.CossIOOrderSide.BUY,
                            type: CossIOLib.CossIOOrderType.MARKET,
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


                    
                    //quits COSSbot    
                    }else if (manualCommand === 'q' || manualCommand === 'quit'){
                        console.log(' You have selected to quit COSSbot... ');
                        console.log(' Goodbye! '); 
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
            process.exit(main.js)
         } else 
            console.log('Invalid command; Please try again...')
        }
    } catch (error) {
        console.error('Something bad happend :/', error);
      }
};

main();

