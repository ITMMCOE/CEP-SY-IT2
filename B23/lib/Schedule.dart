import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:login_form/Home.dart';
import 'package:login_form/ProInfo.dart';

class Schedule extends StatefulWidget {
  @override
  State<Schedule> createState() => _ScheduleState();
  final String documentId;
  Schedule({required this.documentId});
}

class _ScheduleState extends State<Schedule> {

  CollectionReference ref=FirebaseFirestore.instance.collection('Properties');
  User? user=FirebaseAuth.instance.currentUser;
  bool loading=false;
  DateTime? pickedDate;
  TimeOfDay? pickedTime;
  final _formKey = GlobalKey<FormState>();
  final buyerNameController=TextEditingController();
  final buyerEmailController=TextEditingController();
  final buyerNumberController=TextEditingController();
  final addressController=TextEditingController();
  final dateController=TextEditingController();
  final timeController=TextEditingController();
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Schedule meeting",style: TextStyle(fontSize: 21),),
      ),
      body: Padding(padding: EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: ListView(
          children: [
            StreamBuilder(
              stream: ref.doc(widget.documentId).snapshots(),
              builder: (context, AsyncSnapshot<DocumentSnapshot> snapshot){
                if(snapshot.hasData){
                  Map<String, dynamic> data=snapshot.data!.data() as Map<String, dynamic>;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start ,
                    children: [
                      Text("Property",style: TextStyle(fontSize: 17),),
                      SizedBox(height: 10,),
                      Container(
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87.withOpacity(0.2))),
                        child: Padding(
                          padding: const EdgeInsets.all(10),
                          child: Row(
                            children: [
                                Container(
                                  height: 120,
                                  width: 170,
                                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),
                                      image: DecorationImage(image: NetworkImage(data['propertyImageUrl']),fit: BoxFit.cover)),
                                ),
                                SizedBox(width: 15,),
                                Expanded(
                                  child:Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(data['propertyName'],style: TextStyle(fontSize: 18,fontWeight: FontWeight.w500,color: Colors.black87),),
                                      Text("₹ ${data['sellingPrice']}",style: TextStyle(fontSize: 16,fontWeight: FontWeight.w500,color: Colors.black54),),
                                      Text("${data['propertyType']} | ${data['city']}, ${data['state']} ${data['zipCode']}",style: TextStyle(fontSize: 15,color: Colors.grey[700],fontWeight: FontWeight.w600),),
                                    ],)
                                ),
                            ],
                          ),
                        ),
                      ),
                      SizedBox(height: 25,),
                      Text("Buyer info",style: TextStyle(fontSize: 17),),
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
                                controller: buyerNameController,
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
                                controller: buyerEmailController,
                                validator: (value){
                                  if(value==null || value.isEmpty){
                                    return "Email is required!";
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
                                controller: buyerNumberController,
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
                      SizedBox(height: 25,),
                      Text("Schedule info",style: TextStyle(fontSize: 17),),
                      SizedBox(height: 10,),
                      Container(
                        decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87.withOpacity(0.1))),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              TextFormField(
                                decoration: InputDecoration(suffixIcon: Icon(Icons.date_range_outlined),labelText: "Date",
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                                readOnly: true,
                                controller: dateController,
                                validator: (value){
                                  if(value!.isEmpty || value==null){
                                    return 'Date is required';
                                  }
                                  return null;
                                },
                                onTap: () async {
                                  pickedDate=await  showDatePicker(
                                    context: context,
                                    initialDate: DateTime.now(),
                                    firstDate: DateTime(2000),
                                    lastDate: DateTime(2100),
                                  );
                                  if(pickedDate!=null){
                                    setState(() {
                                      dateController.text=pickedDate.toString().split(" ")[0];
                                    });
                                  }
                                },
                              ),
                              SizedBox(height: 20,),
                              TextFormField(
                                decoration: InputDecoration(labelText: "Time",suffixIcon: Icon(Icons.watch_later_outlined),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                                readOnly: true,
                                controller: timeController,
                                validator: (value){
                                  if(value!.isEmpty || value==null) {
                                    return 'Time is required!';
                                  }
                                  return null;
                                },
                                onTap: ()async {
                                  pickedTime =await showTimePicker(
                                    context: context,
                                    initialTime: TimeOfDay.now(),
                                  );
                                  if(pickedTime!=null) {
                                    setState(() {
                                      timeController.text=pickedTime!.hour.toString()+":"+pickedTime!.minute.toString()+" "+pickedTime!.period.name.toUpperCase();
                                    });
                                  }
                                },
                              ),
                              SizedBox(height: 20,),
                              TextFormField(
                                keyboardType: TextInputType.text,
                                decoration: InputDecoration(labelText: "Address",suffixIcon: Icon(Icons.location_on_outlined),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                                controller: addressController,
                                validator: (value){
                                  if(value!.isEmpty || value==null){
                                    return 'Address is required';
                                  }
                                  return null;
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
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),color: Colors.black87),
                            child: TextButton(
                              child: loading? CircularProgressIndicator(color: Colors.white,):Text("Confirm meeting",style: TextStyle(color: Colors.white,fontSize: 17,fontWeight: FontWeight.w600)),
                              onPressed: () async {
                                if(_formKey.currentState!.validate()){
                                  setState(() {
                                    loading=true;
                                  });
                                  CollectionReference collref=FirebaseFirestore.instance.collection("SCH_${user!.uid}");
                                  await collref.doc().set({
                                    'scheduleType':"Seller details",
                                    'buyerName':buyerNameController.text.toString(),
                                    'buyerEmail':buyerEmailController.text.toString(),
                                    'buyerNumber':buyerNumberController.text.toString(),
                                    'propertyId':widget.documentId,
                                    'sellerName':data['sellerName'],
                                    'sellerEmail':data['sellerEmail'],
                                    'sellerContact':data['sellerContact'],
                                    'sellerId':data['sellerId'],
                                    'scheduleDate':dateController.text.toString(),
                                    'scheduleTime':timeController.text.toString(),
                                    'address':addressController.text.toString(),
                                    'propertyName':data['propertyName'],
                                  });
                                  CollectionReference seller=FirebaseFirestore.instance.collection("SCH_${data['sellerId']}");
                                  await seller.doc().set({
                                    'scheduleType':"Buyer details",
                                    'buyerName':data['sellerName'],
                                    'buyerEmail':data['sellerEmail'],
                                    'buyerNumber':data['sellerContact'],
                                    'propertyId':widget.documentId,
                                    'sellerName':buyerNameController.text.toString(),
                                    'sellerEmail':buyerEmailController.text.toString(),
                                    'sellerContact':buyerNumberController.text.toString(),
                                    'sellerId':user!.uid.toString(),
                                    'scheduleDate':dateController.text.toString(),
                                    'scheduleTime':timeController.text.toString(),
                                    'address':addressController.text.toString(),
                                    'propertyName':data['propertyName'],
                                  });

                                  final msg=SnackBar(content: Text("Meeting scheduled successfully"));
                                  ScaffoldMessenger.of(context).showSnackBar(msg);
                                  Navigator.of(context).pushAndRemoveUntil( MaterialPageRoute(builder: (context) => Home()),
                                        (Route<dynamic> route) => false,);
                                }
                              },
                            ),
                          ),
                          Container(
                            height:45,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(5),border: Border.all(color: Colors.black87.withOpacity(0.9))),
                            child: TextButton(
                              child: Text("Cancel",style: TextStyle(color: Colors.black87,fontSize: 17,fontWeight: FontWeight.w600)),
                              onPressed: (){
                                Navigator.pop(context, MaterialPageRoute(builder: (builder){
                                  return ProInfo(documentId: widget.documentId,);
                                }));
                              },
                            ),
                          ),
                        ],
                      )
                    ],
                  );
                } else if(snapshot.hasError){
                  return Center(child: Text("Something went wrong!"),);
                } else {
                  return Center(child: CircularProgressIndicator(),);
                }
              },
            )
          ],
        ),
      ),),
    );
  }
}