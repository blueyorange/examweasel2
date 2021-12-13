// DOM references
let qdbElem = document.querySelector("ul#qdb");
let formElem = document.querySelector("#question-form");

// request function to send requests to server
// from https://medium.com/meta-box/how-to-send-get-and-post-requests-with-javascript-fetch-api-d0685b7ee6ed
const request = (url, params = {}, method = "GET") => {
  let options = {
    method,
  };
  if (method === "GET" || method === "DELETE") {
    url += "?" + new URLSearchParams(params).toString();
  } else {
    options.body = JSON.stringify(params);
  }
  console.log(`METHOD: ${options.method}`);
  return fetch(url, options)
    .then((response) => {
      if (!response.ok) throw new Error("Server problem");
      return response.json();
    })
    .catch((err) => EW.error(err));
};
const getRequest = (url, params) => request(url, params, "GET");
const postRequest = (url, params) => request(url, params, "POST");
const putRequest = (url, params) => request(url, params, "PUT");
const deleteRequest = (url, params) => request(url, params, "DELETE");
const EW = {
  clearChildren: function (elem) {
    // clears all children of the passed element
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  },

  queryQuestions: function (query = {}) {
    return getRequest("/questions", query).then((questions) => {
      console.log(questions);
      console.log(`${questions.length} questions returned`);
      this.clearChildren(qdbElem);
      this.loadQuestionDataIntoList(questions);
    });
  },

  selectFirstQuestionInList(listElem) {
    let firstQuestion = listElem.firstElementChild;
    console.log(firstQuestion);
    this.highlightQuestion(firstQuestion);
    this.fetchQuestion(firstQuestion.dataset.id);
  },

  loadQuestionDataIntoList: function (questions) {
    questions.forEach((question) => {
      let newQuestionElem = this.createQuestionElem(question);
      // insert question into list
      qdbElem.appendChild(newQuestionElem);
    });
  },

  createQuestionElem: function (question) {
    console.log(question, "<<<<<");
    let template = document.querySelector("#question-template");
    let qElem = template.content.cloneNode(true).querySelector(".question");
    // set id to objectid
    qElem.dataset.id = question["id"];
    // set visible properties (match names of classes)
    ["topic", "marks", "description"].forEach((property) => {
      qElem.querySelector(`.${property}`).innerHTML = question[property];
    });
    qElem.addEventListener("click", (e) => this.handleClickQuestion(e));
    return qElem;
  },

  handleNewQuestion: function () {
    this.newQuestion();
  },

  newQuestion: function () {
    let newQuestion = {
      topic: "not assigned",
      marks: 0,
      description: "New Question",
    };
    postRequest("/questions", newQuestion).then((question) => {
      // inserts new question at top of list
      let newQuestionElem = EW.createQuestionElem(question);
      qdbElem.insertAdjacentElement("afterbegin", newQuestionElem);
      EW.highlightQuestion(newQuestionElem);
      EW.displayQuestion(question);
    });
  },

  getSelectedQuestionElem: function () {
    return document.querySelector(".question-selected");
  },

  deleteQuestion: function () {
    let selectedQuestionElem = EW.getSelectedQuestionElem();
    let id = selectedQuestionElem.dataset.id;
    fetch(`questions/${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (!response.ok) {
        this.error("Error: question not deleted.");
      }
      // question has been deleted from server: delete element
      let nextSelectedElement = selectedQuestionElem.nextElementSibling;
      if (!nextSelectedElement)
        nextSelectedElement = selectedQuestionElem.previousElementSibling;
      selectedQuestionElem.remove();
      if (nextSelectedElement) {
        EW.highlightQuestion(nextSelectedElement);
      } else {
        EW.clearForm();
      }
    });
  },

  clearForm: function () {
    EW.displayQuestion({});
  },

  handleClickQuestion: function (e) {
    this.highlightQuestion(e.currentTarget);
    console.log(e.currentTarget);
    this.fetchQuestion(e.currentTarget.dataset.id);
  },

  highlightQuestion(qElem) {
    document.querySelectorAll(".question").forEach((i) => {
      i.classList.remove("question-selected");
    });
    qElem.classList.add("question-selected");
  },

  fetchQuestion: function (id) {
    getRequest(`/questions/${id}`).then((data) => EW.displayQuestion(data));
  },

  displayQuestion: function (question) {
    // set form data
    // input fields
    ["id", "course", "topic", "marks"].forEach((property) => {
      let value = "";
      if (property in question) {
        value = question[property];
      }
      document.querySelector(`input#${property}`).setAttribute("value", value);
    });
    // textarea fields
    ["content", "description"].forEach((property) => {
      let value = "";
      if (property in question) {
        value = question[property];
      }
      document.querySelector(`textarea#${property}`).innerHTML = value;
    });
    // image fields
    ["question-images", "markscheme-images"].forEach((key) => {
      imageContainer = document.querySelector("#" + key);
      imageContainer.innerHTML = "";
      if (question.hasOwnProperty(key)) {
        question[key].forEach((srcString) => {
          let imgElem = document
            .querySelector("#image-template")
            .content.cloneNode(true)
            .querySelector(".question-image");
          imgElem.src = srcString;
          imageContainer.appendChild(imgElem);
        });
      }
    });
    formElem.reset();
  },

  handleGetOne: function (err, response) {
    if (err) this.error(err);
    let question = response.json();
    this.displayQuestion(question);
  },

  handleSaveQuestion: function (e) {
    e.preventDefault();
    let form = new FormData(formElem);
    this.saveQuestion(form);
  },

  saveQuestion: function (form) {
    id = form.get("id");
    fetch(`/questions/${id}`, {
      body: form,
      method: "PUT",
    })
      .then((response) => response.json())
      .then((question) => {
        // replace selected question element with updated version and display
        let updatedQuestionElem = this.createQuestionElem(question);
        this.getSelectedQuestionElem().replaceWith(updatedQuestionElem);
        this.highlightQuestion(updatedQuestionElem);
        EW.displayQuestion(question);
      });
  },

  error: function (error) {
    alert(error);
  },
};

// add event handlers
document
  .getElementById("new-question")
  .addEventListener("click", EW.newQuestion);
document
  .querySelector("#delete-question")
  .addEventListener("click", EW.deleteQuestion);
document
  .getElementById("save-question")
  .addEventListener("click", (e) => EW.handleSaveQuestion(e));
// load up database with all questions
EW.queryQuestions().then(() => EW.selectFirstQuestionInList(qdbElem));
// display first question in list
