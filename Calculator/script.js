let currentOperand = "0";
let previousOperand = "";
let operation = undefined;

const currentDisplay = document.getElementById("current-display");
const previousDisplay = document.getElementById("previous-display");
const historyLog = document.getElementById("history-log");
const notepad = document.getElementById("notepad");

notepad.value = localStorage.getItem("calculator_notes") || "";

notepad.addEventListener("input", () => {
    localStorage.setItem("calculator_notes", notepad.value);
});

function updateDisplay(animate = false) {
    if (animate) {
        currentDisplay.classList.remove("bump");
        void currentDisplay.offsetWidth; // reflow
        currentDisplay.classList.add("bump");
    }

    currentDisplay.classList.toggle("error", currentOperand === "Error");
    currentDisplay.innerText = currentOperand;

    if (operation != null) {
        previousDisplay.innerText = `${previousOperand} ${formatOperator(operation)}`;
    } else {
        previousDisplay.innerText = "";
    }
}

function appendNumber(number) {
    if (currentOperand === "Error") {
        currentOperand = "0";
    }

    if (number === "." && currentOperand.includes(".")) return;

    if (currentOperand === "0" && number !== ".") {
        currentOperand = number;
    } else {
        currentOperand += number;
    }

    updateDisplay();
}

function chooseOperator(op) {
    if (currentOperand === "" || currentOperand === "Error") return;

    if (previousOperand !== "") {
        compute(true);
    }

    operation = op;
    previousOperand = currentOperand;
    currentOperand = "";

    updateDisplay();
}

function clearScreen() {
    currentOperand = "0";
    previousOperand = "";
    operation = undefined;
    updateDisplay(true);
}

function deleteNumber() {
    if (currentOperand === "Error") {
        clearScreen();
        return;
    }

    if (currentOperand.length <= 1) {
        currentOperand = "0";
    } else {
        currentOperand = currentOperand.slice(0, -1);
    }

    updateDisplay();
}

function compute(silent = false) {
    let result;

    const previous = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    if (isNaN(previous) || !operation) return;

    if (isNaN(current)) {
        currentOperand = previousOperand;
        previousOperand = "";
        operation = undefined;
        updateDisplay();
        return;
    }

    switch (operation) {
        case "+": result = previous + current; break;
        case "-": result = previous - current; break;
        case "*": result = previous * current; break;
        case "/": result = current === 0 ? "Error" : previous / current; break;
        case "%": result = previous % current; break;
        default: return;
    }

    if (result !== "Error") {
        result = cleanResult(result);
        if (!silent) addHistoryItem(`${previousOperand} ${formatOperator(operation)} ${currentOperand}`, result);
    }

    currentOperand = result.toString();
    previousOperand = "";
    operation = undefined;

    updateDisplay(!silent);
}

function squareNumber() {
    if (currentOperand === "" || currentOperand === "Error") return;

    const value = parseFloat(currentOperand);
    const result = cleanResult(value * value);

    addHistoryItem(`${currentOperand}²`, result);

    currentOperand = result.toString();
    previousOperand = "";
    operation = undefined;

    updateDisplay(true);
}

function squareRoot() {
    if (currentOperand === "" || currentOperand === "Error") return;

    const value = parseFloat(currentOperand);

    if (value < 0) {
        currentOperand = "Error";
        updateDisplay(true);
        return;
    }

    const result = cleanResult(Math.sqrt(value));

    addHistoryItem(`√${currentOperand}`, result);

    currentOperand = result.toString();
    previousOperand = "";
    operation = undefined;

    updateDisplay(true);
}

function toggleSign() {
    if (currentOperand === "0" || currentOperand === "" || currentOperand === "Error") return;

    currentOperand = currentOperand.startsWith("-")
        ? currentOperand.slice(1)
        : "-" + currentOperand;

    updateDisplay();
}

function clearHistory() {
    historyLog.innerHTML = '<li class="history-empty">Noch keine Berechnungen</li>';
}

function addHistoryItem(expression, result) {
    // Remove empty state if present
    const empty = historyLog.querySelector(".history-empty");
    if (empty) empty.remove();

    const li = document.createElement("li");
    li.classList.add("history-item");
    li.innerHTML = `${expression}<span>= ${result}</span>`;

    li.onclick = () => {
        currentOperand = result.toString();
        previousOperand = "";
        operation = undefined;
        updateDisplay(true);
    };

    historyLog.insertBefore(li, historyLog.firstChild);

    // Limit history to 30 items
    const items = historyLog.querySelectorAll(".history-item");
    if (items.length > 30) {
        items[items.length - 1].remove();
    }
}

function cleanResult(number) {
    if (!Number.isFinite(number)) return "Error";
    if (Number.isInteger(number)) return number;
    return parseFloat(number.toFixed(10));
}

function formatOperator(op) {
    const map = { "*": "×", "/": "÷", "-": "−" };
    return map[op] || op;
}

// ── Keyboard support ──
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (document.activeElement === notepad) return;
    if (!isAllowedKey(key)) { event.preventDefault(); return; }

    if (key >= "0" && key <= "9") appendNumber(key);
    if (key === ".") appendNumber(".");
    if (["+", "-", "*", "/", "%"].includes(key)) chooseOperator(key);
    if (key === "Enter" || key === "=") { event.preventDefault(); compute(); }
    if (key === "Backspace") deleteNumber();
    if (key === "Escape") clearScreen();
    if (key === "^") squareNumber();

    highlightKey(key);
});

function isAllowedKey(key) {
    return (
        (key >= "0" && key <= "9") ||
        ["+", "-", "*", "/", "%", ".", "Enter", "=", "Backspace", "Escape", "^"].includes(key)
    );
}

function highlightKey(key) {
    const button = document.querySelector(`[data-key="${key}"]`);
    if (!button) return;

    button.classList.add("active");
    setTimeout(() => button.classList.remove("active"), 140);
}

updateDisplay();