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
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState==4 && this.status==200) {
                var viewer = document.querySelector('#viewer-content');
                viewer.innerHTML = this.responseText;

            }
        }
        xhttp.open("GET", "/viewer?id="+id)
        xhttp.send();
    },

    activateTabs: function() {
        var buttons = document.querySelectorAll('.tab-button');
        console.log(buttons[0]);
        var tabs = [...document.querySelectorAll('.tab-button')].map(button => new Tab(button));
        tabs[0].select();
    },

    updateTabs: function() {
        this.tabs.forEach(tab => {
            if (tab.Selected = true) {tab.select}
            else {tab.deselect}
        })
    }
};

document.getElementById("new_question").addEventListener("click", EW.newQuestion);
const questions = document.querySelectorAll(".question");
EW.selectQuestion(questions[0]);
questions.forEach( (q) => {
    q.addEventListener("click", (e)=>EW.handleSelectQuestion(e));
})
