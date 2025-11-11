<?php
include 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $rating = $_POST['rating'];
  $message = $_POST['message'];

  $sql = "INSERT INTO feedback (name, email, rating, message)
          VALUES ('$name', '$email', '$rating', '$message')";

  if ($conn->query($sql) === TRUE) {
    echo "<script>alert('Thank you for your feedback!'); window.location.href='../about.html';</script>";
  } else {
    echo "Error: " . $conn->error;
  }

  $conn->close();
}
?>
