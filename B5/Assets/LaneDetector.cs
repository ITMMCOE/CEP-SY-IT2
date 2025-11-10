using UnityEngine;

/// <summary>
/// THIS IS THE SCRIPT YOU ARE MISSING ON YOUR ROADS.
/// Attach this to each road segment. It provides the direction of the road
/// so the player's driving direction can be checked against it.
/// </summary>
public class LaneDetector : MonoBehaviour
{
    // The correct driving direction for this piece of road.
    // In Unity Editor, use the handle to point this in the correct direction of traffic flow.
    [SerializeField] private Vector3 roadDirection = Vector3.up;

    // This "getter" lets other scripts read the road's direction
    public Vector3 RoadDirection => roadDirection.normalized;

    /// <summary>
    /// This is the code that draws the GIZMO.
    /// If you don't see this, the script isn't on an active GameObject.
    /// </summary>
    void OnDrawGizmos()
    {
        Gizmos.color = Color.cyan;
        Vector3 startPosition = transform.position;
        Vector3 endPosition = startPosition + roadDirection.normalized * 3; // Draw a 3-unit long arrow
        Gizmos.DrawLine(startPosition, endPosition);

        // Arrowhead
        // We need to calculate the arrowhead points in 2D
        Vector3 right = Quaternion.Euler(0, 0, -20) * (-roadDirection.normalized * 0.5f);
        Vector3 left = Quaternion.Euler(0, 0, 20) * (-roadDirection.normalized * 0.5f);
        Gizmos.DrawLine(endPosition, endPosition + right);
        Gizmos.DrawLine(endPosition, endPosition + left);
    }
}