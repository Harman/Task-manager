let allFilters = document.querySelectorAll(".filter div");
let grid = document.querySelector(".grid");
let outerPaddingFilters = document.querySelectorAll(".filter");
let addBtn = document.querySelector(".add");
let body = document.querySelector("body");
let uid = new ShortUniqueId();
let modalVisible = false;
let deleteState = false;
let addBtnState = false;
let deleteBtn = document.querySelector(".delete");
let colorSelected = {
    pink: false,
    blue: false,
    green: false,
    black: false
};
let colors = {
    pink: "#d595aa",
    blue: "#5ecdde",
    green: "#91e6c7",
    black: "black"
};
let colorClasses = ["pink", "blue", "green", "black"];

if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify([]));
} else {
    loadTasks();
}

deleteBtn.addEventListener("click", function (e) {
    if (deleteState) {
        deleteState = false;
        e.currentTarget.classList.remove("selected-state");
    }
    else {
        deleteState = true;
        e.currentTarget.classList.add("selected-state");
    }
});

addBtn.addEventListener("click", function (e) {
    if (modalVisible)
        return;
    if (deleteBtn.classList.contains("selected-state")) {
        deleteState = false;
        deleteBtn.classList.remove("selected-state");
    }

    e.currentTarget.classList.add("selected-state");

    let modal = document.createElement("div");

    modal.classList.add("modal-container");
    modal.setAttribute("click-first", true);
    modal.innerHTML = `<div class="text-area" contenteditable>Enter Your Task Here</div>
    <div class="filter-area">
        <div class="modal-filter pink"></div>
        <div class="modal-filter blue"></div>
        <div class="modal-filter green"></div>
        <div class="modal-filter black active-modal-filter"></div>
        <button class="make-btn">
        <span class="material-icons">task_alt</span>
        </button>
    </div>`;

    let allModalFilters = modal.querySelectorAll(".modal-filter");

    for (let i = 0; i < allModalFilters.length; i++) {
        allModalFilters[i].addEventListener("click", function (e) {
            for (let j = 0; j < allModalFilters.length; j++) {
                allModalFilters[j].classList.remove("active-modal-filter");
            }
            e.currentTarget.classList.add("active-modal-filter");
        });
    }

    let t_area = modal.querySelector(".text-area");
    t_area.addEventListener("click", function (e) {
        if (modal.getAttribute("click-first") == "true") {
            t_area.innerHTML = "";
            modal.setAttribute("click-first", false);
        }
    });

    let doneBtn = modal.querySelector(".make-btn");

    doneBtn.addEventListener("click", function () {
        let area = modal.querySelector(".text-area");
        let task = area.innerText;
        let selectedModalFilter = document.querySelector(".active-modal-filter");
        let color = selectedModalFilter.classList[1];
        let id = uid();
        let ticket = document.createElement("div");
        ticket.classList.add("ticket");
        ticket.innerHTML = `<div class="ticket-color ${color}"></div>
            <div class="ticket-id">#${id}</div>
            <div class="ticket-box" contenteditable>${task}</div>`;

        saveTicketInLocalStorage(id, color, task);

        let ticketWritingArea = ticket.querySelector(".ticket-box");
        ticketWritingArea.addEventListener("input", ticketWritingAreaEvent);

        let ticketColorDiv = ticket.querySelector(".ticket-color");
        ticketColorDiv.addEventListener("click", ticketColorDivEvent);

        ticket.addEventListener("click", ticketDeleteEvent);

        document.querySelector(".add").classList.remove("selected-state");

        grid.appendChild(ticket);
        modal.remove();
        modalVisible = false;
    });

    body.appendChild(modal);
    modalVisible = true;
});


for (let i = 0; i < allFilters.length; i++) {
    allFilters[i].addEventListener("click", function (e) {
        let color = e.currentTarget.classList[0].split("-")[0];
        if (colorSelected[color] == false) {
            for(let c = 0; c < 4; c++) {
                colorSelected[colorClasses[c]] = false;
                allFilters[c].parentElement.classList.remove("selected-state");;
            }
            colorSelected[color] = true;
            allFilters[i].parentElement.classList.add("selected-state");
            let tickets = document.querySelectorAll(".ticket");
            for (let i = 0; i < tickets.length; i++) {
                let currColor = tickets[i].querySelector(".ticket-color").classList[1];
                if (currColor == color)
                    tickets[i].style.display = "block";
                else
                    tickets[i].style.display = "none";
            }
        }
        else {
            colorSelected[color] = false;
            allFilters[i].parentElement.classList.remove("selected-state");
            let tickets = document.querySelectorAll(".ticket");
            for (let i = 0; i < tickets.length; i++)
                tickets[i].style.display = "block";
        }
    });
}

function saveTicketInLocalStorage(id, color, task) {
    let reqObj = { id, color, task };
    let taskArr = JSON.parse(localStorage.getItem("tasks"));
    taskArr.push(reqObj);
    localStorage.setItem("tasks", JSON.stringify(taskArr));
}

function ticketWritingAreaEvent(e) {
    let currId = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
    let taskArr = JSON.parse(localStorage.getItem("tasks"));
    let reqIndex = -1;
    for (let i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == currId) {
            reqIndex = i;
            break;
        }
    }
    taskArr[reqIndex].task = e.currentTarget.innerText;
    localStorage.setItem("tasks", JSON.stringify(taskArr));
}

function ticketColorDivEvent(e) {
    let currColor = e.currentTarget.classList[1];
    let index = colorClasses.indexOf(currColor);
    index++;
    index = index % 4;
    e.currentTarget.classList.remove(currColor);
    e.currentTarget.classList.add(colorClasses[index]);

    let currId = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
    let taskArr = JSON.parse(localStorage.getItem("tasks"));
    let reqIndex = -1;
    for (let i = 0; i < taskArr.length; i++) {
        if (taskArr[i].id == currId) {
            reqIndex = i;
            break;
        }
    }
    taskArr[reqIndex].color = colorClasses[index];
    localStorage.setItem("tasks", JSON.stringify(taskArr));
}

function ticketDeleteEvent(e) {
    if (deleteState) {
        e.currentTarget.remove();
        let currId = e.currentTarget.querySelector(".ticket-id").innerText.split("#")[1];
        let taskArr = JSON.parse(localStorage.getItem("tasks"));

        taskArr = taskArr.filter(function (el) {
            return el.id != currId;
        });

        localStorage.setItem("tasks", JSON.stringify(taskArr));
    }
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    for (let i = 0; i < tasks.length; i++) {
        let id = tasks[i].id;
        let color = tasks[i].color;
        let task = tasks[i].task;

        let ticket = document.createElement("div");
        ticket.classList.add("ticket");
        ticket.innerHTML = `<div class="ticket-color ${color}"></div>
            <div class="ticket-id">#${id}</div>
            <div class="ticket-box" contenteditable>${task}</div>`;

        let ticketWritingArea = ticket.querySelector(".ticket-box");
        ticketWritingArea.addEventListener("input", ticketWritingAreaEvent);

        let ticketColorDiv = ticket.querySelector(".ticket-color");
        ticketColorDiv.addEventListener("click", ticketColorDivEvent);

        ticket.addEventListener("click", ticketDeleteEvent);

        grid.appendChild(ticket);
    }
}