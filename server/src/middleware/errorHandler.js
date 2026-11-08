export function notFound(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error('[api]', error);
  res.status(status).json({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
    },
  });
}
