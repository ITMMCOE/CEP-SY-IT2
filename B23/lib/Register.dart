import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:login_form/main.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:image_picker/image_picker.dart';
import 'package:login_form/Error.dart';
import 'dart:io';

class Registration extends StatefulWidget {
  @override
  State<Registration> createState() => _RegistrationState();
}

class _RegistrationState extends State<Registration> {
  final _formKey = GlobalKey<FormState>();
  final emailController=TextEditingController();
  final passwordController=TextEditingController();
  final nameController=TextEditingController();
  final mobileNoController=TextEditingController();
  String imageUrl='';
  bool loading=false;
  bool pass=true;

  FirebaseAuth _auth=FirebaseAuth.instance;
  CollectionReference collectref=FirebaseFirestore.instance.collection('Users');
  Reference ref=FirebaseStorage.instance.ref().child('user_profile_pic');

  String? name;
  File? image;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: ListView(
        children:[ Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 40),
              child: Text("Welcome!",style:  GoogleFonts.alexBrush(fontSize: 47),),
            ),
            Text("Sign up to get started.",style:  GoogleFonts.albertSans(fontSize: 14),),
            SizedBox(height: 30,),
            Container(
              height: 80,width: 80,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(50),
                  image: DecorationImage(image: AssetImage("assets/images/ProfilePic.jpg"),
                      colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.3), BlendMode.darken,))),
              child: IconButton(
                icon: Icon(Icons.add_a_photo_outlined,color: Colors.white,),
                onPressed: () async {
                  final pickedImage =await  ImagePicker().pickImage(source: ImageSource.gallery);
                  image=File(pickedImage!.path.toString());
                }
              ),
            ),
            SizedBox(height: 20,),
            Container(
              width: 300,
              child: TextFormField(
                keyboardType: TextInputType.name,
                decoration: InputDecoration(labelText: "Username",
                    labelStyle: TextStyle(fontSize: 15),
                    prefixIcon: Icon(Icons.person_outline,size: 19,),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                    controller: nameController,
                    validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter name!';
                    }
                    return null;
                    },
              ),
            ),
            SizedBox(height: 20,),
            Container(
              width: 300,
              child: TextFormField(
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: "Mobile",
                    labelStyle: TextStyle(fontSize: 15),
                    prefixIcon: Icon(Icons.call_outlined,size: 18,),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                controller: mobileNoController,
                validator: (value) {
                  if(value==null || value.isEmpty || value.length!=10) {
                    return 'Please enter valid mobile no.!';
                  }
                  return null;
                },
              ),
            ),
            SizedBox(height: 20,),
            Container(
              width: 300,
              child: TextFormField(
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: "Email",
                    labelStyle: TextStyle(fontSize: 15),
                    prefixIcon: Icon(Icons.email_outlined,size: 18,),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                controller: emailController,
                validator: (value) {
                  if(value==null || value.isEmpty) {
                    return 'Please enter email!';
                  }
                  return null;
                },
              ),
            ),
            SizedBox(height: 20,),
            Container(
              width: 300,
              child: TextFormField(
                keyboardType: TextInputType.visiblePassword,
                obscureText: pass?true:false,
                decoration: InputDecoration(labelText: "Password", labelStyle: TextStyle(fontSize: 15),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(5)),
                  prefixIcon: IconButton(
                    icon: pass?Icon(Icons.lock_outline_rounded):Icon(Icons.lock_open_outlined),
                    onPressed: (){
                      setState(() {
                        pass=pass?false:true;
                      });
                    },
                  ),),
                controller: passwordController,
                validator: (value) {
                  if(value==null || value.isEmpty) {
                    return 'Please enter password!';
                  }
                  return null;
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(25, 20, 25, 0),
              child: Text("or"),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(0,20, 0, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                      height: 32,
                      width: 32,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(50),border: Border.all(color:Colors.black)),
                      child: Center(child: FaIcon(FontAwesomeIcons.facebookF,size: 16))),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                    child: Container(
                        height: 32,
                        width: 32,
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(50),border: Border.all(color: Colors.black),),
                        child: Center(child: FaIcon(FontAwesomeIcons.google,size: 15,))),
                  ),
                  Container(
                      height: 32,
                      width: 32,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(50),border: Border.all(color: Colors.black.withOpacity(0.8))),
                      child: Center(child: FaIcon(FontAwesomeIcons.twitter,size: 15,))
                  ),
                ],
              ),
            ),
            SizedBox(height: 30,),
            Container(
              height: 44,width: 260,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),color: Colors.black),
              child: ElevatedButton(
                child: loading?CircularProgressIndicator(color: Colors.white,):Text("Sign Up",style: TextStyle(fontSize: 17),),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.black,foregroundColor: Colors.white),
                onPressed: () async {
                  setState(() {
                    loading=true;
                  });
                  if (_formKey.currentState!.validate()) {
                  await _auth.createUserWithEmailAndPassword(
                      email: emailController.text,
                      password: passwordController.text).then((onValue) async {
                        if(image!=null){
                          await ref.child(_auth.currentUser!.uid).putFile(image!);
                          imageUrl=await ref.child(_auth.currentUser!.uid).getDownloadURL();
                        }
                        await collectref.doc(_auth.currentUser!.uid).set({
                          'userName':nameController.text.toString(),
                          'mobileNo':mobileNoController.text.toString(),
                          'email':emailController.text.toString(),
                          'password':passwordController.text.toString(),
                          'pfpURL':imageUrl.toString(),
                        });
                        final msg = SnackBar(content: Text("Account created"),);
                        ScaffoldMessenger.of(context).showSnackBar(msg);
                        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => Login()),);
                  }).onError((error, stackTrace){
                    setState(() {
                      loading=false;
                    });
                    Error().toastMessage(error.toString());
                  });
                } else {
                    setState(() {
                      loading=false;
                    });
                  }
                },
              ),
            ),
            SizedBox(height: 10,),
            Text("Already have an account?",style: TextStyle(fontSize: 13)),
            TextButton(
              child: Text("Log in",style: TextStyle(fontSize: 13,color: Colors.black),),
              onPressed: () {
                  Navigator.pop(context, MaterialPageRoute(builder: (builder){
                    return Login();
                  }));
              },
            )
          ],
          ),
        ),
      ],
      )
    );
  }
}
