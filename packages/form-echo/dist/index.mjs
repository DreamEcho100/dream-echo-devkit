export { d as fvh } from './chunk-DIMHYLV7.mjs';

function i(e){return e instanceof Object&&"parseAsync"in e&&typeof e.parseAsync=="function"}function s(e){return e instanceof Object&&"errors"in e}function r(e){return s(e)?e.formErrors.formErrors.length>0?{message:e.formErrors.formErrors[0]}:e.errors:e instanceof Error?e:{message:"Something went wrong!"}}

export { r as errorFormatter, s as isZodError, i as isZodValidator };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map