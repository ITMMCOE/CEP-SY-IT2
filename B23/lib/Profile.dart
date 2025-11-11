import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:login_form/About.dart';
import 'package:login_form/Add.dart';
import 'package:login_form/Cart.dart';
import 'package:login_form/Favourite.dart';
import 'package:login_form/Help.dart';
import 'ProfileEdit.dart';
import 'main.dart';

class Profile extends StatefulWidget {
  @override
  State<Profile> createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {

  FirebaseAuth _auth=FirebaseAuth.instance;
  CollectionReference collectionReference=FirebaseFirestore.instance.collection('Users');
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white70.withOpacity(0.9),
        title: Text("Profile",style: TextStyle(fontSize: 21),),
      ),
      backgroundColor: Colors.white70.withOpacity(0.9),

      body: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
        child: ListView(
          children: [
            SizedBox(height: 25,),
            Container(
              decoration: BoxDecoration(boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.3), spreadRadius: 2, blurRadius: 6, offset: Offset(1, 5),)],
                borderRadius: BorderRadius.circular(5),color: Colors.indigo.withBlue(100),),
              child: Padding(
                padding: const EdgeInsets.all(5),
                child: StreamBuilder(
                  stream: collectionReference.doc(_auth.currentUser!.uid).snapshots(),
                  builder: (context, AsyncSnapshot<DocumentSnapshot> snapshot){
                    if(snapshot.hasData){
                      Map<String, dynamic> data=snapshot.data!.data() as Map<String, dynamic>;
                      return ListTile(
                        leading: Container(
                          height: 80,width: 56,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(50),color: Colors.white),
                          child: Padding(
                            padding: const EdgeInsets.all(2),
                            child: CircleAvatar(
                              backgroundImage: (data['pfpURL'].toString().isEmpty)?AssetImage("assets/images/ProfilePic.jpg"):NetworkImage(data['pfpURL'])),
                          ),
                        ),
                        title: Text(data['userName'],style: TextStyle(color: Colors.white,fontSize: 18),),
                        subtitle: Text(data['email'],style: TextStyle(color: Colors.white70,fontSize: 13),),
                        trailing: IconButton(
                          icon: Icon(Icons.edit_outlined,size: 27,color: Colors.white,),
                          onPressed: () {
                            Navigator.push(context, MaterialPageRoute(builder: (builder){
                              return ProfileEdit();
                            }));
                          },
                        ),
                      );
                    } else if(snapshot.hasError){
                      return Center(child: Text("Something went wrong"),);
                    } else {
                      return Center(child: CircularProgressIndicator(),);
                    }
                  },
                )
              ),
            ),
            SizedBox(height: 25,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),color: Colors.white),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 20, 0, 20),
                child: Column(
                  children: [
                    ListTile(
                      title: Text("My Account",style:GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                      subtitle: Text("Make changes to your account",style: TextStyle(color: Colors.grey,fontSize: 13)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30,),
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child: Icon(Icons.person_outline,color: Colors.indigo.withBlue(100)),
                        ),
                      ),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder:(builder){
                          return ProfileEdit();
                        }));
                      },
                    ),
                    ListTile(
                      title: Text("Saved Property",style:GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                      subtitle: Text("Manage your saved property",style: TextStyle(color: Colors.grey,fontSize: 13)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30),
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child:
                          Icon(Icons.favorite_border_rounded,color: Colors.indigo.withBlue(100),),
                        ),
                      ),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (builder){
                          return Favourite();
                        }));
                      },
                    ),
                    ListTile(
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child: Icon(Icons.schedule_send_outlined,color: Colors.indigo.withBlue(100)),
                        ),
                      ),
                      title: Text("Your Schedule",style:GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                      subtitle: Text("See, where's your next property will be!",style: TextStyle(color: Colors.grey,fontSize: 13)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30),
                      onTap: (){
                        Navigator.push(context, MaterialPageRoute(builder: (builder){
                          return Cart();
                        }));
                      },
                    ),
                    ListTile(
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child: Icon(Icons.add,color: Colors.indigo.withBlue(100)),
                        ),
                      ),
                      title: Text("Add Property",style:GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                      subtitle: Text("Start your own market",style: TextStyle(color: Colors.grey,fontSize: 13)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30),
                      onTap: (){
                        Navigator.push(context, MaterialPageRoute(builder: (builder){
                          return Add();
                        }));
                      },
                    ),
                    ListTile(
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child: Icon(Icons.logout_outlined,color: Colors.indigo.withBlue(100)),
                        ),
                      ),
                      title: Text("Log out",style:GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                      subtitle: Text("Your account will not be deleted!",style: TextStyle(color: Colors.grey,fontSize: 13)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30),
                      onTap: () {
                        if(_auth.currentUser!=null) {
                          _auth.signOut();
                          Navigator.of(context).pushAndRemoveUntil(
                            MaterialPageRoute(builder: (context) => Login()),
                                (Route<dynamic> route) => false,
                          );
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 20,),
            Text("More",style:GoogleFonts.nunito(fontWeight: FontWeight.w700,color: Colors.black54,fontSize: 17),),
            SizedBox(height: 20,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),color: Colors.white),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 20, 0, 20),
                child: Column(
                  children: [
                    ListTile(
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child: Icon(Icons.notifications_active_outlined,color: Colors.indigo.withBlue(100)),
                        ),
                      ),
                      title: Text("Help & Support",style:GoogleFonts.nunito(fontWeight: FontWeight.w700,)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (builder){
                          return Help();
                        }));
                      },
                    ),
                    SizedBox(height: 15,),
                    ListTile(
                      leading: Container(
                        height: 45,width: 45,
                        child: CircleAvatar(
                          backgroundColor: Color.fromRGBO(209, 233, 246, 1.0),
                          child: Icon(Icons.info_outline_rounded,color: Colors.indigo.withBlue(100)),
                        ),
                      ),
                      title: Text("About App",style:GoogleFonts.nunito(fontWeight: FontWeight.w700)),
                      trailing: Icon(Icons.keyboard_arrow_right_sharp,color: Colors.blueGrey,size: 30),
                      onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (builder) {
                          return About();
                        }));
                      },
                    ),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
