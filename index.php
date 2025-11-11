<?php
session_start();
include 'db_connect.php';

// Fetch user details if logged in
$user = null;
if (isset($_SESSION['user_email'])) {
  $email = $_SESSION['user_email'];
  $result = $conn->query("SELECT name, email, profile_photo FROM users WHERE email='$email'");
  if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
  }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stock Market E-Learning</title>

  <!-- Bootstrap & Font Awesome -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background-color: #f4f8fb;
      color: #002b5c;
    }
    header {
      background: linear-gradient(90deg, #004b8d, #007bff);
      color: white;
      text-align: center;
      padding: 80px 20px;
      border-bottom-left-radius: 50px;
      border-bottom-right-radius: 50px;
    }
    .btn-custom {
      border-radius: 30px;
      font-weight: 600;
      margin: 10px;
      padding: 12px 30px;
    }
    .profile-card {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      display: inline-block;
      margin-top: 20px;
    }
    .profile-photo {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #007bff;
    }
    .alert-box {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: none;
    }
    footer {
      text-align: center;
      background: #002b5c;
      color: white;
      padding: 20px;
      margin-top: 50px;
    }
  </style>
</head>

<body>
  <!-- Alert Box -->
  <div class="alert-box">
    <?php if (isset($_GET['status'])): ?>
      <?php if ($_GET['status'] == 'signup_success'): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          ✅ Signup successful! You can now login to your account.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      <?php elseif ($_GET['status'] == 'login_success'): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          🎉 Successfully logged in! Welcome back.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      <?php elseif ($_GET['status'] == 'logout_success'): ?>
        <div class="alert alert-info alert-dismissible fade show" role="alert">
          👋 You have logged out successfully.
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </div>

  <!-- Header -->
  <header>
    <h1>Welcome to Stock Market E-Learning</h1>
    <p>Empower your financial future with expert-led trading and investing courses.</p>

    <div class="buttons">
      <?php if (!$user): ?>
        <a href="login.html" class="btn btn-light btn-custom"><i class="fas fa-sign-in-alt"></i> Login</a>
        <a href="signup.html" class="btn btn-warning btn-custom"><i class="fas fa-user-plus"></i> Sign Up</a>
      <?php else: ?>
        <div class="profile-card text-center">
          <img src="<?php echo $user['profile_photo'] ? 'uploads/' . $user['profile_photo'] : 'assets/default-user.png'; ?>" alt="Profile Photo" class="profile-photo">
          <h4 class="mt-3">👋 Welcome, <?php echo htmlspecialchars($user['name']); ?>!</h4>
          <p><i class="fas fa-envelope"></i> <?php echo htmlspecialchars($user['email']); ?></p>
          <a href="php/logout.php" class="btn btn-danger btn-custom"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
      <?php endif; ?>
    </div>
  </header>

  <section class="container my-5 text-center">
    <h2>Our Popular Courses</h2>
    <p>Learn Stock Market Fundamentals, Technical Analysis, and Advanced Trading Strategies.</p>
    <div class="mt-4">
      <a href="courses.html" class="btn btn-primary btn-lg"><i class="fas fa-chart-line"></i> Explore Courses</a>
      <a href="contact.html" class="btn btn-outline-primary btn-lg"><i class="fas fa-envelope"></i> Contact Us</a>
    </div>
  </section>

  <footer>
    <p>© 2025 Stock Market Institute. All Rights Reserved.</p>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    const alertBox = document.querySelector('.alert-box');
    if (alertBox) {
      alertBox.style.display = 'block';
      setTimeout(() => {
        const alert = alertBox.querySelector('.alert');
        if (alert) {
          alert.classList.remove('show');
          setTimeout(() => alertBox.remove(), 500);
        }
      }, 4000);
    }
  </script>
</body>
</html>
