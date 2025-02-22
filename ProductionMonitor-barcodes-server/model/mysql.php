<?php

function get_connection() {
    $mysql_conn_file = file_get_contents($_SERVER['DOCUMENT_ROOT']."/mysql_connection.json");
    $connect_params = null;
    if (!$mysql_conn_file)
        $connect_params = json_decode($mysql_conn_file);
    
    if (isset($connect_params)) {
        $mysql_server = $connect_params->server;
        $mysql_port = $connect_params->port;
        $mysql_username = $connect_params->username;
        $mysql_password = $connect_params->password;
        $mysql_database = $connect_params->database;
    } else {
        $mysql_server = "localhost";
        $mysql_port = 3306;
        $mysql_username = "root";
        $mysql_password = "";
        $mysql_database = "demoapp";
    }

    $mysql_connection = new mysqli("p:".$mysql_server,$mysql_username, $mysql_password, $mysql_database, $mysql_port);
    return $mysql_connection;
}