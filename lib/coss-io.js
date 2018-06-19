"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urlHelper = require("url");
const qs = require("querystring");
const axios_1 = require("axios");
const coss_io_transformed_entities_1 = require("./coss-io.transformed-entities");
const coss_io_error_1 = require("./coss-io.error");
var CossIORestApiRequestVerb;
(function (CossIORestApiRequestVerb) {
    CossIORestApiRequestVerb["GET"] = "get";
    CossIORestApiRequestVerb["POST"] = "post";
    CossIORestApiRequestVerb["PUT"] = "put";
    CossIORestApiRequestVerb["PATCH"] = "patch";
    CossIORestApiRequestVerb["DELETE"] = "delete";
})(CossIORestApiRequestVerb || (CossIORestApiRequestVerb = {}));
var CossIORestApiSecurity;
(function (CossIORestApiSecurity) {
    CossIORestApiSecurity[CossIORestApiSecurity["Public"] = 0] = "Public";
    CossIORestApiSecurity[CossIORestApiSecurity["Private"] = 1] = "Private";
})(CossIORestApiSecurity || (CossIORestApiSecurity = {}));
class CossIO {
    constructor(cookie) {
        this.cookie = cookie || null;
    }
    requestSession() {
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: CossIO.API_SESSION_ENDPOINT,
            security: CossIORestApiSecurity.Private,
            transformFn: coss_io_transformed_entities_1.transformSession,
        });
    }
    requestUserWallets() {
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: CossIO.API_USER_WALLETS_ENDPOINT,
            security: CossIORestApiSecurity.Private,
            transformFn: coss_io_transformed_entities_1.transformWallets,
        });
    }
    requestUserOrders(params) {
        const { symbol } = params;
        if (!symbol || !symbol.length) {
            throw new coss_io_error_1.CossIOError({
                message: 'Symbol is missing.',
            });
        }
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: urlHelper.resolve(CossIO.API_USER_ORDERS_ENDPOINT, symbol),
            security: CossIORestApiSecurity.Private,
            transformFn: coss_io_transformed_entities_1.transformOpenOrders,
        });
    }
    requestOrderHistory(params) {
        const { symbol } = params;
        if (!symbol || !symbol.length) {
            throw new coss_io_error_1.CossIOError({
                message: 'Symbol is missing.',
            });
        }
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: urlHelper.resolve(CossIO.API_OPEN_ORDER_HISTORY_ENDPOINT, symbol),
            security: CossIORestApiSecurity.Public,
            transformFn: coss_io_transformed_entities_1.transformHistoryOrders,
        });
    }
    requestDepth(params) {
        const { symbol, level = 5 } = params;
        if (!symbol || !symbol.length) {
            throw new coss_io_error_1.CossIOError({
                message: 'Symbol is missing.',
            });
        }
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: urlHelper.resolve(CossIO.API_DEPTH_ENDPOINT, symbol),
            transformFn: (data) => coss_io_transformed_entities_1.transformDepth({ data, level }),
        });
    }
    requestTickers() {
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: CossIO.API_MARKET_PAIRS_ENDPOINT,
            transformFn: coss_io_transformed_entities_1.transformTickerList,
        });
    }
    requestTicker(params) {
        const { symbol } = params;
        if (!symbol || !symbol.length) {
            throw new coss_io_error_1.CossIOError({
                message: 'Symbol is missing.',
            });
        }
        return this.request({
            verb: CossIORestApiRequestVerb.GET,
            url: urlHelper.resolve(CossIO.API_MARKET_PAIR_ENDPOINT, symbol),
            transformFn: (data) => {
                const { currency } = data;
                return coss_io_transformed_entities_1.transformTicker(currency);
            },
        });
    }
    placeOrder(params) {
        const { symbol, side, type, price, amount, session } = params;
        if (!symbol || !symbol.length) {
            throw new coss_io_error_1.CossIOError({
                message: 'Symbol is missing.',
            });
        }
        if (!side) {
            throw new coss_io_error_1.CossIOError({
                message: 'Order Side is missing.',
            });
        }
        if (!type) {
            throw new coss_io_error_1.CossIOError({
                message: 'Order Type is missing.',
            });
        }
       // if (type === coss_io_transformed_entities_1.CossIOOrderType.MARKET) {
         //   throw new coss_io_error_1.CossIOError({
         //       message: 'Order Type MARKET is currently not supported as we have to pull the latest ASK Orderbook entry to calculate the price...which is WTF',
          //  });
      //  }
        if (type === coss_io_transformed_entities_1.CossIOOrderType.LIMIT && (!price || price <= 0.0)) {
            throw new coss_io_error_1.CossIOError({
                message: 'Price is missing.',
            });
        }
        if (!amount || amount <= 0.0) {
            throw new coss_io_error_1.CossIOError({
                message: 'Amount is missing.',
            });
        }
        if (!session) {
            throw new coss_io_error_1.CossIOError({
                message: 'Session is missing.',
            });
        }
        // NOTE: Shut the f up TS..
        const implPrice = price || 0.0;
        const orderTotalWithoutFee = implPrice * amount;
        const fee = type === coss_io_transformed_entities_1.CossIOOrderType.LIMIT ? session.makerFee : session.takerFee;
        const feeValue = (orderTotalWithoutFee * fee).toFixed(8);
        const orderTotalWithFee = orderTotalWithoutFee + feeValue;
        const payload = Object.assign({ pairId: symbol, tradeType: side, orderType: type }, (type === coss_io_transformed_entities_1.CossIOOrderType.LIMIT && { orderPrice: implPrice.toFixed(8) }), { orderAmount: amount.toFixed(8), orderTotalWithFee: orderTotalWithFee.toFixed(8), orderTotalWithoutFee: orderTotalWithoutFee.toFixed(8), feeValue: feeValue.toFixed(8), fee: fee.toFixed(8) });
        const url = side === coss_io_transformed_entities_1.CossIOOrderSide.BUY
            ? type === coss_io_transformed_entities_1.CossIOOrderType.LIMIT
                ? CossIO.API_LIMIT_ORDER_BUY_ENDPOINT
                : CossIO.API_MARKET_ORDER_BUY_ENDPOINT
            : type === coss_io_transformed_entities_1.CossIOOrderType.LIMIT
                ? CossIO.API_LIMIT_ORDER_SELL_ENDPOINT
                : CossIO.API_MARKET_ORDER_SELL_ENDPOINT;
        return this.request({
            verb: CossIORestApiRequestVerb.POST,
            url,
            payload,
            security: CossIORestApiSecurity.Private,
            transformFn: (data) => data,
        });
    }
    cancelOrder(params) {
        const { order } = params;
        if (!order) {
            throw new coss_io_error_1.CossIOError({
                message: 'Order is missing.',
            });
        }
        if (!order.id) {
            throw new coss_io_error_1.CossIOError({
                message: 'Order id is missing.',
            });
        }
        if (!order.symbol) {
            throw new coss_io_error_1.CossIOError({
                message: 'Order symbol is missing.',
            });
        }
        if (!order.side) {
            throw new coss_io_error_1.CossIOError({
                message: 'Order side is missing.',
            });
        }
        const url = urlHelper.resolve(urlHelper.resolve(urlHelper.resolve(CossIO.API_LIMIT_ORDER_CANCEL_ENDPOINT, `${order.side}/`), `${order.symbol}/`), `${order.id}/`);
        return this.request({
            verb: CossIORestApiRequestVerb.DELETE,
            url,
            security: CossIORestApiSecurity.Private,
        });
    }
    request(params) {
        const { verb, url, payload = null, security = CossIORestApiSecurity.Public, transformFn, } = params;
        if (security === CossIORestApiSecurity.Private && !this.cookie) {
            throw new coss_io_error_1.CossIOError({
                message: 'Private access requires a Cookie.',
                context: {
                    verb,
                    url,
                },
            });
        }
        const contentTypeRequired = (verb === CossIORestApiRequestVerb.POST ||
            verb === CossIORestApiRequestVerb.PUT ||
            verb === CossIORestApiRequestVerb.PATCH ||
            verb === CossIORestApiRequestVerb.DELETE) &&
            payload;
        const headers = Object.assign({ [CossIO.REQUEST_HEADER_ACCEPT_KEY]: CossIO.REQUEST_HEADER_ACCEPT_VALUE, [CossIO.REQUEST_HEADER_USER_AGENT_KEY]: CossIO.REQUEST_HEADER_USER_AGENT_VALUE, [CossIO.REQUEST_HEADER_ORIGIN_KEY]: CossIO.REQUEST_HEADER_ORIGIN_VALUE, [CossIO.REQUEST_HEADER_AUTHORITY_KEY]: CossIO.REQUEST_HEADER_AUTHORITY_VALUE, [CossIO.REQUEST_HEADER_PRAGMA_KEY]: CossIO.REQUEST_HEADER_NO_CACHE_VALUE, [CossIO.REQUEST_HEADER_CACHE_CONTROL_KEY]: CossIO.REQUEST_HEADER_NO_CACHE_VALUE }, (security === CossIORestApiSecurity.Private &&
            this.cookie && { [CossIO.REQUEST_HEADER_XSRF_TOKEN_KEY]: this.cookie.xsrf }), (security === CossIORestApiSecurity.Private &&
            this.cookie && { [CossIO.REQUEST_HEADER_COOKIE_KEY]: this.generateCookie() }), (contentTypeRequired && {
            [CossIO.REQUEST_HEADER_CONTENT_TYPE_KEY]: CossIO.REQUEST_HEADER_CONTENT_TYPE_VALUE,
        }));
        const options = Object.assign({ baseURL: CossIO.API_BASE_URL, url, method: verb }, (Object.keys(headers).length && { headers }), (payload != null && contentTypeRequired && { data: qs.stringify(payload) }), (security === CossIORestApiSecurity.Private && { withCredentials: true }));
        // console.log('Axios Options', options);
        return axios_1.default(options)
            .then((response) => {
            try {
                const result = typeof transformFn === 'function' && response.data
                    ? transformFn(response.data)
                    : null;
                if (result != null) {
                    return result;
                }
            }
            catch (error) {
                throw new coss_io_error_1.CossIOError({
                    message: 'Failed to transform request data.',
                    innerError: error,
                    context: {
                        verb,
                        url,
                    },
                });
            }
            throw new coss_io_error_1.CossIOError({
                message: 'Failed to transform request data.',
                context: {
                    verb,
                    url,
                },
            });
        })
            .catch((error) => {
            if (error.response && error.response.data) {
                return Promise.reject(coss_io_transformed_entities_1.transformError({
                    data: error.response.data,
                    context: {
                        verb,
                        url,
                    },
                }));
            }
            return Promise.reject(new coss_io_error_1.CossIOError({
                message: 'Request failed.',
                innerError: error,
                context: {
                    verb,
                    url,
                },
            }));
        });
    }
    generateCookie() {
        if (!this.cookie || !this.cookie.cfduid || !this.cookie.coss || !this.cookie.xsrf) {
            throw new coss_io_error_1.CossIOError({
                message: 'Invalid Cookie.',
                context: {
                    cookie: this.cookie,
                },
            });
        }
        return `__cfduid=${this.cookie.cfduid}; coss.s=${this.cookie.coss}; XSRF-TOKEN=${this.cookie.xsrf}`;
    }
    //in progress
    getCookie( cookie_name )
	{
	https://exchange.coss.io/exchange/coss-eth
  	var cookie_string = document.cookie ;
  	if (cookie_string.length != 0) {
    	var cookie_value = cookie_string.match ( '(^|;)[\s]*' + cookie_name + '=([^;]*)' );
    	return decodeURIComponent ( cookie_value[2] ) ;
  	}
  	return '' ;
	}
}
CossIO.API_BASE_URL = 'https://exchange.coss.io/api/';
CossIO.API_SESSION_ENDPOINT = 'session/';
CossIO.API_USER_ORDERS_ENDPOINT = 'user/orders/';
CossIO.API_USER_WALLETS_ENDPOINT = 'user/wallets/';
CossIO.API_OPEN_ORDER_HISTORY_ENDPOINT = 'order-history/';
CossIO.API_DEPTH_ENDPOINT = 'integrated-market/depth/';
CossIO.API_MARKET_PAIRS_ENDPOINT = 'integrated-market/pairs/';
CossIO.API_MARKET_PAIR_ENDPOINT = 'integrated-market/pair-data/';
CossIO.API_MARKET_ORDER_BUY_ENDPOINT = 'market-order/buy';
CossIO.API_MARKET_ORDER_SELL_ENDPOINT = 'market-order/sell';
CossIO.API_LIMIT_ORDER_BUY_ENDPOINT = 'limit-order/buy';
CossIO.API_LIMIT_ORDER_SELL_ENDPOINT = 'limit-order/sell';
CossIO.API_LIMIT_ORDER_CANCEL_ENDPOINT = 'limit-order/';
CossIO.REQUEST_HEADER_USER_AGENT_KEY = 'User-Agent';
CossIO.REQUEST_HEADER_USER_AGENT_VALUE = 'Mozilla/5.0 Chrome/63.0.3239.84 Safari/537.36';
CossIO.REQUEST_HEADER_CONTENT_TYPE_KEY = 'Content-Type';
CossIO.REQUEST_HEADER_CONTENT_TYPE_VALUE = 'application/x-www-form-urlencoded';
CossIO.REQUEST_HEADER_ACCEPT_KEY = 'Accept';
CossIO.REQUEST_HEADER_ACCEPT_VALUE = 'application/json';
CossIO.REQUEST_HEADER_ORIGIN_KEY = 'origin';
CossIO.REQUEST_HEADER_ORIGIN_VALUE = 'https://exchange.coss.io/';
CossIO.REQUEST_HEADER_AUTHORITY_KEY = 'authority';
CossIO.REQUEST_HEADER_AUTHORITY_VALUE = 'exchange.coss.io';
CossIO.REQUEST_HEADER_XSRF_TOKEN_KEY = 'x-xsrf-token';
CossIO.REQUEST_HEADER_COOKIE_KEY = 'cookie';
CossIO.REQUEST_HEADER_PRAGMA_KEY = 'pragma';
CossIO.REQUEST_HEADER_CACHE_CONTROL_KEY = 'cache-control';
CossIO.REQUEST_HEADER_NO_CACHE_VALUE = 'no-cache';
exports.CossIO = CossIO;