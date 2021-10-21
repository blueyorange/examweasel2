var EW = {
    initialise: function() {
    },

    addQuestionEventListeners: function() {
        const questions = document.querySelectorAll(".question");
        questions.forEach( (i) => {
            i.addEventListener("click", (e)=>EW.handleSelectQuestion(e));
        })
    },

    updateQuestionDB: function() {
        var xhttp = new XMLHttpRequest();
        console.log("Updating QDB...")
        xhttp.onreadystatechange = function() {
            if (this.readyState==4 && this.status==200) {
                document.getElementById("qdb").innerHTML = this.responseText;
                EW.addQuestionEventListeners();
            }
        }
        xhttp.open("GET", "/queryquestions")
        xhttp.send();
    },

    handleNewQuestion: function() {
        this.newQuestion();
    },

    newQuestion: function() {
        console.log("new question button clicked")
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState==4 && this.status==200) {
                console.log(this.responseText);
                var list = document.querySelector('ul.questions');
                list.insertAdjacentHTML('beforeend', this.responseText);
                console.log(list);
                console.log(list.lastChild);
                var newEl = list.lastChild;
                newEl.addEventListener("click", (e) => EW.selectQuestion(e.currentTarget));
                EW.selectQuestion(newEl);
            }
        }
        xhttp.open("POST", "/newquestion")
        xhttp.send();
    },

    handleSelectQuestion: function(e) {
        console.log('clicked');
        this.selectQuestion(e.currentTarget);
    },

    selectQuestion: function(target) {
        document.querySelectorAll('.question').forEach( (i) => {
            i.classList.remove('question-selected')
        });
        target.classList.add('question-selected');
        var id = target.dataset.id;
        console.log(`Id ${id} selected.`)
    }
};

console.log("Document loaded.")
EW.initialise();
document.getElementById("new_question").addEventListener("click", EW.newQuestion);
EW.addQuestionEventListeners();

