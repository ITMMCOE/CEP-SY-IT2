using UnityEngine;
using System.Collections;
using System.Collections.Generic;
public class Delivery : MonoBehaviour
{
    bool hasPackage = false;
    [SerializeField] float packageGoneDelay = 0.5f;

    [SerializeField] Color32 hasPackageColor = new Color32(1, 1, 1, 1); // white
    [SerializeField] Color32 noPackageColor = new Color32(1, 1, 1, 1); // white


    SpriteRenderer spriteRenderer;
    void Start()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
    }
    private void OnCollisionEnter2D(Collision2D collision)
    {
        
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.tag == "Package" && hasPackage== false)
        {
            Debug.Log("Package Picked Up!");
            hasPackage = true;
            spriteRenderer.color = hasPackageColor; 
            Destroy(collision.gameObject, packageGoneDelay);
        }

        if (collision.tag == "Customer" && hasPackage== true )
        {
            Debug.Log("Customer Served!");
            hasPackage = false;
            spriteRenderer.color = noPackageColor;
        }
    }
}
