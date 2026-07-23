const errorHandler = (err, req, res, next) => {
    // Always log full stack to server console for debugging
    console.error('❌ Error:', err && err.stack ? err.stack : err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Lỗi server nội bộ';

    // MongoDB duplicate key
    if (err && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field === 'licensePlate' ? 'Biển số xe' : field} đã tồn tại trong hệ thống`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err && err.name === 'ValidationError') {
        message = Object.values(err.errors).map(e => e.message).join(', ');
        statusCode = 400;
    }

    // Mongoose CastError (invalid ObjectId)
    if (err && err.name === 'CastError') {
        message = 'ID không hợp lệ';
        statusCode = 400;
    }

    // For local debugging, include stack in JSON response as well
    res.status(statusCode).json({
        success: false,
        message,
        stack: err && err.stack ? err.stack : undefined,
    });
};

module.exports = errorHandler;