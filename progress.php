<?php
session_start();
if(!isset($_SESSION['user_id'])) { header("Location: login.php"); exit; }
include 'config.php';

$user_id = $_SESSION['user_id'];
$tutorial_id = $_POST['tutorial_id'];
$minutes = intval($_POST['minutes']);

// Insert or update progress
$stmt = $conn->prepare("INSERT INTO progress (user_id, tutorial_id, time_spent_minutes, completed) VALUES (?, ?, ?, 0) 
    ON DUPLICATE KEY UPDATE time_spent_minutes = time_spent_minutes + ?");
$stmt->bind_param("iiii", $user_id, $tutorial_id, $minutes, $minutes);
$stmt->execute();

header("Location: dashboard.php");
