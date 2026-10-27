import ingredients from '../data/ingredients.js';
import { HttpError } from '../middleware/errorHandler.js';
const MAX_INGREDIENTS = 6;

export function validateIngredients(body) {
    if (!Array.isArray(body) || body.length === 0) {
        throw new HttpError(400, 'Ожидается непустой массив ингредиентов');
    }

    if (body.length > MAX_INGREDIENTS) {
        throw new HttpError(400, `Максимум ${MAX_INGREDIENTS} ингредиентов`);
    }

    const valid = body.every(
        (v) =>
            typeof v === 'string' &&
            v.trim() !== '' &&
            ingredients.includes(v.trim().toLowerCase())
    );

    if (!valid) {
        throw new HttpError(400, 'Некорректные или неизвестные ингредиенты');
    }

    return [...new Set(body.map((v) => v.trim().toLowerCase()))];
}