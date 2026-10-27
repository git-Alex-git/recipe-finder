const toastBox = document.createElement('div');
toastBox.classList.add('toasts');
document.body.append(toastBox);

export function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    const icon = document.createElement('span');
    icon.classList.add('toastIcon');
    icon.textContent = '!';

    const text = document.createElement('span');
    text.textContent = message;

    toast.append(icon, text);
    toastBox.append(toast);

    const closeToast = () => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove());
    };

    toast.addEventListener('click', closeToast);
    setTimeout(closeToast, 4000);
}

export function shakeInput(inputForIng) {
    inputForIng.classList.remove('shake');
    void inputForIng.offsetWidth;
    inputForIng.classList.add('shake');
}

