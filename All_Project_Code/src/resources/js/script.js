// JS plugins for HTML page go here
function pwdMatch(){
    var pwd = document.getElementById("password");
    var c_pwd = document.getElementById("confirm_password");

    if(c_pwd != pwd){
        alert("Password must match")
    }
}