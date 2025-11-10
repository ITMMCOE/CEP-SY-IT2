using UnityEngine;

/// <summary>
/// Handles player movement, lane checks, and package "carrying" logic.
/// This script is already on your "DriverBoy" GameObject.
/// </summary>
public class Driver : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] float steerSpeed = 200f;
    [SerializeField] float moveSpeed = 15f;

    [Header("Delivery Goal")]
    [SerializeField] int packagesToWin = 3;

    // --- Private Variables ---
    private LaneDetector currentLane;
    private float wrongLaneTimer = 0f;
    private const float WRONG_LANE_PENALTY_DELAY = 2.0f;
    private float steerInput;
    private float moveInput;
    private int packagesCollected = 0; // Renamed for clarity
    private bool levelEnded = false;

    // --- THIS IS THE NEW LOGIC ---
    private bool hasPackage = false; // Are we currently holding a package?
    // Public "getter" so Package.cs can check this
    public bool HasPackage => hasPackage;
    // --- END NEW LOGIC ---


    void Update()
    {
        // --- Movement ---
        steerInput = Input.GetAxis("Horizontal");
        moveInput = Input.GetAxis("Vertical");

        float steerAmount = steerInput * steerSpeed * Time.deltaTime;
        float moveAmount = moveInput * moveSpeed * Time.deltaTime;

        transform.Rotate(0, 0, -steerAmount);
        transform.Translate(0, moveAmount, 0);

        // --- Logic ---
        CheckLaneDirection();
    }

    private void CheckLaneDirection()
    {
        // ... (This function is the same, no changes needed) ...
        if (currentLane == null)
        {
            if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.UpdateLaneStatus(false);
            return;
        }
        Vector3 vehicleForward = transform.up;
        Vector3 roadDirection = currentLane.RoadDirection;
        float dotProduct = Vector3.Dot(vehicleForward, roadDirection);
        if (moveInput < 0.1f)
        {
            wrongLaneTimer = 0f;
            if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.UpdateLaneStatus(dotProduct > 0.1f);
            return;
        }
        if (dotProduct > 0.1f)
        {
            if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.UpdateLaneStatus(true);
            wrongLaneTimer = 0f;
        }
        else
        {
            if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.UpdateLaneStatus(false);
            wrongLaneTimer += Time.deltaTime;
            if (wrongLaneTimer > WRONG_LANE_PENALTY_DELAY)
            {
                if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.WrongLanePenalty();
                wrongLaneTimer = 0f;
            }
        }
    }

    private void OnCollisionEnter2D(Collision2D other)
    {
        // ... (This function is the same) ...
        if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.CollisionPenalty();
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        // Check for Lanes
        if (other.TryGetComponent<LaneDetector>(out LaneDetector lane))
        {
            currentLane = lane;
            Debug.Log("Entered new lane!");
        }

        // --- NEW LOGIC: Check for Customer ---
        // We check for the Customer here. The Package script handles pickup.
        if (other.TryGetComponent<Customer>(out Customer customer))
        {
            // We touched the customer... do we have a package?
            if (hasPackage)
            {
                DeliverPackage();
            }
        }
        // --- END NEW LOGIC ---
    }

    private void OnTriggerExit2D(Collider2D other)
    {
        // ... (This function is the same) ...
        if (other.TryGetComponent<LaneDetector>(out LaneDetector lane))
        {
            if (currentLane == lane)
            {
                currentLane = null;
                if (CivicScoreManager.Instance != null) CivicScoreManager.Instance.UpdateLaneStatus(false);
                Debug.Log("Exited lane.");
            }
        }
    }

    // --- THIS LOGIC IS MODIFIED ---

    /// <summary>
    /// This is called by the Package.cs script when we pick one up.
    /// </summary>
    public void PickUpPackage(GameObject packageObject)
    {
        if (levelEnded) return;

        // We already have one, can't pick up another!
        if (hasPackage)
        {
            Debug.Log("Already holding a package!");
            return;
        }

        // --- We are now holding a package ---
        hasPackage = true;
        packagesCollected++; // We add to the count on PICKUP
        Debug.Log($"Packages Collected: {packagesCollected} / {packagesToWin}");

        // Find the UI and show a feedback message
        UIManager ui = FindObjectOfType<UIManager>();
        if (ui != null)
        {
            ui.ShowFeedbackMessage("Package Picked Up!", Color.cyan);
        }

        // Destroy the package we just picked up
        Destroy(packageObject);
    }

    /// <summary>
    /// This is called by OnTriggerEnter2D when we touch a Customer.
    /// </summary>
    private void DeliverPackage()
    {
        if (levelEnded) return;

        // We are no longer holding a package
        hasPackage = false;

        // Tell the score manager to add points & show "Delivered!"
        if (CivicScoreManager.Instance != null)
        {
            CivicScoreManager.Instance.DeliverySuccess();
        }

        // --- THIS IS THE FIX ---
        // The win check is now HERE, after a successful delivery.
        if (packagesCollected >= packagesToWin)
        {
            TriggerLevelEnd();
        }
    }


    /// <summary>
    /// This was the old "OnAllDeliveriesComplete" function.
    /// It now gets the score, shows the summary, and stops the car.
    /// </summary>
    void TriggerLevelEnd()
    {
        levelEnded = true;
        this.enabled = false; // Disable this script (stops the car)

        Debug.Log("LEVEL COMPLETE!");

        // Find the UI and show the summary
        UIManager ui = FindObjectOfType<UIManager>();
        if (ui != null && CivicScoreManager.Instance != null)
        {
            int finalScore = CivicScoreManager.Instance.GetFinalScore();
            ui.ShowLevelSummary(finalScore);
        }
    }
}