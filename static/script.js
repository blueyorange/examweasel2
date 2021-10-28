var EW = {
    updateQuestionDB: function() {
        fetch('/queryquestions')
        .then(response => response.text)
        .then(text => document.getElementById("qdb").innerHTML = text)
    },

    handleNewQuestion: function() {
        this.newQuestion();
    },

    newQuestion: function() {
        fetch('/newquestion')
        .then(response => response.text)
        .then(html => {
            var list = document.querySelector('ul.questions');
            list.insertAdjacentHTML('beforeend', html);
            var newEl = list.lastChild;
            newEl.addEventListener("click", (e) => EW.selectQuestion(e.currentTarget));
            EW.selectQuestion(newEl);
         })
    },

    handleSelectQuestion: function(e) {
        this.selectQuestion(e.currentTarget);
    },

    selectQuestion: function(target) {
        document.querySelectorAll('.question').forEach( (i) => {
            i.classList.remove('question-selected')
        });
        target.classList.add('question-selected');
        var id = target.dataset.id;
        console.log(`Id ${id} selected.`)
        this.viewer(id);
    },

    viewer: function(id) {
        fetch(`viewer?id=${id}`)
        .then(response => response.json()
        .then(data => {
            Object.keys(data).forEach( key => 
                document.getElementById(key).innerHTML = data[key]
            )
        }));
    }
}

document.getElementById("new_question").addEventListener("click", EW.newQuestion);
const questions = document.querySelectorAll(".question");
EW.selectQuestion(questions[0]);
questions.forEach( (q) => {
    q.addEventListener("click", (e) => {
        EW.handleSelectQuestion(e);
    });
})
