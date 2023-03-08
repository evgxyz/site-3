'use strict'

/******************************/

document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM готов');
    initComments();
}

/******************************/

function initComments() {
    let commentsForm = document.getElementById('comments-form');
    
    commentsForm.addEventListener('submit', commentsFormSubmit);

    commentsForm.addEventListener('focusin', commentsFormFocusin);

    printComments();
}

/******************************/

function commentsFormSubmit(event) {
    console.log('submit');
    event.preventDefault();

    let form = event.currentTarget;
    
    if (validCommentsForm(form)) {
        let comment = {
            name: form.name.value,
            text: form.text.value,
            date: (form.date.value != '') ? form.date.value : (new Date()).getTime(),
        };
        addComment(comment);
    }
    else {
        event.stopPropagation();
    }
}

/******************************/

function validCommentsForm(form) {
    let valid = true;

    if (form.name.value == '') {
        valid = false;
        form.name.classList.add('input-text--error');
        form.querySelector('[name="name-msgerror"]').innerHTML = 'Имя пустое';
    }

    if (form.text.value == '') {
        valid = false;
        form.text.classList.add('textarea--error');
        form.querySelector('[name="text-msgerror"]').innerHTML = 'Текст пустой';
    }

    if (form.date.value != '') {
        let date = parseDate(form.date.value);
        if (!date) {
            valid = false;
            form.date.classList.add('input-text--error');
            form.querySelector('[name="date-msgerror"]').innerHTML = 'Дата в неправильном формате';
        }
    }

    return valid;
}

/******************************/

function commentsFormFocusin(event) {
    //console.log('focusin');
    let form = event.currentTarget;

    form.name.classList.remove('input-text--error');
    form.querySelector('[name="name-msgerror"]').innerHTML = '';

    form.text.classList.remove('textarea--error');
    form.querySelector('[name="text-msgerror"]').innerHTML = '';
}

/******************************/

function addComment(comment) {
    // add to storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    comments.unshift(comment);
    localStorage.setItem('comments', JSON.stringify(comments));

    //add to page
    printComments();
    //let commentsBox = document.getElementById('comments-box');
}

/******************************/

function printComments() {
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];

    let html = '';
    for (let comment of comments) {
        html += `<div class="comment">`;
        html += `<div class="comment__name">${escapeHTML(comment.name)}</div>`;
        html += `<div class="comment__text">${escapeHTML(comment.text)}</div>`;
        html += `<div class="comment__date">${escapeHTML(comment.date)}</div>`;
        html += `<div class="comment__menu">like</div>`;
        html += `</div>`;
    }

    document.getElementById('comments-box').innerHTML = html;
}

/******************************/

function parseDate(str) {
    str = str.trim();
    
    let matches;

    matches = str.match(/^(\d{2})[\.\-\s]+(\d{2})[\.\-\s]+(\d{4})$/);
    if (matches) {
        let d, m, y; 
        d = +matches[1];
        m = +matches[2];
        y = +matches[3];

        let date = new Date(y, m - 1, d);
        if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
            return date;
        }
    }

    matches = str.match(/^(\d{4})[\.\-\s]+(\d{2})[\.\-\s]+(\d{2})$/);
    if (matches) {
        let d, m, y; 
        y = +matches[1];
        m = +matches[2];
        d = +matches[3];

        let date = new Date(y, m - 1, d);
        if (date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d) {
            return date;
        }
    }

    return null;
}

/******************************/

function escapeHTML(str) {
    return (
        String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\</g, '&lt;')
        .replace(/\>/g, '&gt')
    );
}