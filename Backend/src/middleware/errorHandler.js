const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[Error Details]:', err);

  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({
      status: 'error',
      message,
      data: null
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for '${field}'. Please use another value.`;
    return res.status(400).json({
      status: 'error',
      message,
      data: null
    });
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({
      status: 'error',
      message,
      data: null
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token.',
      data: null
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token has expired.',
      data: null
    });
  }

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Server Internal Error',
    data: null
  });
};

module.exports = errorHandler;
