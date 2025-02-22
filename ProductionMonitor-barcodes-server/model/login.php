<?php

include "mysql.php";

class User {
    public $name, $pass;
    function __construct($id,$name = '',$pass = '') {
        $this->name = $name;
        $this->pass = $pass;
        
        setcookie('user-id',$id,0,'/');
        setcookie('user-name',$name,0,'/');
        setcookie('user-password',$pass,0,'/');
        // error_log("user create");
    }
}
function cookie_login() {
    $user = null;
    // error_log($_COOKIE['user-name']);
    if (isset($_COOKIE['user-name']) && isset($_COOKIE['user-password'])) {
        $cookie_name = $_COOKIE['user-name'];
        $cookie_pass = $_COOKIE['user-password'];
        $user = login_user($cookie_name,$cookie_pass);
    }
    return $user;
}
function login_user(string $name, string $password) {
    $mysql_connection = get_connection();
    $user = null;
    $target_user = $mysql_connection->query("select * from users where name='$name' and password='$password'");
    if ($target_user->num_rows > 0)
        $user = new User($target_user->fetch_assoc()['id'],$name,$password);
    return $user;
}

function logout_user() {
    setcookie("user-id","",0,"/");
    setcookie("user-name","",0,"/");
    setcookie("user-password","",0,"/");

    header("Location: /");
}