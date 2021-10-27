// set up tabs
var buttons = [...document.querySelectorAll('.tab-button')];
buttons.forEach(button => button.addEventListener("click", (e) => {
    var thisButton = e.currentTarget;
    [...document.querySelectorAll('.tab-button')].map( button => {
        button.classList.remove('active');
        document.getElementById(button.dataset.target).style.display = "none";
    });
    thisButton.classList.add('active');
    tabContent = document.getElementById(e.currentTarget.dataset.target);
    tabContent.style.display = "block";
}));