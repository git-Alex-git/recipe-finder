function passesOverlapThreshold(totalIngredients, count, percent) {
    if (totalIngredients === 1) return percent === 100;
    if (totalIngredients <= 3) return count >= 2;
    return percent >= 50;
}

export function findCommonRecipes(results) {
    if (!Array.isArray(results) || results.length === 0) return [];

    const recipeMap = new Map();

    for (const recipes of results) {
        for (const recipe of recipes) {
            const saved = recipeMap.get(recipe.idMeal);
            if (saved) {
                saved.count++;
            } else {
                recipeMap.set(recipe.idMeal, { recipe, count: 1 });
            }
        }
    }

    return Array.from(recipeMap.values())
        .map((item) => ({
            ...item,
            percent: Math.round((item.count / results.length) * 100),
        }))
        .filter((item) =>
            passesOverlapThreshold(results.length, item.count, item.percent)
        )
        .sort((a, b) => b.percent - a.percent);
}