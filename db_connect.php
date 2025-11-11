<?php
$servername = "localhost"; // usually localhost
$username = "root";        // your MySQL username
$password = "";            // your MySQL password
$database = "stock_market_db"; // your database name

$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
