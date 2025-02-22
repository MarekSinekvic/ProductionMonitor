<?php
    $user = cookie_login();
    if ($user === null) header("Location: /");

    include "model/scanner.php";
    $products = Scanner::get_productions();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        td {
            word-wrap: break-word;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
        }
    </style>
</head>
<body style="padding: 10%">
    <div style="display:flex; justify-content: space-between">
        <form action="/controller/scanner.php" method="get" style="width:80%">
            <input type="number" name="barcode" id="barcode" style="font-size:20px; width:80%">
            <input type="submit" value="Send" style="font-size:20px; width:18%">
        </form>
        <form action="/controller/login.php" method="get">
            <input type="hidden" name="logout">
            <input type="submit" value="Logout" style="font-size:20px">
        </form>
    </div>
    <hr/>
    <div>
        <table style="width:100%">
            <thead style="text-transform: uppercase;">
                <th>id</th>
                <th>date</th>
                <th>weight</th>
                <th>waste</th>
            </thead>
            <tbody>
                <?php include "products.html.php"; ?> 
            </tbody>
        </table>
    </div>
</body>
</html>