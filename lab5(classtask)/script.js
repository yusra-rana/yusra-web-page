
function changeTheme(name) {
    document.getElementById("themeFile").href = name + ".css";
    document.getElementById("message").textContent = "";
}


function loginUser() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var message = document.getElementById("message");

    if (username == "admin" && password == "1234") {
        message.textContent = "Login Successful";
        message.style.color = "red";
    } else {
         message.textContent = "Login Not Successful! Hint: Username is admin and Password is 1234.";
        message.style.color = "red";
    }
}
