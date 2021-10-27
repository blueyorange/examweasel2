// set up tabs

var tabs = {
    handleClick: function(e) {
        this.select(e.target);
    },

    update: function() {
        tabs.select(tabs.currentTab);
    },

    select: function(thisButton) {
        [...document.querySelectorAll('.tab-button')].forEach( button => {
            button.classList.remove('active');
            document.getElementById(button.dataset.target).style.display = "none";
        });
        thisButton.classList.add('active');
        tabContent = document.getElementById(thisButton.dataset.target);
        tabContent.style.display = "block";
        currentTab = thisButton;
    },

    currentTab: null
}

var buttons = document.querySelectorAll('.tab-button');
buttons.forEach(button => button.addEventListener("click", (e) => tabs.handleClick(e)));
console.log(buttons[0].dataset.target);
function initialise() {
    console.log("result "+document.querySelector('#question'));
    tabs.select(buttons[0]);
    tabs.currentTab = buttons[0];
}
setTimeout(initialise,10);
