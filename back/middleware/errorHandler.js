export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, req, res, next) {

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Некорректный JSON' });
    }

    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}