using UnityEngine;
using System.Collections;

/// <summary>
/// Manages the state and timing of a traffic light.
/// It cycles through Red, Yellow, and Green states.
/// </summary>
public class TrafficLightController : MonoBehaviour
{
    public enum LightState { Green, Yellow, Red }

    [Header("Light Sprites")]
    [SerializeField] private SpriteRenderer redLight;
    [SerializeField] private SpriteRenderer yellowLight;
    [SerializeField] private SpriteRenderer greenLight;

    [Header("Timing")]
    [SerializeField] private float greenTime = 8.0f;
    [SerializeField] private float yellowTime = 2.0f;
    [SerializeField] private float redTime = 10.0f;

    private LightState currentState;
    public LightState CurrentState => currentState;

    void Start()
    {
        // Start the traffic light cycle
        currentState = LightState.Green;
        StartCoroutine(TrafficLightCycle());
    }

    private IEnumerator TrafficLightCycle()
    {
        while (true) // Loop forever
        {
            // GREEN State
            SetLightState(LightState.Green);
            yield return new WaitForSeconds(greenTime);

            // YELLOW State
            SetLightState(LightState.Yellow);
            yield return new WaitForSeconds(yellowTime);

            // RED State
            SetLightState(LightState.Red);
            yield return new WaitForSeconds(redTime);
        }
    }

    private void SetLightState(LightState state)
    {
        currentState = state;

        // Turn all lights off first
        redLight.color = Color.grey;
        yellowLight.color = Color.grey;
        greenLight.color = Color.grey;

        // Turn the correct light on
        switch (state)
        {
            case LightState.Green:
                greenLight.color = Color.green;
                break;
            case LightState.Yellow:
                yellowLight.color = Color.yellow;
                break;
            case LightState.Red:
                redLight.color = Color.red;
                break;
        }
    }
}
