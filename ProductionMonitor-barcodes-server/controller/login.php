<?php
    require_once "../model/login.php";
    
    if (isset($_GET['logout'])) logout_user();
    
    if (!isset($_GET['name']) || !isset($_GET['password'])) {
        header("Location: /");
    } else {
        $name = $_GET['name'];
        $pass = $_GET['password'];
        
        $user = login_user($name,$pass);
        if (isset($user)) {
            header("Location: /");
        } else header("Location: /");
    }

    