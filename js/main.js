'use strict'

//-----------------------------
// Начинаем работать с DOM, когда он готов
document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM ready');
    initComments();
}

//-----------------------------
// Ставим обработчики событий, выводим сообщения
function initComments() {
    let commentForm = document.getElementById('comment-form');
    // отпрака формы
    commentForm.addEventListener('submit', commentFormSubmit);
    commentForm.addEventListener('keydown', commentFormKeydown);
    // ввод на форме
    commentForm.addEventListener('input', commentFormInput);
    // лайк, удалить
    let commentsBox = document.getElementById('comments-box');
    commentsBox.addEventListener('click', commentsBoxClick);

    // получаем и выводим сообщения
    printComments();
}

//-----------------------------
// Отправка формы по событию submit
function commentFormSubmit(event) {
    let form = event.currentTarget;
    event.preventDefault(); 
    submitCommentForm(form);
}

//-----------------------------
// Отправка формы по событию keydown
function commentFormKeydown(event) {
    let form = event.currentTarget;
    if (event.code == 'Enter' && (event.ctrlKey || event.shiftKey)) {
        event.preventDefault(); 
        submitCommentForm(form);
    }
}

//-----------------------------
// Отправка формы добавления сообщения
function submitCommentForm(form) {
    // валидацич полей
    let valid = true;
    // имя
    let name = form.name.value.trim();
    {
        let errorStr = '';
        if (name == '') {
            valid = false;
            errorStr = 'Имя пустое';   
        }
        else 
        if (!/^[\w\p{sc=Cyrillic}][\w\p{sc=Cyrillic}\-\s\.]+$/ui.test(name)) {
            valid = false;
            errorStr = 'Неправильный формат имени'; 
        }

        if (errorStr != '') {
            form.name.classList.add('input-text--error');
            form.querySelector('[name="name-msgerror"]').innerHTML = errorStr;
        }
    }
    // текст
    let text = form.text.value.trim();
    {
        let errorStr = '';
        if (text == '') {
            valid = false;
            errorStr = 'Текст пустой';
        }
        
        if (errorStr != '') {
            form.text.classList.add('textarea--error');
            form.querySelector('[name="text-msgerror"]').innerHTML = errorStr;
        }
    }
    // дата
    let date = null;
    {
        let dateStr = form.date.value.trim();
        let errorStr = '';
        if (dateStr != '') {
            let error;
            ({error, date} = parseDate(dateStr));
            if (error != 0) {
                valid = false;
                switch (error) {
                    case 1: errorStr += 'Неправильный формат даты'; break;
                    case 2: errorStr += 'Неправильная дата'; break;
                } 
            }
        }

        if (errorStr != '') {
            form.date.classList.add('input-text--error');
            form.querySelector('[name="date-msgerror"]').innerHTML = errorStr;
        }
    }

    if (!valid) return;
    
    // добавляем комментарий
    let now = (new Date()).getTime();
    let id = now + '-' + randomInt(1000000, 9999999); // уникальный id сообщения
    if (!date) date = now; // если дата пустая, стаим текущую

    let comment = {
        id: id,
        name: name,
        text: text,
        date: date,
        liked: false, 
        deleted: false, // помеченные к удалению сообщения должны удаляться на бэкенде
    };

    addComment(comment);

    // очистка полей формы после отправки
    //form.name.value = '';
    form.text.value = '';
    form.date.value = '';
}

//-----------------------------
// Клик на сообщениях: лайк или удаление сообщения
function commentsBoxClick(event) {
    let elem = event.target;

    let item = elem.closest('[data-action]');
    if (!item) return;

    if (item.dataset.action == 'like') {
        event.preventDefault();
        let parentComment = item.closest('.comment');
        if (!parentComment) return;
        let commentId = parentComment.dataset.commentId;
        if (!commentId) return;

        likeComment(commentId);
    }
    else
    if (item.dataset.action == 'del') {
        event.preventDefault();
        let parentComment = item.closest('.comment');
        if (!parentComment) return;
        let commentId = parentComment.dataset.commentId;
        if (!commentId) return;

        delComment(commentId);
    }
    else 
    if (item.dataset.action == 'undel') {
        event.preventDefault();
        let parentComment = item.closest('.comment');
        if (!parentComment) return;
        let commentId = parentComment.dataset.commentId;
        if (!commentId) return;

        undelComment(commentId);
    }
}

//-----------------------------
// Ввод на форме
function commentFormInput(event) {
    let elem = event.target;
    if (elem.tagName == 'INPUT') {
        elem.classList.remove('input-text--error');
        elem.form.querySelector(`[name="${elem.name}-msgerror"]`).innerHTML = '';
    }
    else
    if (elem.tagName == 'TEXTAREA') {
        elem.classList.remove('textarea--error');
        elem.form.querySelector(`[name="${elem.name}-msgerror"]`).innerHTML = '';

        if (elem.name == 'text') {
            countInputText(elem);
        }
    }
}

//-----------------------------
// Счетчик символов
function countInputText(elem) {
    let maxlength = elem.getAttribute('maxlength');
    if (maxlength) {
        let count = maxlength - elem.value.length; 
        let counterStr = `Осталось символов: ${count}`;
        elem.form.querySelector(`[name="${elem.name}-counter"]`).innerHTML = counterStr;
    }
}

//-----------------------------
// Вывод всех комментариев на страницу из хранилища
function printComments() {
    // получам комментарии из хранилища. оформлено асинхронно для имитации взаимодействия с сервером
    let getCommentsFromServer = new Promise((resolve, reject) => {
        let comments = (JSON.parse(localStorage.getItem('comments')) ?? [])
            .filter(x => !x.deleted); // фильтруем удаленные комментарии
        localStorage.setItem('comments', JSON.stringify(comments));
        resolve(comments);
    });

    getCommentsFromServer.then(comments => {
        let HTML = '';
        for (let comment of comments) {
            HTML += commentToHTML(comment);
        }
        document.getElementById('comments-box').innerHTML = HTML;
    });
}

//-----------------------------
// Получение html комментария
function commentToHTML(comment) {
    
    let HTML = `<div class="comment" data-comment-id="${escapeHTML(comment.id)}">`
        + `<div class="comment__content">`;
    // имя
    HTML += `<div class="comment__name">${escapeHTML(comment.name)}</div>`;
    // текст
    HTML += `<div class="comment__text">${escapeHTML(comment.text)}</div>`
    // дата
    let humanDateStr = humanDateFormat(comment.date);
    HTML += `<div class="comment__date">${escapeHTML(humanDateStr)}</div>`;
    // меню с кнопками удалить и лайк
    let likedClass = comment.liked ? ' comment__menu-item--like-liked' : '';
    HTML += `<div class="comment__menu">`
        + `<div data-action="del" class="comment__menu-item comment__menu-item--del"></div>`
        + `<div data-action="like" class="comment__menu-item comment__menu-item--like${likedClass}"></div>`
        + `</div>`;
    HTML += `</div></div>`;

    return HTML;
}

//-----------------------------
// Добавление комментария
function addComment(comment) {
    // добавляем комментарий на страницу
    document.getElementById('comments-box')
        .insertAdjacentHTML('afterbegin', commentToHTML(comment));

    // добавляем комментарий в хранилище. оформлено асинхронно для имитации взаимодействия с сервером
    let addCommentToServer = new Promise((resolve, reject) => {
        let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
        comments.unshift(comment);
        localStorage.setItem('comments', JSON.stringify(comments));
        resolve(true);
    });

    addCommentToServer.then( // какая-то обработка резульатов
        value => { console.log('add ok') },
        error => { console.log('add error: ' + error) }
    );
}

//-----------------------------
// Лайк/унлайк комментария
function likeComment(commentId) {
    // лайк на странице
    document.getElementById('comments-box')
        .querySelector(`[data-comment-id="${commentId}"]`)
        ?.querySelector(`[data-action="like"]`)
        ?.classList.toggle('comment__menu-item--like-liked');

    // лайк комментария в хранилище. оформлено асинхронно для имитации взаимодействия с сервером
    let likeCommentToServer = new Promise((resolve, reject) => {
        let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
        let index = comments.findIndex(x => (x.id == commentId));
        comments[index].liked = !comments[index].liked;
        localStorage.setItem('comments', JSON.stringify(comments));
        resolve(true);
    });
    
    likeCommentToServer.then( // какая-то обработка резульатов
        value => { console.log('like ok') },
        error => { console.log('like error: ' + error) }
    );
}

//-----------------------------
// Удаление комментария
function delComment(commentId) {
    // удаление комментария со страницы
    let commentElem = document.getElementById('comments-box')
        .querySelector(`[data-comment-id="${commentId}"]`);
    // скрываем содержимое комментария
    commentElem?.querySelector(`.comment__content`).classList.add('hidden');
    // добавляем кнопку "восснаовить"
    commentElem?.insertAdjacentHTML('beforeend',
        `<div data-action="undel"><a href="#" class="comment__action-link">Восстановить</a></div>`);

    // удаляем комментарий из хранилища. оформлено асинхронно для имитации взаимодействия с сервером
    let delCommentFromServer = new Promise((resolve, reject) => {
        let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
        let index = comments.findIndex(x => (x.id == commentId));
        comments[index].deleted = true;
        localStorage.setItem('comments', JSON.stringify(comments));
        resolve(true);
    });

    delCommentFromServer.then( // какая-то обработка резульатов
        value => { console.log('del ok') },
        error => { console.log('del error: ' + error) }
    );
}

//-----------------------------
// Восстановление удаленного комментария
function undelComment(commentId) {
    let commentElem = document.getElementById('comments-box')
        .querySelector(`[data-comment-id="${commentId}"]`);
    // показываем скрытое содержимое комментария
    commentElem?.querySelector(`.comment__content`).classList.remove('hidden');
    // удаляем кнопку "восснаовить"
    commentElem?.querySelector('[data-action="undel"]')?.remove();

    // восстанавливаем комментарий в хранилище. оформлено асинхронно для имитации взаимодействия с сервером
    let undelCommentFromServer = new Promise((resolve, reject) => {
        let comments = JSON.parse(localStorage.getItem('comments')) ?? [];
        let index = comments.findIndex(x => (x.id == commentId));
        comments[index].deleted = false;
        localStorage.setItem('comments', JSON.stringify(comments));
        resolve(true);
    });

    undelCommentFromServer.then( // какая-то обработка резульатов
        value => { console.log('undel ok') },
        error => { console.log('undel error: ' + error) }
    );
}

//-----------------------------
// Парсинг даты в формате ДД.ММ.ГГГГ или ГГГГ.ММ.ДД. 
// Возвращает unixtime, при неудаче null
function parseDate(str) {
    str = str.trim();
    
    let daym, month, year, hours, minutes;
    let matches;

    if (matches = str.match(/^(\d{1,2})[\.\-\s]+(\d{1,2})[\.\-\s]+(\d{4})(\s+(\d{1,2})\s*[\:\.]\s*(\d{1,2}))?$/)) {
        daym = +matches[1], 
        month = +matches[2], 
        year = +matches[3];

        hours = 0, minutes = 0;
        if (matches[4]) {
            hours = +matches[5];
            minutes = +matches[6];
        }
    }
    else
    if (matches = str.match(/^(\d{4})[\.\-\s]+(\d{1,2})[\.\-\s]+(\d{1,2})(\s+(\d{1,2})\s*[\:\.]\s*(\d{1,2}))?$/)) {
        daym = +matches[3], 
        month = +matches[2], 
        year = +matches[1];

        hours = 0, minutes = 0;
        if (matches[4]) {
            hours = +matches[5];
            minutes = +matches[6];
        }
    }
    else {
        return { 'error': 1, 'date': null }; // неправильный формат
    }

    let monthIndex = month - 1;
    let date = new Date(year, monthIndex, daym, hours, minutes);
    if (
        date.getFullYear() == year && 
        date.getMonth() == monthIndex && 
        date.getDate() == daym && 
        date.getHours() == hours && 
        date.getMinutes() == minutes 
    ) {
        return { 'error': 0, 'date': date.getTime() }; // ok
    }
    else {
        return { 'error': 2, 'date': null }; // дата не реальная
    }
}

//-----------------------------
// Форматирует дату
function humanDateFormat(unixTime) {
    let date = new Date(unixTime);
    let dateTime = date.getTime();

    let now = new Date();
    let todayTime = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();

    let dateStr = '';
    if (dateTime >= todayTime) {
        dateStr += 'сегодня';
    }
    else
    if (dateTime >= todayTime - 24*60*60*1000) {
        dateStr += 'вчера';
    }
    else {
        dateStr += `${date.getDate()} ${LangFormat.monthNameOf(date.getMonth())} ${date.getFullYear()}`;
    }

    let hoursStr = date.getHours().toString().padStart(2, '0');
    let minutesStr = date.getMinutes().toString().padStart(2, '0');
    dateStr += `, ${hoursStr}:${minutesStr}`;
    
    return dateStr;
}

//-----------------------------
class LangFormat {
    static locale = {
        ru: {
            monthNameArr: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Окрябрь', 'Ноябрь', 'Декабрь'],
            monthNameOfArr: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'окрября', 'ноября', 'декабря'],
            monthNameShortArr: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            weekdayNameShortArr: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
        },

        en: {
            monthNameArr: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthNameShortArr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdayNameShortArr: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        },
    };

    static monthName(month, lang) {
        lang = lang && (lang in LangFormat.locale) ? lang : 'ru';
        return LangFormat.locale[lang].monthNameArr[month - 1];
    };

    static monthNameOf(month, lang) {
        lang = lang && (lang in LangFormat.locale) ? lang : 'ru';
        return LangFormat.locale[lang].monthNameOfArr[month - 1];
    };

    static monthNameShort(month, lang) {
        lang = lang && (lang in LangFormat.locale) ? lang : 'ru';
        return LangFormat.locale[lang].monthNameShortArr[month - 1];
    };

    static weekdayNameShort(day, lang) {
        lang = lang && (lang in LangFormat.locale) ? lang : 'ru';
        let dayIndex = day > 0 ? day - 1 : 6;
        return LangFormat.locale[lang].weekdayNameShortArr[dayIndex];
    };
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