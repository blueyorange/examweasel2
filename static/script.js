var EW = {
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
                var newEl = list.lastChild;
                newEl.addEventListener("click", (e) => EW.selectQuestion(e.currentTarget));
                EW.selectQuestion(newEl);
            }
        }
        xhttp.open("POST", "/newquestion")
        xhttp.send();
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
        .then(response => response.json())
        .then(data => {
            Object.keys(data).forEach( key => 
                document.getElementById(key).innerHTML = data[key]
            )
        });
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
