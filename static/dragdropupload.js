let dropArea = document.querySelector('.drop-area');
let questionImagesElem = document.querySelector('#question');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files)
}

function handleFiles(files) {
    console.log(files);
    let template = document.querySelector('#image-template');
    ([...files]).forEach((file, i) => {
        let clone = template.content.cloneNode(true);
        cloneImage = clone.querySelector('#image');
        cloneImage.id = `image-question-${i}`;
        cloneImage.src = URL.createObjectURL(file);
        questionImagesElem.appendChild(clone);
    })

    //([...files]).forEach(uploadFile);
}

function uploadFile(file) {
    let url = '/upload-image'
    let formData = new FormData()

    formData.append('file', file)

    fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(() => { /* Done. Inform the user */ })
        .catch(() => { /* Error. Inform the user */ })
}