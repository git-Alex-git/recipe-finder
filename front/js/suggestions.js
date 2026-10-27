import Fuse from 'fuse.js';
import { showToast, shakeInput } from './notifications.js';
import { addingIng } from './ingredients.js';

export let ingredients = [];
let fuse;
let btnAddIng = document.querySelector('.btnAddIng');



let inputForIng = document.querySelector('.inputForIng');
let divSuggestions = document.querySelector('.divSuggestion');
const inputAndBtn = document.querySelector('.inputAndBtn');
let selectedSuggestionIndex = -1;
fetch('/ingredients')
    .then(response => {
        if (!response.ok) {
            throw new Error('ошибка сети')
        }
        return response.json()
    })
    .then((data) => {
        ingredients = data;

        const options = {
            threshold: 0.4
        };

        fuse = new Fuse(ingredients, options);
    })
    .catch(error => {
        showToast('Could not load the ingredients list. Please refresh the page.');
    });

function checkIngInArr(value) {
    let res = fuse.search(value)
    return res.map(i => i.item)
}
function tryAddIngredient() {
    const value = inputForIng.value.trim().toLowerCase();

    if (!value) return;

    if (!ingredients.includes(value)) {
        showToast('Pick an ingredient from the suggestions', 'warn');
        shakeInput(inputForIng);
        return;
    }

    inputForIng.value = value; // чтобы в список попал нижний регистр
    addingIng();
    divSuggestions.classList.remove('active');
    selectedSuggestionIndex = -1;
}

function keysMove(event) {
    if (event.key === 'Enter') {
        event.preventDefault();

        const suggestions = divSuggestions.querySelectorAll('.divSugg');

        // если пункт выбран стрелками, берём его
        if (selectedSuggestionIndex !== -1 && suggestions[selectedSuggestionIndex]) {
            inputForIng.value = suggestions[selectedSuggestionIndex].textContent;
        }

        tryAddIngredient();
        return;
    }

    const suggestions = divSuggestions.querySelectorAll('.divSugg');

    if (!divSuggestions.classList.contains('active') || suggestions.length === 0) {
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedSuggestionIndex++;
        if (selectedSuggestionIndex >= suggestions.length) {
            selectedSuggestionIndex = 0;
        }
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedSuggestionIndex--;
        if (selectedSuggestionIndex < 0) {
            selectedSuggestionIndex = suggestions.length - 1;
        }
    } else if (event.key === 'Escape') {
        divSuggestions.classList.remove('active');
        selectedSuggestionIndex = -1;
        return;
    }

    suggestions.forEach((suggestion, index) => {
        suggestion.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

inputForIng.addEventListener('input', () => {
    divSuggestions.textContent = '';
    selectedSuggestionIndex = -1;

    let realTimeVal = inputForIng.value.trim();

    if (!realTimeVal || !fuse) {
        divSuggestions.classList.remove('active');
        return;
    }

    let suggestions = checkIngInArr(realTimeVal);

    if (suggestions.length === 0) {
        divSuggestions.classList.remove('active');
        return;
    }

    divSuggestions.classList.add('active');

    for (let i = 0; i < suggestions.length; i++) {
        let divSugg = document.createElement('div');
        divSugg.classList.add('divSugg');
        divSugg.textContent = suggestions[i];

        divSuggestions.append(divSugg);
        divSugg.addEventListener('mouseenter', () => {
            selectedSuggestionIndex = i;

            const allSuggestions = divSuggestions.querySelectorAll('.divSugg');

            allSuggestions.forEach((suggestion, index) => {
                suggestion.classList.toggle(
                    'selected',
                    index === selectedSuggestionIndex
                );
            });
        });

        divSugg.addEventListener('click', () => {
            inputForIng.value = divSugg.textContent;
            addingIng();
            divSuggestions.classList.remove('active');
            selectedSuggestionIndex = -1;
        });
    }
});

inputForIng.addEventListener('keydown', keysMove);

btnAddIng.addEventListener('click', (event) => {
    event.preventDefault();

    const value = inputForIng.value.trim();

    const ingredient = ingredients.find(
        ing => ing.toLowerCase() === value.toLowerCase()
    );

    if (!ingredient) {
        showToast('Pick an ingredient from the suggestions', 'warn');
        shakeInput(inputForIng);
        return;
    }

    addingIng();
    divSuggestions.classList.remove('active');
});

btnAddIng.addEventListener('click', (event) => {
    event.preventDefault();
    tryAddIngredient();
});