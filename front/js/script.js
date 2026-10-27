import './ingredients.js';
import './suggestions.js';
import './recipes.js';

const inputAndBtn = document.querySelector('.inputAndBtn');
const divSuggestions = document.querySelector('.divSuggestion');

document.addEventListener('click', (event) => {
    if (!inputAndBtn.contains(event.target)) {
        divSuggestions.classList.remove('active');
    }
});