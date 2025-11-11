<?php
session_start();
include 'db_connect.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            // ✅ Store session
            $_SESSION['user'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];

            // Redirect to index.html with a success message
            echo "<script>
                    alert('Welcome, " . $user['name'] . "! You have successfully logged in.');
                    window.location.href='../index.html';
                  </script>";
        } else {
            echo "<script>
                    alert('Invalid password! Please try again.');
                    window.location.href='../login.html';
                  </script>";
        }
    } else {
        echo "<script>
                alert('No account found with this email. Please sign up first.');
                window.location.href='../signup.html';
              </script>";
    }

    $stmt->close();
    $conn->close();
}
?>

<?php
session_start();
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($id, $hashed_password);
    if ($stmt->fetch() && password_verify($password, $hashed_password)) {
        $_SESSION['user_id'] = $id;
        header("Location: dashboard.php");
        exit;
    } else {
        echo "Invalid credentials!";
    }
}
?>
<form method="POST">
    Email: <input type="email" name="email" required><br>
    Password: <input type="password" name="password" required><br>
    <button type="submit">Login</button>
</form>
