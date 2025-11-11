<?php
include 'db_connect.php';

header('Content-Type: application/json'); // <-- Important for fetch JSON

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $phone = trim($_POST['phone']);
    $subject = trim($_POST['subject']);
    $message = trim($_POST['message']);

    // ✅ Validate phone (10 digits, starts with 6–9)
    if (!preg_match("/^[6-9][0-9]{9}$/", $phone)) {
        echo json_encode(["status" => "error", "message" => "Invalid phone number."]);
        exit;
    }

    // ✅ Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email address."]);
        exit;
    }

    // ✅ Secure insert with prepared statement
    $stmt = $conn->prepare("INSERT INTO contact_form (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $email, $phone, $subject, $message);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Message sent successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
