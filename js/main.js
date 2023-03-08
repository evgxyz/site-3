'use strict'

document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM готов');
    initComments();
}

function initComments() {
    let commentsForm = document.getElementById('comments-form');
    
    commentsForm.addEventListener('submit', commentsFormSubmit);

    commentsForm.addEventListener('focusin', commentsFormFocusin);

    outComments();
}

function commentsFormSubmit(event) {
    console.log('submit');
    event.preventDefault();

    let form = event.currentTarget;
    
    if (validCommentsForm(form)) {
        let comment = {
            date: (new Date()).getTime(),
            name: form.name.value,
            text: form.text.value
        };
        addComment(comment);
    }
    else {
        event.stopPropagation();
    }
}

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

    return valid;
}

function commentsFormFocusin(event) {
    console.log('focusin');
    let form = event.currentTarget;

    form.name.classList.remove('input-text--error');
    form.querySelector('[name="name-msgerror"]').innerHTML = '';

    form.text.classList.remove('textarea--error');
    form.querySelector('[name="text-msgerror"]').innerHTML = '';
}

function addComment(comment) {
    console.log(comment);

    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];

    comments.push(comment);

    localStorage.setItem('comments', JSON.stringify(comments));

    let comments_str = localStorage.getItem('comments');

    console.log(comments_str);

    outComments();
}

function outComments() {
    let commentsList = document.getElementById('comments-list');

    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];

    let html = '';
    for (let comment of comments) {
        html += `<div>${comment.name}</div>`;
        html += `<div>${comment.text}</div>`;
        html += `<hr>`;
    }

    commentsList.innerHTML = html;
}