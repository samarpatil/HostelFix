// Keeps every API response in the same shape, as required by the spec:
// { success, message, data } for success, { success, message } for errors.

function success(res, statusCode, message, data = null) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

function error(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { success, error };
