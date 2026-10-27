import { Router } from 'express';
import { asyncHandler, HttpError } from '../middleware/errorHandler.js';
import { validateIngredients } from '../utils/validation.js';
import { findRecipes } from '../services/mealDb.js';
import { findCommonRecipes } from '../services/recipeService.js';
import { rateLimit } from '../middleware/rateLimit.js';


const router = Router();

router.post(
    '/', rateLimit({ windowMs: 60_000, max: 20 }),
    asyncHandler(async (req, res) => {
        const uniqueIngredients = validateIngredients(req.body);

        const results = await Promise.all(uniqueIngredients.map(findRecipes));
        const okResults = results.filter((r) => r !== null);

        if (okResults.length === 0) {
            throw new HttpError(502, 'Сервис рецептов временно недоступен');
        }

        res.status(200).json(findCommonRecipes(okResults));
    })
);

export default router;