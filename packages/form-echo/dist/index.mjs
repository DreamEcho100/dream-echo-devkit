export { e as fvh } from './chunk-DFB4Y4S4.mjs';

function i(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function r(e){return e instanceof Object&&"errors"in e}function o(e){return r(e)?e.formErrors.formErrors.length>0?{message:e.formErrors.formErrors[0]}:e.errors:e instanceof Error?e:{message:"Something went wrong!"}}

export { o as errorFormatter, r as isZodError, i as isZodValidator };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map