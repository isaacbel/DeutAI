function stripMetaFields(body) {
  const data = { ...body };
  delete data.success;
  delete data.message;
  delete data.error;
  delete data.details;
  delete data.data;
  return Object.keys(data).length > 0 ? data : null;
}

function jsonResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
      const statusCode = res.statusCode || 200;
      const success = statusCode < 400;

      if (Object.prototype.hasOwnProperty.call(body, 'success')) {
        return originalJson({
          message: body.message || (body.success ? 'OK' : 'Request failed'),
          data: Object.prototype.hasOwnProperty.call(body, 'data') ? body.data : null,
          ...body,
        });
      }

      const message = body.message || (success ? 'OK' : 'Request failed');
      const data = Object.prototype.hasOwnProperty.call(body, 'data')
        ? body.data
        : success
          ? stripMetaFields(body)
          : null;

      return originalJson({
        ...body,
        success,
        message,
        data,
      });
    }

    return originalJson({
      success: res.statusCode < 400,
      message: res.statusCode < 400 ? 'OK' : 'Request failed',
      data: body ?? null,
    });
  };

  next();
}

module.exports = jsonResponse;
