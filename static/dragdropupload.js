let dropAreas = document.querySelectorAll(".drop-area");

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropAreas.forEach((dropArea) =>
    dropArea.addEventListener(eventName, preventDefaults, false)
  );
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
  dropAreas.forEach((dropArea) =>
    dropArea.addEventListener(eventName, highlight, false)
  );
});

["dragleave", "drop"].forEach((eventName) => {
  dropAreas.forEach((dropArea) =>
    dropArea.addEventListener(eventName, unHighlight, false)
  );
});

function highlight(e) {
  e.currentTarget.classList.add("highlight");
}

function unHighlight(e) {
  e.currentTarget.classList.remove("highlight");
}

dropAreas.forEach((dropArea) =>
  dropArea.addEventListener("drop", handleDrop, false)
);

function handleDrop(e) {
  // Question or mark scheme? id of drop area is either question-images or mark-scheme images
  let contentType = e.currentTarget.id;
  let dt = e.dataTransfer;
  let files = dt.files;
  uploadFiles(contentType, files);
}

function uploadFiles(contentType, files) {
  let formData = new FormData(formElem);
  console.log(`Saving image ${contentType}`);
  [...files].forEach((file) => formData.set(contentType, file));
  EW.saveQuestion(formData);
}
