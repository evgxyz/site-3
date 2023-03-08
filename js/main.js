'use strict'

document.addEventListener('DOMContentLoaded', DOMReady);

function DOMReady() {
    console.log('DOM готов');
    initComments();
}

function initComments() {
    let commentForm = document.getElementById('comment-form');
    commentForm.addEventListener('submit', commentFormSubmit);
}

function commentFormSubmit(event) {
    console.log('validate:');
    for (let key in event) { 
        console.log(`${key}=${event[key]}\n`);
    }
    event.preventDefault();
}