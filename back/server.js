import ingredients from './data/ingredients.js';
import { getIndex } from './services/mealDb.js';
import express from 'express';
import path from 'path';

import recipesRouter from './routes/recipes.js';
import { HttpError, errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 3000;
const frontPath = path.join(import.meta.dirname, '..', 'front', 'dist');

app.use(express.json());
app.use(express.static(frontPath));

app.get('/ingredients', (req, res) => {
    res.status(200).json(ingredients);
});

app.use('/recipes', recipesRouter);

app.use((req, res, next) => {
    next(new HttpError(404, 'Маршрут не найден'));
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);

    getIndex().catch((error) => {
        console.error('Ошибка прогрева индекса:', error);
    });
});