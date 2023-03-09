'use strict'

//-----------------------------
// Начинаем работать с DOM, когда он готов
document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM ready');
    initComments();
}

//-----------------------------
// Ставим обработчики событий, выводим сообщения из хранилища
function initComments() {
    let commentForm = document.getElementById('comment-form');
    // отпрака формы
    commentForm.addEventListener('submit', commentFormSubmit);
    commentForm.text.addEventListener('keydown', commentFormTextKeydown);

    // фокусировка на форме
    commentForm.addEventListener('focusin', commentFormFocusin);
    commentForm.addEventListener('input', commentFormInput);

    // ввода текста в форме
    commentForm.text.addEventListener('input', commentFormTextInput);

    let commentsBox = document.getElementById('comments-box');
    commentsBox.addEventListener('click', commentsBoxClick);

    printComments();
}

//-----------------------------
// Отправка формы добавления сообщения по событию submit
function commentFormSubmit(event) {
    let form = event.currentTarget;
    submitCommentForm(form);
    event.preventDefault(); 
}

//-----------------------------
// Отправка формы добавления сообщения по событию keydown
function commentFormTextKeydown(event) {
    let form = event.currentTarget.form;
    if (event.code == 'Enter' && !event.shiftKey) {
        submitCommentForm(form);
        event.preventDefault(); 
    }
}

//-----------------------------
// Отправка формы добавления сообщения
function submitCommentForm(form) {
    let {valid, name, text, date} = validCommentForm(form);
    
    if (valid) {
        let now = (new Date()).getTime();
        let id = now + '-' + randomInt(1000000, 9999999); // уникальный id сообщения

        let comment = {
            id: id,
            name: name,
            text: text,
            date: date ?? now,
            liked: false,
        };

        addComment(comment);

        clearCommentForm(form);
    }
}

//-----------------------------
// Клик на сообщениях: лайк или удаление сообщения
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
// Фокусировка на форме
function commentFormFocusin(event) {
    let form = event.currentTarget;
    fucusCommentForm(form);
}

//-----------------------------
// Ввод на форме
function commentFormInput(event) {
    let form = event.currentTarget;
    fucusCommentForm(form);
}

//-----------------------------
// Ввод текста в форме
function commentFormTextInput(event) {
    let textarea = event.currentTarget;
    let maxlength = textarea.getAttribute('maxlength');
    console.log('maxlength='+maxlength);
    if (maxlength) {
        let count = maxlength - textarea.value.length; 
        let counterStr = `Осталось символов: ${count}`;
        textarea.form.querySelector('[name="text-counter"]').innerHTML = counterStr;
    }
}

//-----------------------------
// Убираем сообщения об ошибках
function fucusCommentForm(form) {
    form.name.classList.remove('input-text--error');
    form.querySelector('[name="name-msgerror"]').innerHTML = '';

    form.text.classList.remove('textarea--error');
    form.querySelector('[name="text-msgerror"]').innerHTML = '';

    form.date.classList.remove('input-text--error');
    form.querySelector('[name="date-msgerror"]').innerHTML = '';
}

//-----------------------------
// Валидация формы добавления комментария. Возвращает объект с набором данных
function validCommentForm(form) {
    let valid = true;

    let name = form.name.value.trim();
    if (name == '') {
        valid = false;
        form.name.classList.add('input-text--error');
        form.querySelector('[name="name-msgerror"]').innerHTML = 'Имя пустое';
    }

    let text = form.text.value.trim();
    if (text == '') {
        valid = false;
        form.text.classList.add('textarea--error');
        form.querySelector('[name="text-msgerror"]').innerHTML = 'Текст пустой';
    }

    let date = form.date.value.trim();
    if (date != '') {
        date = parseDate(form.date.value);
        if (!date) {
            valid = false;
            form.date.classList.add('input-text--error');
            form.querySelector('[name="date-msgerror"]').innerHTML = 'Дата неправильная';
        }
    }

    return { 
        'valid': valid, 
        'name': name,
        'text': text,
        'date': date,
    };
}

//-----------------------------
// Очистка формы отправки комментария после отправки
function clearCommentForm(form) {
    form.name.value = '';
    form.text.value = '';
    form.date.value = '';
}

//-----------------------------
// Вывод всех комментариев на страницу из хранилища
function printComments() {
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];

    let html = '';
    for (let comment of comments) {
        html += commentToHTML(comment);
    }

    document.getElementById('comments-box').innerHTML = html;
}

//-----------------------------
// Получение html комментария
function commentToHTML(comment) {
    let html = '';

    html += `<div class="comment" data-comment-id="${escapeHTML(comment.id)}">`;

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
// Добавление комментария
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
// Удаление комментария
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
// Лайк комментария
function likeComment(commentId) {
    // like comment to storage
    let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
    let index = comments.findIndex(x => (x.id == commentId));
    comments[index].liked = !comments[index].liked;
    localStorage.setItem('comments', JSON.stringify(comments));

    // like comment to page
    let commentsBox = document.getElementById('comments-box');
    commentsBox.querySelector(`[data-comment-id="${commentId}"]`)
        ?.querySelector(`.comment__menu-item--like`)
        ?.classList.toggle('comment__menu-item--like-liked');
}

//-----------------------------
// Парсинг даты в формате ДД.ММ.ГГГГ или ГГГГ.ММ.ДД. При неудаче возвращает null
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
// Экранирование символов для вывода в html 
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
// Случайное число от min до max
function randomInt(min, max) {
    return Math.floor(min + Math.random()*(max - min + 1));
}

//-----------------------------