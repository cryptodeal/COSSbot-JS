"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CossIOError extends Error {
    constructor(params) {
        super();
        ({
            code: this.code,
            message: this.message,
            innerError: this.innerError,
            context: this.context,
        } = params);
        if (process.env.NODE_ENV === 'development') {
            Error.captureStackTrace(this);
        }
    }
}
exports.CossIOError = CossIOError;