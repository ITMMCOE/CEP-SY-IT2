using UnityEngine;
using System.Collections;
#if UNITY_EDITOR // <-- NEW! Need this for the "Exit Play Mode" command
using UnityEditor; 
#endif

/// <summary>
/// Manages the player's civic score.
/// This script goes on your "GameManager" GameObject.
/// </summary>
public class CivicScoreManager : MonoBehaviour
{
    // 'Instance' allows other scripts (like Driver.cs) to find this script easily.
    public static CivicScoreManager Instance;

    [Header("Scoring")]
    [SerializeField] private int currentScore = 100;
    [SerializeField] private int deliverySuccessPoints = 20;
    [SerializeField] private int wrongLanePenalty = 5;
    [SerializeField] private int collisionPenalty = 10;
    [SerializeField] private int redLightPenalty = 15; // <-- ADDED THIS LINE
    // We will add a small number of points per second for good driving
    [SerializeField] private float pointsPerSecondInCorrectLane = 1.0f;

    [Header("UI References")]
    [SerializeField] private UIManager uiManager;

    // This is the variable that tracks the score timer
    private float laneCheckTimer = 0f;
    private const float LANE_CHECK_INTERVAL = 1.0f; // Grant points every 1 second

    // This is the variable that tracks the score timer
    // This variable will be set by the Driver.cs script
    private bool isPlayerInCorrectLane = false;

    void Awake()
    {
        // This is the Singleton pattern, it makes 'Instance' work
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    // --- NEW FUNCTION ---
    /// <summary>
    /// THIS IS THE FIX FOR THE RESTART BUG.
    /// When this object is destroyed (on scene reload), it clears
    /// the static 'Instance' variable so the new one can take its place.
    /// </summary>
    void OnDestroy()
    {
        if (Instance == this)
        {
            Instance = null;
        }
    }
    // --- END NEW FUNCTION ---


    void Start()
    {
        if (uiManager == null)
        {
            // Find the UIManager in the scene if it's not assigned
            uiManager = FindObjectOfType<UIManager>();
            if (uiManager == null)
            {
                Debug.LogError("UIManager is not assigned AND could not be found in the scene!");
                return;
            }
        }
        UpdateScoreUI();
    }

    // This Update loop will now grant points for correct driving
    void Update()
    {
        // --- NEW! CHECK FOR ESCAPE KEY ---
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            Debug.Log("Escape key pressed. Quitting.");
#if UNITY_EDITOR
                // If we are in the Unity Editor, stop playing.
                UnityEditor.EditorApplication.isPlaying = false;
#else
            // If we are in a real build, quit the application.
            Application.Quit();
#endif
        }
        // --- END NEW BLOCK ---


        // If the driver is in the correct lane...
        if (isPlayerInCorrectLane)
        {
            // ...add time to the timer
            laneCheckTimer += Time.deltaTime;

            // If 1 second has passed...
            if (laneCheckTimer >= LANE_CHECK_INTERVAL)
            {
                // ...add points and show a message
                AddScore(Mathf.CeilToInt(pointsPerSecondInCorrectLane), "Good Driving!");
                laneCheckTimer = 0f; // Reset the timer
            }
        }
    }

    // --- THIS IS THE MISSING FUNCTION ---
    /// <summary>
    /// Called by the Driver script to tell the manager the lane state.
    /// </summary>
    public void UpdateLaneStatus(bool isCorrect)
    {
        isPlayerInCorrectLane = isCorrect;

        // If the player is in the WRONG lane, stop the "good driving" timer
        if (!isCorrect)
        {
            laneCheckTimer = 0f;
        }
    }
    // --- END OF MISSING FUNCTION ---

    public void WrongLanePenalty()
    {
        DeductScore(wrongLanePenalty, "Wrong Lane!");
    }

    public void CollisionPenalty()
    {
        DeductScore(collisionPenalty, "Collision!");
    }

    public void DeliverySuccess()
    {
        AddScore(deliverySuccessPoints, "Package Delivered!");
    }

    // --- THIS IS THE NEW FUNCTION YOU NEED ---
    /// <summary>
    /// Called by TrafficTrigger.cs when the player runs a red light.
    /// </summary>
    public void RedLightViolation()
    {
        DeductScore(redLightPenalty, "Ran Red Light!");
    }
    // --- END OF NEW FUNCTION ---


    // --- Private helper functions ---

    private void AddScore(int amount, string message)
    {
        currentScore += amount;
        UpdateScoreUI();
        if (uiManager != null) uiManager.ShowFeedbackMessage(message, Color.green);
    }

    private void DeductScore(int amount, string message)
    {
        currentScore -= amount;
        currentScore = Mathf.Max(0, currentScore); // Don't let score go below 0
        UpdateScoreUI();
        if (uiManager != null) uiManager.ShowFeedbackMessage(message, Color.red);
    }

    private void UpdateScoreUI()
    {
        if (uiManager != null) uiManager.UpdateScoreText(currentScore);
    }

    public int GetFinalScore()
    {
        return currentScore;
    }
}