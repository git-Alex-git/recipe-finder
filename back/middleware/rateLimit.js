import { HttpError } from './errorHandler.js';

export function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
    const hits = new Map(); // ip -> { count, resetAt }

    // периодически чистим устаревшие записи, чтобы Map не рос бесконечно
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of hits) {
            if (entry.resetAt <= now) hits.delete(ip);
        }
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const entry = hits.get(req.ip);

        if (!entry || entry.resetAt <= now) {
            hits.set(req.ip, { count: 1, resetAt: now + windowMs });
            return next();
        }

        entry.count++;

        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return next(new HttpError(429, 'Слишком много запросов, попробуйте позже'));
        }

        next();
    };
}