<?php

    require "../model/scanner.php";

    if (isset($_GET['barcode'])) {
        $barcode = $_GET['barcode'];
        Scanner::send($_COOKIE['user-id'],$barcode);
        header("Location: /");
    }