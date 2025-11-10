using UnityEngine;

public class FollowCamera : MonoBehaviour
{
    // The target object that the camera will follow
    [SerializeField] GameObject thingToFollow;

    // Update is called once per frame
    void Update()
    {
        transform.position = thingToFollow.transform.position + new Vector3(0, 0, -10);
    }
}
