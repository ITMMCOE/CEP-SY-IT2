import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:login_form/Home.dart';
import 'main.dart';

class Flash extends StatefulWidget {
  @override
  State<Flash> createState() => _FlashState();
}

class _FlashState extends State<Flash> {

  @override
  void initState() {
    super.initState();
    final FirebaseAuth _auth = FirebaseAuth.instance;
    final user = _auth.currentUser;
    Timer(Duration(seconds: 2),() {
      if(user!=null) {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (builder){
          return Home();
        }));
      } else {
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) {
            return Login();
          },),);
      }
    },);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black.withOpacity(0.7),
      body:
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.house_outlined,size: 40,color: Colors.white,),
              SizedBox(height: 10,),
              Text("Nestly",style: GoogleFonts.akayaTelivigala(fontSize: 30,color: Colors.white),),
            ],
          )
        ),
    );
  }
}
