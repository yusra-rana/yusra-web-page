
var display = document.getElementById("display-value");
var previousOperation = document.getElementById("previous-operation");

var firstNumber = "";
var operator = "";
var secondNumber = "";
var newNumber = false;
var memory = 0;
function appendNumber(number) {
    if (display.innerHTML == "0" || newNumber == true ||
        display.innerHTML == "Error") {
        display.innerHTML = number;
        newNumber = false;
    } else {
        display.innerHTML += number;
    }
}


function appendDecimal() {
    if (newNumber == true || display.innerHTML == "Error") {
        display.innerHTML = "0";
        newNumber = false;
    }

    if (!display.innerHTML.includes(".")) {
        display.innerHTML += ".";
    }
}


function clearAll() {
    display.innerHTML = "0";
    previousOperation.innerHTML = "";
    firstNumber = "";
    secondNumber = "";
    operator = "";
    newNumber = false;
}


function clearEntry() {
    display.innerHTML = "0";
    newNumber = false;
}


function backspace() {
    if (newNumber == true || display.innerHTML == "Error") {
        return;
    }

    if (display.innerHTML.length > 1) {
        display.innerHTML = display.innerHTML.slice(0, -1);
    } else {
        display.innerHTML = "0";
    }
}


function chooseOperator(op) {
    if (display.innerHTML == "Error") {
        return;
    }

    if (operator != "" && newNumber == false) {
        calculate();
    }

    firstNumber = display.innerHTML;
    operator = op;

    previousOperation.innerHTML = firstNumber + " " + operator;
    newNumber = true;
}


function calculate() {
    if (operator == "" || newNumber == true) {
        return;
    }

    secondNumber = display.innerHTML;

    var num1 = Number(firstNumber);
    var num2 = Number(secondNumber);
    var result;

    if (operator == "+") {
        result = num1 + num2;
    } else if (operator == "-") {
        result = num1 - num2;
    } else if (operator == "*") {
        result = num1 * num2;
    } else if (operator == "/") {
        if (num2 == 0) {
            display.innerHTML = "Error";
            previousOperation.innerHTML = "Cannot divide by zero";
            firstNumber = "";
            secondNumber = "";
            operator = "";
            newNumber = true;
            return;
        }

        result = num1 / num2;
    }

    if (!isFinite(result)) {
        display.innerHTML = "Error";
        previousOperation.innerHTML = "";
    } else {
        previousOperation.innerHTML =
            firstNumber + " " + operator + " " +
            secondNumber + " =";

        display.innerHTML = String(Number(result.toFixed(8)));
        firstNumber = result;
    }

    operator = "";
    newNumber = true;
}


function percentage() {
    var number = Number(display.innerHTML);

    display.innerHTML = number / 100;
    newNumber = true;
}


function reciprocal() {
    var number = Number(display.innerHTML);

    if (number == 0) {
        display.innerHTML = "Error";
    } else {
        display.innerHTML = 1 / number;
    }

    newNumber = true;
}


function square() {
    var number = Number(display.innerHTML);

    display.innerHTML = number * number;
    newNumber = true;
}


function squareRoot() {
    var number = Number(display.innerHTML);

    if (number < 0) {
        display.innerHTML = "Error";
    } else {
        display.innerHTML = Math.sqrt(number);
    }

    newNumber = true;
}


function toggleSign() {
    if (display.innerHTML == "0" ||
        display.innerHTML == "Error") {
        return;
    }

    display.innerHTML = Number(display.innerHTML) * -1;
}


function memoryClear() {
    memory = 0;
}


function memoryRecall() {
    display.innerHTML = memory;
    newNumber = true;
}


function memoryAdd() {
    memory = memory + Number(display.innerHTML);
}


function memorySubtract() {
    memory = memory - Number(display.innerHTML);
}


function memoryStore() {
    memory = Number(display.innerHTML);
}
