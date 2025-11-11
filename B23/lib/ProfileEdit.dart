import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:login_form/Profile.dart';
import 'package:login_form/Error.dart';

class ProfileEdit extends StatefulWidget {
  @override
  State<ProfileEdit> createState() => _ProfileEditState();
}

class _ProfileEditState extends State<ProfileEdit> {

  final _formKey = GlobalKey<FormState>();
  final emailController=TextEditingController();
  final passwordController=TextEditingController();
  final nameController=TextEditingController();
  final mobileNoController=TextEditingController();
  
  FirebaseAuth _auth=FirebaseAuth.instance;
  Reference ref=FirebaseStorage.instance.ref().child('user_profile_pic');
  CollectionReference collectionReference=FirebaseFirestore.instance.collection('Users');
  File? image;
  bool loading=false;
  bool pass=true;
  
  String? userName;
  String? email;
  String? mobileNo;
  String? password;
  String? imageurl;
  String? url;

  void initState() {
    super.initState();
    getData();
  }

  Future<void> getData() async {
    User? user=_auth.currentUser;
    DocumentSnapshot data=await FirebaseFirestore.instance.collection('Users').doc(user!.uid).get();
    setState(() {
      userName=data['userName'];
      email=data['email'];
      mobileNo=data['mobileNo'];
      password=data['password'];
      passwordController.text=data['password'];
      imageurl=data['pfpURL'];
    });
  }

  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title:Text("Edit Profile",style: TextStyle(fontSize:21)),
      ),
        backgroundColor: Colors.white,
      body:Padding(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    height: 140,
                    width: 140,
                    decoration: BoxDecoration(image: DecorationImage(image: (imageurl!.isEmpty)?AssetImage("assets/images/ProfilePic.jpg"):NetworkImage(imageurl!),fit: BoxFit.cover),
                        borderRadius: BorderRadius.circular(100),border: Border.all(color: Colors.black87.withOpacity(0.2))),
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(95,95,0,0),
                      child: Container(
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(100),
                            border: Border.all(color: Colors.black54),color: Colors.white),
                        child: IconButton(
                          icon: Icon(Icons.edit_outlined,color: Colors.black87,),
                          onPressed: () async {
                            final pickedImage=await ImagePicker().pickImage(source: ImageSource.gallery);
                            File? image=File(pickedImage!.path.toString());
                            try{
                              await ref.child(_auth.currentUser!.uid).putFile(image);
                              url=await ref.child(_auth.currentUser!.uid).getDownloadURL();
                              collectionReference.doc(_auth.currentUser!.uid).update({
                                'pfpURL': url.toString(),
                              });
                            }
                            finally{
                              setState(() {
                                imageurl=url;
                              });
                              final msg=SnackBar(content: Text("Profile picture updates"));
                              ScaffoldMessenger.of(context).showSnackBar(msg);
                            }
                          },
                        ),
                      ),
                    ),
                  )
                ],
              ),
              SizedBox(height: 15,),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Full Name",style: TextStyle(fontSize: 17,color: Colors.black87,fontWeight: FontWeight.w600),),
                    SizedBox(height: 5,),
                    TextFormField(
                      keyboardType: TextInputType.name,
                      decoration: InputDecoration(hintText: userName,hintStyle: TextStyle(fontWeight: FontWeight.w500,color: Colors.black54),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: nameController,
                    ),
                    SizedBox(height: 20,),
                    Text("Mobile no.",style: TextStyle(fontSize: 17,color: Colors.black87,fontWeight: FontWeight.w600),),
                    SizedBox(height: 5,),
                    TextFormField(
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(hintText: "+91 $mobileNo",hintStyle: TextStyle(fontWeight: FontWeight.w500,color: Colors.black54),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: mobileNoController,
                    ),
                    SizedBox(height: 20,),
                    Text("Email",style: TextStyle(fontSize: 17,color: Colors.black87,fontWeight: FontWeight.w600),),
                    SizedBox(height: 5,),
                    TextFormField(
                      keyboardType: TextInputType.emailAddress, enabled: false,
                      decoration: InputDecoration(hintText: email,hintStyle: TextStyle(fontWeight: FontWeight.w500,color: Colors.black54),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: emailController,
                    ),
                    SizedBox(height: 20,),
                    Text("Password",style: TextStyle(fontSize: 17,color: Colors.black87,fontWeight: FontWeight.w600),),
                    SizedBox(height: 5,),
                    TextFormField(
                      keyboardType: TextInputType.visiblePassword,
                      decoration: InputDecoration(hintText: password,hintStyle: TextStyle(fontWeight: FontWeight.w500,color: Colors.black54),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5)),
                          suffixIcon: IconButton(
                            icon: pass?Icon(Icons.lock_outline_rounded):Icon(Icons.lock_open_outlined),
                            onPressed: (){
                              setState(() {
                                pass=pass?false:true;
                              });
                            },
                          )),
                      controller: passwordController,
                      obscureText: pass?true:false,
                    ),
                  ],
                ),
              ),
              SizedBox(height: 20,),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Container(
                    width: 140,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),color: Colors.black87),
                    child: TextButton(
                      child: loading?CircularProgressIndicator(color: Colors.white,):Text("Save Chnages",style: TextStyle(fontSize: 17,color: Colors.white),),
                      onPressed: () async {
                        if(passwordController.text.isEmpty && nameController.text.isEmpty && mobileNoController.text.isEmpty){
                          setState(() {
                            final msg=SnackBar(content: Text("No changes has been done!"));
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                            loading=false;
                            return;
                          });
                        } else {
                          setState(() {
                            loading=true;
                          });
                        }
                        AuthCredential credential = EmailAuthProvider.credential(
                          email: email.toString(),
                          password: password.toString(),
                        );
                        await _auth.currentUser!.reauthenticateWithCredential(credential);
                        if(passwordController.text.isNotEmpty){
                          await _auth.currentUser!.updatePassword(passwordController.text.toString()).then((onValue) async {
                            await collectionReference.doc(_auth.currentUser!.uid).update({
                              'password':passwordController.text.toString(),
                            });
                            final msg=SnackBar(content: Text("Changes saved successfully"));
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                            Navigator.pop(context, MaterialPageRoute(builder: (builder){
                              return Profile();
                            }));
                          }).onError((error, stackTrace){
                            Error().toastMessage(error.toString());
                            setState(() {
                              loading=false;
                            });
                          });
                        }
                        if(nameController.text.isNotEmpty){
                          await collectionReference.doc(_auth.currentUser!.uid).update({
                            'userName': nameController.text.toString(),
                          });
                          final msg=SnackBar(content: Text("Changes saved successfully"));
                          ScaffoldMessenger.of(context).showSnackBar(msg);
                          Navigator.pop(context, MaterialPageRoute(builder: (builder){
                            return Profile();
                          }));
                        }
                        if(mobileNoController.text.isNotEmpty) {
                          if(mobileNoController.text.toString().length ==10){
                            await collectionReference.doc(_auth.currentUser!.uid).update({
                              'mobileNo': mobileNoController.text.toString(),
                            });
                            final msg=SnackBar(content: Text("Changes saved successfully"));
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                            Navigator.pop(context, MaterialPageRoute(builder: (builder){
                              return Profile();
                            }));
                          } else {
                            Error().toastMessage("Invalid mobile number!");
                            setState(() {
                              loading = false;
                            });
                          }
                        }
                      },
                    ),
                  ),
                  Container(
                    width: 100,
                    height: 47,
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87)),
                    child: TextButton(
                      child: Text("Cancel",style: TextStyle(fontSize: 17,color: Colors.black),),
                      onPressed: (){
                        Navigator.pop(context, MaterialPageRoute(builder: (builder){
                          return Profile();
                        }));
                      },
                    ),
                  )
                ],
              )
            ],
          ),
        )
      )
    );
  }
}