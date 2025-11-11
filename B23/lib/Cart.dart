import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class Cart extends StatefulWidget {

  @override
  State<Cart> createState() => _CartState();
}

class _CartState extends State<Cart> {

  User? user=FirebaseAuth.instance.currentUser;

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Your Schedule",style: TextStyle(fontSize: 21)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: StreamBuilder(
          stream: FirebaseFirestore.instance.collection("SCH_${user!.uid}").snapshots(),
          builder: (context, AsyncSnapshot<QuerySnapshot> snapshot){
            if(snapshot.hasData){
              return ListView.builder(
                itemCount: snapshot.data!.docs.length,
                itemBuilder: (context, index){
                  DocumentSnapshot data=snapshot.data!.docs[index];
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                    child: Container(
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87.withOpacity(0.2))),
                      child: Padding(
                        padding: const EdgeInsets.all(15),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text("${data['scheduleType']}",style: TextStyle(fontSize: 17,fontWeight: FontWeight.w600,color: Colors.black54),),
                                      SizedBox(height: 10,),
                                      Text("Name",style: TextStyle(fontSize: 16,color: Colors.black87,fontWeight: FontWeight.w500),),
                                      Text(" ${data['sellerName']}"),
                                      Text("Email",style: TextStyle(fontSize: 16,color: Colors.black87,fontWeight: FontWeight.w500)),
                                      Text(" ${data['sellerEmail']}"),
                                      Text("Contact",style: TextStyle(fontSize: 16,color: Colors.black87,fontWeight: FontWeight.w500)),
                                      Text(" +91 ${data['sellerContact']}")
                                    ],
                                  ),
                                ),
                                Container(
                                  width: 1,
                                  height: 150,
                                  color: Colors.black87.withOpacity(0.1),
                                ),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Text("Schedule details",style: TextStyle(fontSize: 17,fontWeight: FontWeight.w600,color: Colors.black54),),
                                      SizedBox(height: 10,),
                                      Text("Date",style: TextStyle(fontSize: 16,color: Colors.black87,fontWeight: FontWeight.w500)),
                                      Text("${data['scheduleDate']} "),
                                      Text("Time",style: TextStyle(fontSize: 16,color: Colors.black87,fontWeight: FontWeight.w500)),
                                      Text("${data['scheduleTime']} "),
                                      Text("Property ID",style: TextStyle(fontSize: 16,color: Colors.black87,fontWeight: FontWeight.w500)),
                                      Text("${data['propertyId']} "),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 25,),
                            Text("Property name ${data['propertyName']}",style: TextStyle(fontSize: 17,fontWeight: FontWeight.w500,color: Colors.black87)),
                            Text("Meeting address",style: TextStyle(fontSize: 17,fontWeight: FontWeight.w600,color: Colors.black54)),
                            Text("${data['address']}")
                          ],
                        ),
                      ),
                    ),
                  );
                },
              );
            } else if(snapshot.hasError){
              return Center(child: Text("Something went wrong"),);
            } else {
              return Center(child: CircularProgressIndicator(),);
            }
          },
        ),
      ),
    );
  }
}