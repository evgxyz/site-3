'use strict'

//-----------------------------

document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM готов');
    initComments();
}

//-----------------------------

function initComments() {
    let commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', commentFormSubmit);
    commentForm.addEventListener('focusin', commentFormFocusin);

    let commentsBox = document.getElementById('comments-box');
    commentsBox.addEventListener('click', commentsBoxClick);

    printComments();
}

//-----------------------------
// отправка формы
function commentFormSubmit(event) {
    event.preventDefault();

    let form = event.currentTarget;

    let {valid, name, text, date} = validCommentForm(form);
    
    if (valid) {
        let now = (new Date()).getTime();
        let randId = now + '-' + randomInt(1000000, 9999999);
        let comment = {
            id: randId,
            name: name,
            text: text,
            date: date ?? now,
            liked: false,
        };
        addComment(comment);
    }
    else {
        event.stopPropagation();
    }
}

//-----------------------------
// лайк или удаление сообщений
function commentsBoxClick(event) {
    let elem = event.target;

    let item = elem.closest('.comment__menu .comment__menu-item');
    if (!item) return;

    if (item.classList.contains('comment__menu-item--del')) {
        let parentComment = item.closest('.comment');
        if (!parentComment) return;
        let commentId = parentComment.dataset.commentId;
        if (!commentId) return;
        delComment(commentId);
    }
    else 
    if (item.classList.contains('comment__menu-item--like')) {
        let parentComment = item.closest('.comment');
        if (!parentComment) return;
        let commentId = parentComment.dataset.commentId;
        if (!commentId) return;
        likeComment(commentId);
    }
}

//-----------------------------

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

//-----------------------------
// при фокусировке на форме убираем сообщения об ошибках
function commentFormFocusin(event) {
    let form = event.currentTarget;

    form.name.classList.remove('input-text--error');
    form.querySelector('[name="name-msgerror"]').innerHTML = '';

    form.text.classList.remove('textarea--error');
    form.querySelector('[name="text-msgerror"]').innerHTML = '';

    form.date.classList.remove('input-text--error');
    form.querySelector('[name="date-msgerror"]').innerHTML = '';
}

//-----------------------------
// добавление комментария
function addComment(comment) {
    // add comment to storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    comments.unshift(comment);
    localStorage.setItem('comments', JSON.stringify(comments));

    // add comment to page
    let commentsBox = document.getElementById('comments-box');
    commentsBox.insertAdjacentHTML('afterbegin', commentToHTML(comment));
}

//-----------------------------
// удаление комментария
function delComment(commentId) {
    // delete comment from storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    let index = comments.findIndex(x => (x.id == commentId));
    comments.splice(index, 1);
    localStorage.setItem('comments', JSON.stringify(comments));

    // delete comment from page
    let commentsBox = document.getElementById('comments-box');
    commentsBox.querySelector(`[data-comment-id="${commentId}"]`)?.remove();
}

//-----------------------------
// лайк комментария
function likeComment(commentId) {
    console.log('like ' + commentId);
    // like comment to storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    let index = comments.findIndex(x => (x.id == commentId));
    comments[index].liked = !comments[index].liked;
    localStorage.setItem('comments', JSON.stringify(comments));

    console.log('like to page' + commentId);
    // like comment to page
    let commentsBox = document.getElementById('comments-box');
    commentsBox.querySelector(`[data-comment-id="${commentId}"]`)
        ?.querySelector(`.comment__menu-item--like`)
        ?.classList.toggle('comment__menu-item--like-liked');
}

//-----------------------------
// вывод всех сохраненных комментариев на страницу
function printComments() {
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];

    let html = '';
    for (let comment of comments) {
        html += commentToHTML(comment);
    }

    document.getElementById('comments-box').innerHTML = html;
}

//-----------------------------
// 
function commentToHTML(comment) {
    let html = '';

    html += `<div class="comment" data-comment-id="${comment.id}">`;

    html += `<div class="comment__name">${escapeHTML(comment.name)}</div>`;

    html += `<div class="comment__text">${escapeHTML(comment.text)}</div>`;

    html += `<div class="comment__date">${escapeHTML(comment.date)}</div>`;

    // меню с кнопками
    html += `<div class="comment__menu">`;
    html += `<div class="comment__menu-item comment__menu-item--del"></div>`;
    let likedClass = comment.liked ? ' comment__menu-item--like-liked' : '';
    html += `<div class="comment__menu-item comment__menu-item--like${likedClass}"></div>`;
    html += `</div>`;

    html += `</div>`;

    return html;
}

//-----------------------------

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

//-----------------------------

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

//-----------------------------

function randomInt(min, max) {
    return Math.floor(min + Math.random()*(max - min + 1));
}

//-----------------------------