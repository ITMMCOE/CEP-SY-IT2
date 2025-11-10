using UnityEngine;
using TMPro; // Use TextMeshPro
using System.Collections;
using UnityEngine.UI; // Need this for the Button
using UnityEngine.SceneManagement; // <-- NEW! Need this to restart the scene.

/// <summary>
/// Handles all UI elements, including score, feedback, and summary screen.
/// This script is already on your "UIManagerObject".
/// </summary>
public class UIManager : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private TextMeshProUGUI scoreText;
    [SerializeField] private TextMeshProUGUI feedbackText;
    [SerializeField] private GameObject summaryPanel;
    [SerializeField] private TextMeshProUGUI finalScoreText;
    [SerializeField] private TextMeshProUGUI gradeText;
    [SerializeField] private Button restartButton; // We already had this

    private Coroutine feedbackCoroutine;

    void Start()
    {
        // Hide the summary panel at the start
        if (summaryPanel != null) summaryPanel.SetActive(false);
        if (feedbackText != null) feedbackText.gameObject.SetActive(false);
    }

    // --- This is the same as before ---
    public void UpdateScoreText(int score)
    {
        if (scoreText != null) scoreText.text = $"Score: {score}";
    }

    // --- This is the same as before ---
    public void ShowFeedbackMessage(string message, Color color)
    {
        if (feedbackText == null) return;

        if (feedbackCoroutine != null) StopCoroutine(feedbackCoroutine);
        feedbackCoroutine = StartCoroutine(FeedbackRoutine(message, color));
    }

    // --- This is the same as before ---
    private IEnumerator FeedbackRoutine(string message, Color color)
    {
        feedbackText.gameObject.SetActive(true);
        feedbackText.text = message;
        feedbackText.color = color;

        yield return new WaitForSeconds(1.5f);

        feedbackText.gameObject.SetActive(false);
    }

    // --- This is the same as before ---
    public void ShowLevelSummary(int finalScore)
    {
        if (summaryPanel == null) return;

        summaryPanel.SetActive(true);
        finalScoreText.text = $"Final Score: {finalScore}";
        gradeText.text = $"Grade: {CalculateGrade(finalScore)}";
    }

    // --- This is the same as before ---
    private string CalculateGrade(int score)
    {
        if (score > 150) return "A+";
        if (score > 100) return "A";
        if (score > 75) return "B";
        if (score > 50) return "C";
        if (score > 25) return "D";
        return "F";
    }

    // --- THIS IS THE NEW FUNCTION ---
    /// <summary>
    /// This function will be called by the RestartButton's OnClick event.
    /// </summary>
    public void OnRestartButtonPressed()
    {
        Debug.Log("Restarting scene...");
        // Get the name of the currently active scene and load it again.
        string currentSceneName = SceneManager.GetActiveScene().name;
        SceneManager.LoadScene(currentSceneName);
    }
}