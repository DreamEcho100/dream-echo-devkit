'use strict';

var chunkI6RN77IR_js = require('./chunk-I6RN77IR.js');

function i(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function r(e){return e instanceof Object&&"errors"in e}function o(e){return r(e)?e.formErrors.formErrors.length>0?{message:e.formErrors.formErrors[0]}:e.errors:e instanceof Error?e:{message:"Something went wrong!"}}

Object.defineProperty(exports, 'fvh', {
	enumerable: true,
	get: function () { return chunkI6RN77IR_js.e; }
});
exports.errorFormatter = o;
exports.isZodError = r;
exports.isZodValidator = i;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map