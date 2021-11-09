// set up tabs
var tabs = {
    handleClick: function(e) {
        this.select(e.target);
    },

    select: function(thisButton) {
        [...document.querySelectorAll('.tab-button')].forEach(button => {
            button.classList.remove('active');
            document.getElementById(button.dataset.target).style.display = "none";
        });
        thisButton.classList.add('active');
        tabContent = document.getElementById(thisButton.dataset.target);
        tabContent.style.display = "block";
        currentTab = thisButton;
    },
}

var buttons = document.querySelectorAll('.tab-button');
tabs.select(buttons[0]);
buttons.forEach(button => button.addEventListener("click", (e) => tabs.handleClick(e)));

function initialise() {
    console.log("result " + document.querySelector('#question'));
    tabs.select(buttons[0]);
}