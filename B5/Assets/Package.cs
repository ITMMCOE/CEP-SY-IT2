using UnityEngine;

/// <summary>
/// Put this script on every Package GameObject (your "Square" objects).
/// It will handle being "delivered" by the player.
/// </summary>
[RequireComponent(typeof(Collider2D))]
public class Package : MonoBehaviour
{
    // This variable is just for visual feedback
    [SerializeField] private Color deliveredColor = Color.gray;
    private bool isDelivered = false; // We use this to prevent a double-pickup

    // This runs when the player (or anything) enters the trigger
    private void OnTriggerEnter2D(Collider2D other)
    {
        // Do nothing if we've already been delivered
        if (isDelivered) return;

        // Check if the object that hit us has a "Driver" script
        if (other.TryGetComponent<Driver>(out Driver driver))
        {
            // --- We found the driver! ---
            // Before we do anything, check if the driver is already holding something.
            if (driver.HasPackage)
            {
                // Driver is full, do nothing.
                return;
            }

            // --- Driver is empty, let them pick us up ---
            isDelivered = true;

            // 1. Tell the driver script that they picked us up
            // We pass "gameObject" so the driver can destroy us
            driver.PickUpPackage(gameObject);

            // 2. We no longer change color or disable, the driver
            // will just destroy this object.
        }
    }
}