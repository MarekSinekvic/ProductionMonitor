<?php
    
    include "model/login.php";
    
    $user = cookie_login();
    if (($user !== null)) {
        include "view/scanner.html.php";
    } else {
        include "view/login.html.php";
    }

