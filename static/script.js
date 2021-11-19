// DOM references
let qdbElem = document.querySelector('ul#qdb');
let formElem = document.querySelector('#question-form');
// Config
let questionFetchLimit = 30;
// server

// request function to send requests to server
// from https://medium.com/meta-box/how-to-send-get-and-post-requests-with-javascript-fetch-api-d0685b7ee6ed
const request = (url, params = {}, method = 'GET') => {
    let options = {
        method,
    };
    if ('GET' === method) {
        url += '?' + (new URLSearchParams(params)).toString();
    } else {
        options.body = JSON.stringify(params);
    }
    console.log(`METHOD: ${options.method}`)
    return fetch(url, options).then(response => response.json());
};
const get = (url, params) => request(url, params, 'GET');
const post = (url, params) => request(url, params, 'POST');
const put = (url, params) => request(url, params, 'PUT');

const EW = {
    queryQuestions: function(query = {}) {
        console.log('fetching questions...');
        get('/questions', query)
            .then(questions => questions.forEach(question => this.createQuestionElem(question)))
            .catch(error => this.error(error));
    },

    createQuestionElem: function(question) {
        //console.log(question);
        let template = document.querySelector('#question-template');
        let qElem = template.content.cloneNode(true).querySelector('.question');
        // set id to objectid
        qElem.dataset.id = question["_id"];
        // set visible properties (match names of classes)
        ['topic', 'marks', 'description'].forEach(property => {
                qElem.querySelector(`.${property}`).innerHTML = question[property];
            })
            // insert question into list
        qdbElem.appendChild(qElem);
        qElem.addEventListener('click', e => this.handleSelectQuestion(e))
    },

    handleNewQuestion: function() {
        this.newQuestion();
    },

    newQuestion: function() {
        let newQuestion = {
            'topic' : "not assigned",
            'marks' : 0,
            'description' : 'New Question'
    }
        post('/questions', newQuestion)
        .then(result => {
            console.log(result);
            EW.createQuestionElem(result);
        })
    },

    handleSelectQuestion: function(e) {
        this.highlightQuestion(e.currentTarget);
        this.fetchQuestion(e.currentTarget);
    },

    highlightQuestion(qElem) {
        console.log(qElem);
        document.querySelectorAll('.question').forEach((i) => {
            i.classList.remove('question-selected')
        });
        qElem.classList.add('question-selected');
    },

    fetchQuestion: function(target) {
        var id = target.dataset.id;
        console.log(`Id ${id} selected.`)
        get(`/questions/${id}`)
        .then(data => EW.loadQuestionDataIntoForm(data))
    },

    loadQuestionDataIntoForm(question) {
        // set form data
        // input fields
        ["id", "course", "topic", "marks"].forEach(property => {
            let value="";
            if (property in question) {
                value = question[property];
            } 
            document.querySelector(`input#${property}`).setAttribute('value', value);
        });
        // textarea fields
        ["content", "description"].forEach(property => {
            let value="";
            if (property in question) {
                value = question[property];
                
            }
            document.querySelector(`textarea#${property}`).innerHTML = value;
        });
        formElem.reset()
    },

    loadImages: function(id) {
        fetch(`viewer?id=${id}`)
            .then(response => response.json()
                .then(data => {
                    Object.keys(data).forEach(key =>
                        document.getElementById(key).innerHTML = data[key]
                    )
                }));
    },

    saveQuestion : function(e) {
        e.preventDefault();
        let form = new FormData(formElem);
        id = form.get('id')
        fetch(`/questions/${id}`, {
            body: form,
            method: 'PUT'
        });
    },

    error : function(error) {
        alert(`Error: ${error}`);
    }
}

// load up database with all questions
EW.queryQuestions();
document.getElementById("new-question").addEventListener("click", EW.newQuestion);
document.getElementById("save-question").addEventListener("click", e => EW.saveQuestion(e));
