using UnityEngine;

/// <summary>
/// Put this script on your "Customer" GameObject.
/// It acts as a "tag" for the Driver to find.
/// It MUST have a Collider2D set to "Is Trigger".
/// </summary>
[RequireComponent(typeof(Collider2D))]
public class Customer : MonoBehaviour
{
    void Awake()
    {
        // Ensure our collider is set to be a trigger
        Collider2D col = GetComponent<Collider2D>();
        if (col != null)
        {
            col.isTrigger = true;
        }
        else
        {
            Debug.LogError("Customer script needs a Collider2D component!", this);
        }
    }
}