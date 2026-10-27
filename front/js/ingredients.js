import { showToast } from './notifications.js';

export const addedIng = [];
const MAX_INGREDIENTS = 6;
let inputForIng = document.querySelector('.inputForIng');
let btnAddIng = document.querySelector('.btnAddIng');
let forProducts = document.querySelector('.forProducts')
let divSuggestions = document.querySelector('.divSuggestion');

function checkOnRepeatings(v) {
    return addedIng.some(ing => ing.toLowerCase() === v.toLowerCase())
}

function checkGapSpaceInput(va) {
    if (va.trim() === '') { return false; }
    return true;
}

export function addingIng() {
    let value = inputForIng.value.trim()
    if (addedIng.length >= MAX_INGREDIENTS) {
        showToast(`You can add up to ${MAX_INGREDIENTS} ingredients`, 'warn');
        inputForIng.value = '';
        divSuggestions.classList.remove('active');
        return;
    }
    if (!checkGapSpaceInput(value)) {
        return;
    }

    let contIng = document.createElement('div');
    let delbtn = document.createElement('button')

    delbtn.classList.add('delBtn')
    contIng.classList.add('ingredient');

    if (!checkOnRepeatings(value)) {
        addedIng.push(value);
    } else {
        showToast('This ingredient is already added', 'warn')
        inputForIng.value = '';
        return
    }



    contIng.textContent = value;
    delbtn.textContent = 'X'

    forProducts.append(contIng);
    contIng.append(delbtn)

    delbtn.onclick = () => {
        contIng.remove();
        const index = addedIng.indexOf(value)
        if (index !== -1) {
            addedIng.splice(index, 1)
        }
    }
    console.log(addedIng)
    inputForIng.value = '';
}