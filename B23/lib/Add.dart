import 'dart:io';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:login_form/Home.dart';
import 'package:login_form/Error.dart';

class Add extends StatefulWidget {
  
  @override
  State<Add> createState() => _AddState();
}

class _AddState extends State<Add> {
  User? _auth=FirebaseAuth.instance.currentUser;
  Reference photoRef=FirebaseStorage.instance.ref().child('property_photo');
  Reference videoRef=FirebaseStorage.instance.ref().child('property_video');
  CollectionReference collectionReference=FirebaseFirestore.instance.collection('Properties');

  final _formKey = GlobalKey<FormState>();
  File? _image;
  File? _video;
  String? imageUrl;
  String? videoUrl;
  bool loading=false;

  final pptNameController=TextEditingController();
  final pptTypeController=TextEditingController();
  final descriptionController=TextEditingController();
  final addressController=TextEditingController();
  final zipController=TextEditingController();
  final cityController=TextEditingController();
  final stateController=TextEditingController();
  final bedroomController=TextEditingController();
  final bathroomController=TextEditingController();
  final carpetController=TextEditingController();
  final builtController=TextEditingController();
  final floorController=TextEditingController();
  final balconyController=TextEditingController();
  final yearController=TextEditingController();
  final priceController=TextEditingController();
  final sellerNameController=TextEditingController();
  final sellerEmailController=TextEditingController();
  final sellerContactController=TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Add Property"),
        bottom: PreferredSize(preferredSize: Size.fromHeight(4),
          child: Container(
            height: 4,decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.black,width: 1.0))),
          ),),
      ),

      body: Padding(
        padding: const EdgeInsets.all(15.0),
        child: Form(
          key: _formKey,
          child: ListView(
          children: [
            SizedBox(height: 20,),
            Text("Add your new",style: TextStyle(fontSize: 20,fontWeight: FontWeight.w500,color: Colors.black54),),
            Text("Property",style: GoogleFonts.alexBrush(fontSize: 47,fontWeight: FontWeight.w500),),
            SizedBox(height: 40,),
            Text("Property details",style: TextStyle(fontSize: 21,color: Colors.black87,fontWeight: FontWeight.w500),),
            SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),border: Border.all(color:Colors.black87.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextFormField(
                      keyboardType: TextInputType.name,
                      decoration: InputDecoration(labelText: "Name",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5),)),
                      controller: pptNameController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Please enter name!";
                        } else {
                          return null;
                        }
                      },
                    ),
                    SizedBox(height: 20,),
                    TextFormField(
                      keyboardType: TextInputType.name,
                      decoration: InputDecoration(labelText: "Property type",hintText: "eg. Tower, Villa...",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: pptTypeController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Please enter type!";
                        } else {
                          return null;
                        }
                      },
                    ),
                    SizedBox(height: 20,),
                    TextFormField(
                      maxLines: 5,
                      keyboardType: TextInputType.name,
                      decoration: InputDecoration(labelText: "Description",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: descriptionController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Please enter description!";
                        } else {
                          return null;
                        }
                      },
                    ),
                ],),
              ),
            ),
            SizedBox(height: 30,),
            Text("Location details",style: TextStyle(fontSize: 21,color: Colors.black87,fontWeight: FontWeight.w500),),
            SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),border: Border.all(color: Colors.black87.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    TextFormField(
                      maxLines: 4,
                      keyboardType: TextInputType.name,
                      decoration: InputDecoration(labelText: "Address",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: addressController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Please enter address!";
                        } else {
                          return null;
                        }
                      },
                    ),
                    SizedBox(height: 20,),
                    TextFormField(
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(labelText: "Zip code",
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: zipController,
                      validator: (value){
                        if(value==null || value.isEmpty || value.length!=6){
                          return "Please enter valid zip!";
                        } else {
                          return null;
                        }
                      },
                    ),
                    SizedBox(height: 20,),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.name,
                            decoration: InputDecoration(labelText: "City",
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: cityController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter city!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                        SizedBox(width: 15,),
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.name,
                            decoration: InputDecoration(labelText: "State",
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: stateController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter state!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 30,),
            Text("Property details",style: TextStyle(fontSize: 21,fontWeight: FontWeight.w500,color: Colors.black87)),
            SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.black87.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(labelText: "No. of bedrooms",
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: bedroomController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter bedrooms!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                        SizedBox(width: 15,),
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(labelText: "No. of bathrooms",
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: bathroomController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter bathrooms!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20,),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(labelText: "Carpet Area",
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: carpetController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter carpet area";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                        SizedBox(width: 15,),
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(labelText: "Built Up Area",
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: builtController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter built area!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20,),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(labelText: "Total floors",
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: floorController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter floors!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                        SizedBox(width: 15,),
                        Expanded(
                          child: TextFormField(
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(labelText: "Balcony",
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                            controller: balconyController,
                            validator: (value){
                              if(value==null || value.isEmpty){
                                return "Please enter balcony!";
                              } else {
                                return null;
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20,),
                    TextFormField(
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(label: Text("Build Year"),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: yearController,
                      validator: (value) {
                       if(value!.isEmpty || value==null){
                         return 'Year is required';
                       }
                       return null;
                      },
                    )
                  ],
                ),
              ),
            ),
            SizedBox(height: 30,),
            Text("Pricing information",style: TextStyle(fontSize: 21,fontWeight: FontWeight.w500,color: Colors.black87)),
            SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),border: Border.all(color: Colors.black87.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    TextFormField(
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(labelText: "Selling price",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: priceController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Please enter price!";
                        } else {
                          return null;
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 30,),
            Text("Images & Videos",style: TextStyle(fontSize: 21,color: Colors.black87,fontWeight: FontWeight.w500),),
            SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),border: Border.all(color: Colors.black87.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      height:60,
                      width: 60,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20),border: Border.all(color: Colors.black87.withOpacity(0.5))),
                      child: IconButton(
                        icon: Icon(Icons.add_photo_alternate_outlined),
                        onPressed: () async {
                          final pickedImage= await ImagePicker().pickImage(source: ImageSource.gallery);
                          _image=File(pickedImage!.path.toString());
                        },
                      ),
                    ),
                    Container(
                      height:60,
                      width: 60,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20),border: Border.all(color: Colors.black87.withOpacity(0.5))),
                      child:IconButton(
                        icon: Icon(Icons.video_call_outlined,size: 33,),
                        onPressed: ()async {
                          final pickedVideo=await ImagePicker().pickVideo(source: ImageSource.gallery);
                          _video=File(pickedVideo!.path.toString());
                        },
                      ),
                    )
                  ],
                ),
              ),
            ),
            SizedBox(height: 30,),
            Text("Contact information",style: TextStyle(fontSize: 21,color: Colors.black87,fontWeight: FontWeight.w500)),
            SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),border: Border.all(color: Colors.black87.withOpacity(0.1))),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    TextFormField(
                      keyboardType: TextInputType.name,
                      decoration: InputDecoration(labelText: "Full name",
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(5)),),
                      controller: sellerNameController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Name is required!";
                        } else {
                          return null;
                        }
                      },
                      ),
                    SizedBox(height: 20,),
                    TextFormField(
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(labelText: "Email address",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: sellerEmailController,
                      validator: (value){
                        if(value==null || value.isEmpty){
                          return "Email name is required!";
                        } else {
                          return null;
                        }
                      },
                    ),
                    SizedBox(height: 20,),
                    TextFormField(
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(labelText: "Contact number",
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                      controller: sellerContactController,
                      validator: (value){
                        if(value==null || value.isEmpty || value.length!=10){
                          return "Please enter valid no.!";
                        } else {
                          return null;
                        }
                      },
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 50,),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Container(
                  width: 120,
                  height: 45,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),color: Colors.black87),
                  child: TextButton(
                    child: loading?CircularProgressIndicator(color: Colors.white,):Text("Add",style: TextStyle(fontSize: 18,color: Colors.white,fontWeight: FontWeight.w500),),
                    onPressed: () async {
                      if(_formKey.currentState!.validate()) {
                        setState(() {
                          loading=true;
                        });
                        if(_image==null || _video==null){
                          if(_image==null){
                            Error().toastMessage("Consider to add property image!");
                          } else {
                            Error().toastMessage("Consider to add property video!");
                          }
                          setState(() {
                            loading=false;
                          });
                        } else {
                          final String unique=DateTime.now().millisecondsSinceEpoch.toString();
                          final String imageId=DateTime.now().millisecondsSinceEpoch.toString();
                          final String videoId=DateTime.now().millisecondsSinceEpoch.toString();
                          await photoRef.child(imageId).putFile(_image!);
                          await videoRef.child(videoId).putFile(_video!);
                          imageUrl=await photoRef.child(imageId).getDownloadURL();
                          videoUrl=await videoRef.child(videoId).getDownloadURL();

                          await collectionReference.doc(unique).set({
                            'address':addressController.text.toString(),
                            'balcony':balconyController.text.toString(),
                            'builtArea':builtController.text.toString(),
                            'carpetArea':carpetController.text.toString(),
                            'city':cityController.text.toString(),
                            'description':descriptionController.text.toString(),
                            'noOfBathrooms':bathroomController.text.toString(),
                            'noOfBedrooms':bedroomController.text.toString(),
                            'propertyImageUrl':imageUrl.toString(),
                            'propertyName':pptNameController.text.toString(),
                            'propertyType':pptTypeController.text.toString(),
                            'propertyVideoUrl':videoUrl.toString(),
                            'sellerContact':sellerContactController.text.toString(),
                            'sellerEmail':sellerEmailController.text.toString(),
                            'sellerName':sellerNameController.text.toString(),
                            'sellingPrice':priceController.text.toString(),
                            'sellerId':_auth!.uid.toString(),
                            'state':stateController.text.toString(),
                            'totalFloors':floorController.text.toString(),
                            'year':yearController.text.toString(),
                            'zipCode':zipController.text.toString(),
                          });
                          final msg=SnackBar(content: Text("Property added sucessfully"));
                          ScaffoldMessenger.of(context).showSnackBar(msg);
                          Navigator.pop(context, MaterialPageRoute(builder: (builder){
                            return Home();
                          }));
                        }
                      }
                    },
                  ),
                ),
                Container(
                  height: 45,
                  width: 120,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87.withOpacity(0.3))),
                  child: TextButton(
                    child: Text("Cancle",style: TextStyle(fontSize: 18,color: Colors.black87,fontWeight: FontWeight.w500),),
                    onPressed: () {
                      Navigator.pop(context, MaterialPageRoute(builder: (builder){
                        return Home();
                      }));
                    },
                  ),
                )
              ],
            ),
          ],
        ),
      )
      ),
    );
  }
}
