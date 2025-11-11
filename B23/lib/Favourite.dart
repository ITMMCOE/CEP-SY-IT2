import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:login_form/ProInfo.dart';

class Favourite extends StatelessWidget {

  User? user=FirebaseAuth.instance.currentUser;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Favourites"),
      ),
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.fromLTRB(15, 0, 15, 0),
        child: StreamBuilder(
          stream: FirebaseFirestore.instance.collection('FAV_${user!.uid}').snapshots(),
          builder: (context, AsyncSnapshot<QuerySnapshot> snapshot){
            if(snapshot.hasData){
              return ListView.builder(
                itemCount: snapshot.data!.docs.length,
                itemBuilder: (itemBuilder, index){
                  DocumentSnapshot data=snapshot.data!.docs[index];
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                    child: Container(
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87.withOpacity(0.2))),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                        child: Row(children: [
                          Container(
                            height: 120,
                            width: 170,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),
                                image: DecorationImage(image: NetworkImage(data['propertyImageUrl']),fit: BoxFit.cover)),
                          ),
                          Expanded(
                            child: ListTile(
                              title: Text(data['propertyName'],style: TextStyle(fontSize: 18,fontWeight: FontWeight.w600,color: Colors.black87),),
                              subtitle: Text("${data['propertyType']} | ${data['city']}, ${data['state']} ${data['zipCode']}",style: TextStyle(fontSize: 15,color: Colors.grey[700],fontWeight: FontWeight.w600),),
                              onTap: (){
                                Navigator.push(context, MaterialPageRoute(builder: (builder){
                                  return ProInfo(documentId: data.id,);
                                }));
                              },
                            ),
                          ),
                        ],),
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
        ) ,
      ),
    );
  }
}
