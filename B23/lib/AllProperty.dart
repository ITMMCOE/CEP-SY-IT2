import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

import 'ProInfo.dart';

class AllProperty extends StatelessWidget {

  CollectionReference collectionReference =FirebaseFirestore.instance.collection("Properties");

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("All Properties",style: TextStyle(fontSize: 21,color: Colors.black,fontWeight: FontWeight.w400),),
      ),
      backgroundColor: Colors.white,
      body: StreamBuilder(
        stream: collectionReference.snapshots(),
        builder: (context, AsyncSnapshot<QuerySnapshot> snapshot){
          if(snapshot.hasData){
            return ListView.builder(
              itemCount: snapshot.data!.docs.length,
              itemBuilder: (context,index){
                DocumentSnapshot data=snapshot.data!.docs[index];
                return Padding(
                  padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                  child: Container(
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), border: Border.all(color: Colors.black87.withOpacity(0.2))),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(10, 10, 0, 10),
                      child: Row(
                        // mainAxisAlignment:MainAxisAlignment.spaceEvenly,
                        children: [
                          Container(
                            width: 150,
                            height: 120,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),
                                image: DecorationImage(image: NetworkImage(data['propertyImageUrl']), fit: BoxFit.cover)),
                          ),
                          Expanded(
                            child: ListTile(
                              title: Text(data['propertyName'], style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.black87),),
                              subtitle: Text("${data['propertyType']} | ${data['city']}, ${data['state']} ${data['zipCode']}", style: TextStyle(fontSize: 15, color: Colors.grey[700], fontWeight: FontWeight.w500),),
                              onTap: () {
                                Navigator.push(context, MaterialPageRoute(builder: (builder) {
                                  return ProInfo(documentId: data.id,);
                                }));
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          } else if(snapshot.hasError){
            return  Center(child: Text("Something went wrong"),);
          } else {
            return Center(child: CircularProgressIndicator(),);
          }
        },
      ),
    );
  }

}