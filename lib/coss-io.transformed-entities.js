"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coss_io_error_1 = require("./coss-io.error");
var CossIOTickerDirection;
(function (CossIOTickerDirection) {
    CossIOTickerDirection["UP"] = "UP";
    CossIOTickerDirection["DOWN"] = "DOWN";
})(CossIOTickerDirection = exports.CossIOTickerDirection || (exports.CossIOTickerDirection = {}));
var CossIOOrderSide;
(function (CossIOOrderSide) {
    CossIOOrderSide["BUY"] = "buy";
    CossIOOrderSide["SELL"] = "sell";
})(CossIOOrderSide = exports.CossIOOrderSide || (exports.CossIOOrderSide = {}));
var CossIOOrderType;
(function (CossIOOrderType) {
    CossIOOrderType["MARKET"] = "market";
    CossIOOrderType["LIMIT"] = "limit";
})(CossIOOrderType = exports.CossIOOrderType || (exports.CossIOOrderType = {}));
exports.transformTicker = (data) => {
    const { id, pair: fullName, first: quote, second: base, volume, volumeUsd, price, priceDirection, change, start24h, high24h, low24h, high, low, } = data;
    return {
        tradingPair: {
            id,
            fullName,
            quote,
            base,
        },
        volume: parseFloat(volume),
        volumeUsd: parseFloat(volumeUsd),
        price: parseFloat(price),
        start24h: parseFloat(start24h || '0.0'),
        high24h: parseFloat(high || high24h || '0.0'),
        low24h: parseFloat(low || low24h || '0.0'),
        direction: priceDirection.toLowerCase() === 'up' ? CossIOTickerDirection.UP : CossIOTickerDirection.DOWN,
        change: parseFloat(change),
    };
};
exports.transformTickerList = (data) => {
    const result = [];
    for (const pair of data) {
        result.push(exports.transformTicker(pair));
    }
    return result;
};
exports.transformSession = (data) => {
    const { successful, payload = {
        tx_fee_make: '0.002',
        tx_fee_take: '0.002',
        maker_fee_percentage: '0.002',
        taker_fee_percentage: '0.002',
    }, } = data;
    const { tx_fee_make, tx_fee_take, maker_fee_percentage, taker_fee_percentage } = payload;
    return {
        makerFee: parseFloat(tx_fee_make),
        makerFeePercentage: parseFloat(maker_fee_percentage),
        takerFee: parseFloat(tx_fee_take),
        takerFeePercentage: parseFloat(taker_fee_percentage),
    };
};
exports.transformDepth = (params) => {
    const { data, level = 5 } = params;
    const result = { asks: [], bids: [] };
    if (!data) {
        return result;
    }
    const transform = (values) => {
        const depth = [];
        const limit = Math.min(level, values.length);
        for (let i = 0; i < limit; ++i) {
            const value = values[i];
            depth.push({
                price: parseFloat(value[0]),
                volume: parseFloat(value[1]),
            });
        }
        return depth;
    };
    return {
        bids: transform(data[0]),
        asks: transform(data[1]),
    };
};
exports.transformHistoryOrder = (data) => {
    const { guid: id, action, amount, price, total, created_at } = data;
    return {
        id,
        side: action.toLowerCase() === 'buy' ? CossIOOrderSide.BUY : CossIOOrderSide.SELL,
        amount: parseFloat(amount),
        price: parseFloat(price),
        total: parseFloat(total),
        timestamp: new Date(created_at),
    };
};
exports.transformHistoryOrders = (data) => {
    console.log('open orders', data);
    const result = [];
    for (const order of data) {
        result.push(exports.transformHistoryOrder(order));
    }
    return result;
};
exports.transformOpenOrder = (data) => {
    const { order_guid: id, amount, price, total, created_at, type, tradeType, pair_id: symbol, } = data;
    return {
        id,
        symbol,
        side: type.toLowerCase() === 'buy' ? CossIOOrderSide.BUY : CossIOOrderSide.SELL,
        type: tradeType.toLowerCase() === 'limit-order' ? CossIOOrderType.LIMIT : CossIOOrderType.MARKET,
        amount: parseFloat(amount),
        price: parseFloat(price),
        total: parseFloat(total),
        timestamp: new Date(created_at),
    };
};
exports.transformOpenOrders = (data) => {
    const result = [];
    for (const order of data) {
        result.push(exports.transformOpenOrder(order));
    }
    return result;
};
exports.transformWallet = (data) => {
    const { guid: id, user_guid: userId, reference, cold_wallet_balance, transaction_id: transactionId = null, orders_balance, last_transaction_id: lastTransactionId = null, last_block_number, has_pending_deposit_transactions: hasPendingDepositTransactions, currencyGuid, currencyType, currencyName, currencyCode, currencyPrecision, currencyDisplayLabel, currencyIsErc20Token, currencyWithdrawalFee, currencyMinWithdrawalAmount, currencyMinDepositAmount, currencyIsWithdrawalLocked, currencyIsDepositLocked, } = data;
    return {
        id,
        userId,
        reference,
        availableBalance: parseFloat(cold_wallet_balance),
        transactionId,
        lockedBalance: parseFloat(orders_balance),
        lastTransactionId,
        lastBlockNumber: parseInt(last_block_number, 10),
        hasPendingDepositTransactions,
        currencyGuid,
        currencyType,
        currencyName,
        currencyCode,
        currencyPrecision,
        currencyDisplayLabel,
        currencyIsErc20Token,
        currencyWithdrawalFee: parseFloat(currencyWithdrawalFee),
        currencyMinWithdrawalAmount: parseFloat(currencyMinWithdrawalAmount),
        currencyMinDepositAmount: parseFloat(currencyMinDepositAmount),
        currencyIsWithdrawalLocked,
        currencyIsDepositLocked,
    };
};
exports.transformWallets = (data) => {
    const { payload = { wallets: [] } } = data;
    const { wallets = [] } = payload;
    const result = [];
    for (const wallet of wallets) {
        result.push(exports.transformWallet(wallet));
    }
    return result;
};
exports.transformError = (params) => {
    const { data, context } = params;
    const { successful = false, payload = 'Unknown error' } = data;
    return new coss_io_error_1.CossIOError({
        message: payload,
        context,
    });
};