'use strict';

var chunkHH6BPIRX_js = require('./chunk-HH6BPIRX.js');

function i(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function s(e){return e instanceof Object&&"errors"in e}function r(e){return s(e)?e.formErrors.formErrors.length>0?{message:e.formErrors.formErrors[0]}:e.errors:e instanceof Error?e:{message:"Something went wrong!"}}

Object.defineProperty(exports, 'fvh', {
	enumerable: true,
	get: function () { return chunkHH6BPIRX_js.d; }
});
exports.errorFormatter = r;
exports.isZodError = s;
exports.isZodValidator = i;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map