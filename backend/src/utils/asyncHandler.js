// Wraps an async controller so a rejected promise (e.g. an awaited Mongoose
// call that throws) is passed to next(err) automatically, instead of every
// controller needing its own try/catch. Use it like:
//   router.get('/', asyncHandler(async (req, res) => { ... }));
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
