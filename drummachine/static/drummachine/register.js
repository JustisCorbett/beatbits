
window.onload = () => {
    document.getElementById('username-input').addEventListener('blur', () => {checkName()});
    document.getElementById('email-input').addEventListener('blur', () => {checkEmail()});
    document.getElementsByClassName('password').forEach((el) => {
        el.addEventListener('blur', () => {checkPasswords()})
    });
}
function checkName() {
    let input = document.getElementById('username-input').value;
    fetch(('check_name/' + input)
    ).then(response => {
        if (response.ok) {
            document.getElementById('username-input').classList.add('is-error');
            document.getElementById('username-input').classList.remove('is-success');
            document.getElementById('username-icon-success').classList.add('hidden');
            document.getElementById('username-icon-error').classList.remove('hidden');
            document.getElementById('username-text-success').classList.add('hidden');
            document.getElementById('username-text-error').classList.remove('hidden');
        } else {
            document.getElementById('username-input').classList.remove('is-error');
            document.getElementById('username-input').classList.add('is-success');
            document.getElementById('username-icon-success').classList.remove('hidden');
            document.getElementById('username-icon-error').classList.add('hidden');
            document.getElementById('username-text-success').classList.remove('hidden');
            document.getElementById('username-text-error').classList.add('hidden');
        }
    })
}

function checkEmail() {
    let email = document.getElementById('email-input').value;
    if (email.includes('@')) {
        document.getElementById('email-input').classList.remove('is-error');
        document.getElementById('email-input').classList.add('is-success');
        document.getElementById('email-icon-success').classList.remove('hidden');
        document.getElementById('email-icon-error').classList.add('hidden');
        document.getElementById('email-text-success').classList.remove('hidden');
        document.getElementById('email-text-error').classList.add('hidden');
    } else {
        document.getElementById('email-input').classList.add('is-error');
        document.getElementById('email-input').classList.remove('is-success');
        document.getElementById('email-icon-success').classList.add('hidden');
        document.getElementById('email-icon-error').classList.remove('hidden');
        document.getElementById('email-text-success').classList.add('hidden');
        document.getElementById('email-text-error').classList.remove('hidden');
    }
}

function checkPasswords() {
    const password1 = document.getElementById('password-input');
    const password2 = document.getElementById('confirm-password-input');

    if (password1.value !== password2.value) {
        password1.classList.remove('is-success');
        password2.classList.remove('is-success');
        password1.classList.add('is-danger');
        password2.classList.add('is-danger');
        document.getElementsByClassName('password-icon-success').forEach((icon) => {
            icon.classList.add('hidden');
        });
        document.getElementsByClassName('password-icon-error').forEach((icon) => {
            icon.classList.remove('hidden');
        });
        document.getElementById('password-text-error').classList.remove('hidden');
    } else {
        password1.classList.remove('is-danger');
        password2.classList.remove('is-danger');
        password1.classList.add('is-success');
        password2.classList.add('is-success');
        document.getElementsByClassName('password-icon-error').forEach((icon) => {
            icon.classList.add('hidden');
        });
        document.getElementsByClassName('password-icon-success').forEach((icon) => {
            icon.classList.remove('hidden');
        });
        document.getElementById('password-text-error').classList.add('hidden');
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}