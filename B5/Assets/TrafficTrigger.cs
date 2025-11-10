using UnityEngine;

/// <summary>
/// A trigger zone placed at intersections. It checks if a player
/// crosses it while the associated traffic light is red.
/// </summary>
[RequireComponent(typeof(BoxCollider2D))]
public class TrafficTrigger : MonoBehaviour
{
    [SerializeField] private TrafficLightController trafficLight;

    void Awake()
    {
        // Ensure the collider is set to be a trigger
        GetComponent<BoxCollider2D>().isTrigger = true;
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        // Check if the object that entered is the player and the light is red
        if (other.CompareTag("Player") && trafficLight.CurrentState == TrafficLightController.LightState.Red)
        {
            Debug.Log("Red light violation!");
            CivicScoreManager.Instance.RedLightViolation();
        }
    }
}
