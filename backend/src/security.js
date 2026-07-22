export function requireRefreshToken(req, _res, next) {
  const expectedToken = process.env.REFRESH_TOKEN;

  if (!expectedToken && process.env.NODE_ENV !== 'production') {
    next();
    return;
  }

  if (expectedToken && req.headers['x-refresh-token'] === expectedToken) {
    next();
    return;
  }

  const error = new Error('Refresh token is required for manual refresh.');
  error.status = 401;
  next(error);
}
