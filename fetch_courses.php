<?php
include 'db_connect.php';

$result = $conn->query("SELECT * FROM courses");

while ($row = $result->fetch_assoc()) {
  echo "<div class='course-card'>";
  echo "<h5>" . $row['title'] . "</h5>";
  echo "<p>" . $row['description'] . "</p>";
  echo "<p><strong>Duration:</strong> " . $row['duration'] . "</p>";
  echo "<p><strong>Price:</strong> ₹" . $row['price'] . "</p>";
  echo "</div>";
}
$conn->close();
?>
