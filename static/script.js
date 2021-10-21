var EW = {
    initialise: function() {
    },

    updateQuestionDB: function() {
        var xhttp = new XMLHttpRequest();
        console.log("Updating QDB...")
        xhttp.onreadystatechange = function() {
            if (this.readyState==4 && this.status==200) {
                document.getElementById("qdb").innerHTML = this.responseText;
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
                document.getElementById("qdb").innerHTML = this.responseText;
            }
        }
        xhttp.open("GET", "/newquestion");
        xhttp.send();
    },

    handleSelectQuestion: function(e) {
        console.log('clicked');
        this.selectQuestion(e.currentTarget);
    },

    selectQuestion: function(target) {
        console.log(target);
        target.classList.add('question-selected');
    }
};

console.log("Document loaded.")
EW.initialise();
document.getElementById("new_question").addEventListener("click", EW.newQuestion);
const questions = document.querySelectorAll(".question");
questions.forEach( (i) => {
    i.addEventListener("click", (e)=>EW.handleSelectQuestion(e));
})
