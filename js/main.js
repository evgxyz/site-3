'use strict'

/******************************/

document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM готов');
    initComments();
}

/******************************/

function initComments() {
    let commentForm = document.getElementById('comment-form');
    
    commentForm.addEventListener('submit', commentFormSubmit);

    commentForm.addEventListener('focusin', commentFormFocusin);

    printComments();
}

/******************************/

function commentFormSubmit(event) {
    console.log('submit');
    event.preventDefault();

    let form = event.currentTarget;

    let {valid, name, text, date} = validCommentForm(form);
    
    if (valid) {
        let comment = {
            name: name,
            text: text,
            date: date ?? (new Date()).getTime(),
        };
        addComment(comment);
    }
    else {
        event.stopPropagation();
    }
}

/******************************/

function validCommentForm(form) {
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

    let date = null;
    if (form.date.value != '') {
        let date = parseDate(form.date.value);
        if (!date) {
            valid = false;
            form.date.classList.add('input-text--error');
            form.querySelector('[name="date-msgerror"]').innerHTML = 'Дата в неправильном формате';
        }
    }

    return { 
        'valid': valid, 
        'name': form.name.value,
        'text': form.text.value,
        'date': date,
    };
}

/******************************/

function commentFormFocusin(event) {
    //console.log('focusin');
    let form = event.currentTarget;

    form.name.classList.remove('input-text--error');
    form.querySelector('[name="name-msgerror"]').innerHTML = '';

    form.text.classList.remove('textarea--error');
    form.querySelector('[name="text-msgerror"]').innerHTML = '';
}

/******************************/

function addComment(comment) {
    // add comment to storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    comments.unshift(comment);
    localStorage.setItem('comments', JSON.stringify(comments));

    // add comment to page
    let commentsBox = document.getElementById('comments-box');
    commentsBox.insertAdjacentHTML('afterbegin', commentToHTML(comment));
}

/******************************/

function deleteComment(commentId) {
    // delete comment from storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    comments.unshift(comment);
    localStorage.setItem('comments', JSON.stringify(comments));

    // delete comment from page
    let commentsBox = document.getElementById('comments-box');
    commentsBox.insertAdjacentHTML('afterbegin', commentToHTML(comment));
}

/******************************/

function printComments() {
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];

    let html = '';
    for (let comment of comments) {
        html += commentToHTML(comment);
    }

    document.getElementById('comments-box').innerHTML = html;
}

/******************************/

function commentToHTML(comment) {
    let html = '';
    html += `<div class="comment">`;
    html += `<div class="comment__name">${escapeHTML(comment.name)}</div>`;
    html += `<div class="comment__text">${escapeHTML(comment.text)}</div>`;
    html += `<div class="comment__date">${escapeHTML(comment.date)}</div>`;
    html += `<div class="comment__menu">like</div>`;
    html += `</div>`;
    return html;
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