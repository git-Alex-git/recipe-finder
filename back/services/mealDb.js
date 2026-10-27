const recipeCache = new Map();

const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

async function fetchJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
            throw new Error(`Ошибка HTTP: ${res.status}`);
        }

        return await res.json();
    } finally {
        clearTimeout(timeout);
    }
}


function normalizeMeal(meal) {
    const mealIngredients = [];
    for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`]?.trim();
        if (!name) continue;
        mealIngredients.push({
            name,
            measure: meal[`strMeasure${i}`]?.trim() ?? '',
        });
    }

    return {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strArea: meal.strArea,
        strInstructions: meal.strInstructions,
        ingredients: mealIngredients,
    };
}

async function loadIndex() {
    const pages = await Promise.all(
        LETTERS.map(async (letter) => {
            const data = await fetchJson(`${MEALDB_URL}/search.php?f=${letter}`);
            return data.meals ?? [];
        })
    );

    const meals = new Map();
    for (const page of pages) {
        for (const meal of page) {
            if (!meals.has(meal.idMeal)) {
                meals.set(meal.idMeal, normalizeMeal(meal));
            }
        }
    }

    const index = new Map();
    for (const meal of meals.values()) {
        const names = new Set(meal.ingredients.map((i) => i.name.toLowerCase()));
        for (const name of names) {
            if (!index.has(name)) index.set(name, []);
            index.get(name).push(meal);
        }
    }

    return index;
}

let indexPromise = null;

export function getIndex() {
    if (!indexPromise) {
        indexPromise = loadIndex().catch((error) => {
            indexPromise = null; // при ошибке следующий запрос попробует снова
            throw error;
        });
    }
    return indexPromise;
}

export async function findRecipes(ingredient) {
    const cacheKey = ingredient.trim().toLowerCase();
    if (recipeCache.has(cacheKey)) {
        return recipeCache.get(cacheKey);
    }

    try {
        const index = await getIndex();
        const result = index.get(cacheKey) ?? [];
        recipeCache.set(cacheKey, result);
        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn(`Таймаут запроса для "${ingredient}"`);
        } else {
            console.error(`Ошибка для "${ingredient}":`, error);
        }
        return null;
    }
}