<?php
session_start();
if(!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
include 'db_connect.php';

// Fetch courses
$courses = [];
$res = $conn->query("SELECT * FROM courses");
while($row = $res->fetch_assoc()) {
    $courses[] = $row;
}

// Fetch user progress
$user_id = $_SESSION['user_id'];
$progress = [];
$res = $conn->query("SELECT * FROM progress WHERE user_id=$user_id");
while($row = $res->fetch_assoc()) {
    $progress[$row['tutorial_id']] = $row['time_spent_minutes'];
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
<h1>Welcome to Your Dashboard</h1>
<h2>Courses</h2>
<ul>
<?php foreach($courses as $c): ?>
    <li>
        <?php echo $c['title']; ?> -
        Time Spent: <?php echo $progress[$c['id']] ?? 0; ?> mins
        <form method="POST" action="update_progress.php" style="display:inline;">
            <input type="hidden" name="tutorial_id" value="<?php echo $c['id']; ?>">
            <input type="number" name="minutes" placeholder="Add Minutes">
            <button type="submit">Update</button>
        </form>
    </li>
<?php endforeach; ?>
</ul>

<h2>Progress Chart</h2>
<canvas id="progressChart"></canvas>
<script>
const ctx = document.getElementById('progressChart').getContext('2d');
const data = {
    labels: <?php echo json_encode(array_column($courses,'title')); ?>,
    datasets: [{
        label: 'Time Spent (minutes)',
        data: <?php echo json_encode(array_map(fn($c)=>$progress[$c['id']] ?? 0, $courses)); ?>,
        backgroundColor: 'rgba(0, 123, 255, 0.7)'
    }]
};
new Chart(ctx, { type: 'bar', data });
</script>
</body>
</html>
