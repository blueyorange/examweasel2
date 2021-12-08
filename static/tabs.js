// set up tabs
var TBS = {
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

var tabs = document.querySelectorAll('.tab-button');
TBS.select(tabs[0]);
tabs.forEach(button => button.addEventListener("click", (e) => TBS.handleClick(e)));

function initialise() {
    console.log("result " + document.querySelector('#question'));
    tabs.select(buttons[0]);
}