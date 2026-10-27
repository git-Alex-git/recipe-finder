

const PREVIEW_COUNT = 6;
import { addedIng } from './ingredients.js';
import { showToast } from './notifications.js';
const findRec = document.querySelector('.findRec');
const foundRecipes = document.querySelector('.foundRecipes');
const sources = document.querySelector('.sources');
const pickedRecip = document.querySelector('.pickedRecip');
const secREs = document.querySelector('.sectionResult');

function renderIng(cart, arr) {
    for (let i = 0; i < arr.length; i++) {
        const contIng = document.createElement('div');
        contIng.classList.add('ingr');
        contIng.textContent = `${arr[i].name} ${arr[i].measure}`.trim();
        cart.append(contIng);
    }
}

function isMatched(ingName) {
    const name = ingName.toLowerCase().trim();
    return addedIng.some(added => {
        const a = added.toLowerCase().trim();
        return name === a || name.includes(a) || a.includes(name);
    });
}

function renderPreviewIngs(container, ingredients) {

    const matchedList = [];
    const missedList = []

    for (const ing of ingredients) {
        if (isMatched(ing.name)) {
            matchedList.push(ing);
        } else {
            missedList.push(ing);
        }
    }

    const list = [...matchedList, ...missedList].slice(0, PREVIEW_COUNT)

    for (let i = 0; i < PREVIEW_COUNT; i++) {
        const item = document.createElement('div');
        item.classList.add('previewIng');

        if (i < list.length) {
            const matched = isMatched(list[i].name);
            item.classList.add(matched ? 'matched' : 'missed');

            const mark = document.createElement('span');
            mark.classList.add('mark');
            mark.textContent = matched ? '✓' : '';

            const label = document.createElement('span');
            label.classList.add('label');
            label.textContent = list[i].name;

            item.append(mark, label);
        } else {
            item.classList.add('empty');
        }

        container.append(item);
    }
}

function chooseRecipe(cart, arr) {
    cart.addEventListener('click', () => {
        document.querySelectorAll('.recipe.selected')
            .forEach((c) => c.classList.remove('selected'));
        cart.classList.add('selected');

        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = arr.recipe.strMeal;

        const grade = document.createElement('div');
        grade.classList.add('foodGrade');
        const num = document.createElement('span');
        num.classList.add('num');
        num.textContent = arr.percent + ' %';
        grade.append(num);

        const ingrs = document.createElement('div');
        ingrs.classList.add('ingrs');
        renderIng(ingrs, arr.recipe.ingredients ?? []);

        const overview = document.createElement('div');
        overview.classList.add('overview');

        const text = arr.recipe.strInstructions ?? '';
        let steps = text.split(/step\s*\d+/i).map(s => s.trim()).filter(Boolean);
        if (steps.length <= 1) {
            steps = text.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
        }

        const list = document.createElement('ol');
        for (const s of steps) {
            const li = document.createElement('li');
            li.textContent = s;
            list.append(li);
        }
        overview.append(list);

        const photo = document.createElement('div');
        photo.classList.add('photo');
        const img = document.createElement('img');
        img.src = arr.recipe.strMealThumb;
        const soursesLinks = document.createElement('div');
        soursesLinks.classList.add('soursesLinks');

        const link = document.createElement('a');
        link.textContent = 'Source';
        link.href = arr.recipe.strSource
            || `https://www.themealdb.com/meal/${arr.recipe.idMeal}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        soursesLinks.append(link);

        photo.append(img, soursesLinks);

        pickedRecip.textContent = '';
        pickedRecip.append(name, ingrs, photo, overview, grade);
    });
}

function createCartIngs(results) {
    foundRecipes.textContent = '';
    pickedRecip.textContent = '';
    secREs.hidden = false;

    if (results.length === 0) {
        pickedRecip.hidden = true;
        sources.textContent = '';
        const empty = document.createElement('div');
        empty.classList.add('emptyState');
        empty.textContent = 'No recipes found. Try adding different ingredients.';
        foundRecipes.append(empty);
        return;
    }

    pickedRecip.hidden = false;
    for (let i = 0; i < results.length && i < 3; i++) {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe');

        const foodGrade = document.createElement('div');
        foodGrade.classList.add('foodGrade');
        const num = document.createElement('span');
        num.classList.add('num');
        num.textContent = results[i].percent + ' %';
        foodGrade.append(num);

        const photo = document.createElement('div');
        photo.classList.add('photo');
        const img = document.createElement('img');
        img.src = results[i].recipe.strMealThumb;
        photo.append(img);

        const nameRecipe = document.createElement('span');
        nameRecipe.classList.add('nameRecipe');
        nameRecipe.textContent = results[i].recipe.strMeal;

        const country = document.createElement('div');
        country.classList.add('country');
        country.textContent = results[i].recipe.strArea;

        const recipeInfo = document.createElement('div');
        recipeInfo.classList.add('recipeInfo');
        const matches = document.createElement('span');
        matches.classList.add('matches');
        matches.textContent = `${results[i].count} out of ${addedIng.length} match`;
        recipeInfo.append(matches);

        const hr = document.createElement('hr');

        const ings = document.createElement('div');
        ings.classList.add('previewIngs');
        renderPreviewIngs(ings, results[i].recipe.ingredients ?? []);

        recipeCard.append(foodGrade, photo, nameRecipe, country, recipeInfo, hr, ings);
        foundRecipes.append(recipeCard);
        chooseRecipe(recipeCard, results[i]);
    }
    sources.textContent = foundRecipes.children.length;
}

function sendIng() {
    if (addedIng.length === 0) {
        showToast('Add at least one ingredient first', 'warn');
        return;
    }

    findRec.disabled = true;
    findRec.textContent = 'Searching…';

    fetch('/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addedIng)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error ${response.status}`);
            }
            return response.json();
        })
        .then(createCartIngs)
        .catch(error => {
            console.error(error);
            showToast('Could not load recipes. Please try again.');
        })
        .finally(() => {
            findRec.disabled = false;
            findRec.textContent = 'Find recipe';
        });
}

findRec.addEventListener('click', sendIng);