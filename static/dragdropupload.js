const DD = {};

let dropAreas = document.querySelectorAll(".drop-area");

DD.handleDragStart = function (e) {
  DD.dragged = e.target;
};

DD.handleDragEnd = function (e) {
  DD.dragged = null;
};

document.addEventListener("dragstart", (e) => DD.handleDragStart(e));
document.addEventListener("dragend", (e) => DD.handleDragEnd(e));

DD.preventDefaults = function (e) {
  e.preventDefault();
  e.stopPropagation();
};

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropAreas.forEach((dropArea) => {
    dropArea.addEventListener(eventName, DD.preventDefaults, false);
  });
});

DD.highlight = function (e) {
  console.log(e.dataTransfer.types, "<<<<<<");
  if (DD.dragged && DD.dragged.className === "question") return;
  e.currentTarget.classList.add("highlight");
};

["dragenter", "dragover"].forEach((eventName) => {
  dropAreas.forEach((dropArea) =>
    dropArea.addEventListener(eventName, DD.highlight, false)
  );
});

DD.unHighlight = function unHighlight(e) {
  e.currentTarget.classList.remove("highlight");
};

["dragleave", "drop"].forEach((eventName) => {
  dropAreas.forEach((dropArea) =>
    dropArea.addEventListener(eventName, DD.unHighlight, false)
  );
});

DD.uploadFiles = function (contentType, files) {
  let formData = new FormData(formElem);
  [...files].forEach((file) => formData.set(contentType, file));
  EW.saveQuestion(formData);
};

DD.handleDrop = function (e) {
  // Question or mark scheme? id of drop area is either question-images or mark-scheme-images
  let contentType = e.currentTarget.id;
  let dt = e.dataTransfer;
  let files = dt.files;
  DD.uploadFiles(contentType, files);
};


dropAreas.forEach((dropArea) =>
  dropArea.addEventListener("drop", DD.handleDrop, false)
);
