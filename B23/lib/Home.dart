import 'dart:async';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:login_form/About.dart';
import 'package:login_form/Add.dart';
import 'package:login_form/AllProperty.dart';
import 'package:login_form/Cart.dart';
import 'package:login_form/Favourite.dart';
import 'package:login_form/Help.dart';
import 'package:login_form/ProInfo.dart';
import 'package:login_form/Profile.dart';
import 'package:login_form/main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class Home extends StatefulWidget {
  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  CollectionReference collectionReference=FirebaseFirestore.instance.collection('Properties');
  CollectionReference userData=FirebaseFirestore.instance.collection('Users');

  ScrollController _scrollController = ScrollController();
  int _currentIndex = 0;

  void initState() {
    super.initState();
    Timer.periodic(Duration(seconds: 2), (Timer timer) {
      if(_currentIndex < 3-1){
        _currentIndex++;
        _scrollController.animateTo(_currentIndex * 365,duration: Duration(milliseconds: 500),curve: Curves.easeInOut,);
      } else {
        _currentIndex = 0;
        _scrollController.animateTo(0,duration: Duration(milliseconds: 500), curve: Curves.easeInOut,);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        actions: [
          IconButton(
            icon: Icon(Icons.shopping_cart_outlined, color: Colors.black87,size: 27,),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (builder){
                return Cart();
              }));
            },
          ),
        ],
        title: Text("Nestly", style: GoogleFonts.akayaTelivigala(textStyle: TextStyle(fontSize: 28,),),),
        centerTitle: true,
      ),
      drawer: Drawer(
          child: ListView(
        children: [
          Container(
            height: 160,
            child: StreamBuilder(
              stream: userData.doc(_auth.currentUser!.uid).snapshots(),
              builder: (context, AsyncSnapshot<DocumentSnapshot> snapshot){
                if(snapshot.hasData){
                  Map<String, dynamic> data=snapshot.data!.data() as Map<String, dynamic>;
                  return DrawerHeader(
                    decoration: BoxDecoration(image: DecorationImage(image: AssetImage("assets/images/pfpbg.jpg"), fit: BoxFit.fitWidth)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                            height: 55,
                            width: 75,
                            child: CircleAvatar(backgroundImage: (data['pfpURL'].toString().isEmpty)?AssetImage("assets/images/ProfilePic.jpg"):NetworkImage(data['pfpURL']),
                              radius: 50,
                            )),
                        SizedBox(height: 15,),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(10, 0, 0, 0),
                          child: Text(data['userName'], style: TextStyle(color: Colors.white, fontSize: 17)),
                        ),
                        Padding(
                          padding: const EdgeInsets.fromLTRB(10, 0, 0, 0),
                          child: Text(data['email'], style: TextStyle(fontSize: 14, color: Colors.white),),
                        )
                      ],
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
          ListTile(
            title: Text("Home", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.home_outlined, size: 24,),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return Home();
              }));
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("Profile", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.person_outline, size: 24),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return Profile();
              }));
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("Schedule's", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.schedule_send_outlined, size: 24),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return Cart();
              }));
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("Add Property", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.add_shopping_cart, size: 24),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return Add();
              }));
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("Favourite", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.favorite_border_rounded, size: 24),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return Favourite();
              }));
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("Help", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.question_mark_outlined, size: 24),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return Help();
              }));
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("Logout", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.logout_outlined, size: 24),
            onTap: () {
              if (_auth.currentUser != null) {
                _auth.signOut();
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (context) => Login()),
                  (Route<dynamic> route) => false,
                );
              }
            },
          ),
          SizedBox(height: 5,),
          ListTile(
            title: Text("About us", style: TextStyle(fontSize: 17)),
            leading: Icon(Icons.info_outline, size: 24,),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(builder: (context) {
                return About();
              }));
            },
          ),
          SizedBox(height: 100),
          Container(height: 1, decoration: BoxDecoration(border: Border.all(color: Colors.black)),),
          SizedBox(height: 5,),
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text("Powered by Nestly | © 2024 Nestly All Right Reserved", style: TextStyle(fontSize: 11),),
              Text("Version (beta)", style: TextStyle(fontSize: 11),),
              Text("Devloped by StreetDog Production", style: TextStyle(fontSize: 11)),
              Text("{ Rutvik Kumbhar }", style: TextStyle(fontSize: 11,),),
            ],
          ),
        ],
      )),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ListView(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 0, 10, 0),
                  child: TextFormField(
                    decoration: InputDecoration(hintText: 'Search', hintStyle: TextStyle(fontSize: 18, color: Colors.black45,),
                      suffixIcon: Icon(Icons.search_rounded, color: Colors.black87, size: 30,),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none,),
                      filled: true,
                      fillColor: Colors.grey[200],
                    ),
                    readOnly: true,
                    onTap: (){
                      final msg=SnackBar(content: Text("Feature coming soon!"));
                      ScaffoldMessenger.of(context).showSnackBar(msg);
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 15, 10, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Popular villa's", style: TextStyle(fontSize: 18, color: Colors.black87, fontWeight: FontWeight.w600),),
                      TextButton(
                        child: Text("See all", style: TextStyle(fontSize: 17, color: Colors.black54, fontWeight: FontWeight.w500),),
                        onPressed: () {
                          Navigator.push(context, MaterialPageRoute(builder: (builder){
                            return AllProperty();
                          }));
                        },
                      )
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 10, 15, 10),
                  child: Container(
                      height: 180,
                      child:StreamBuilder(
                        stream: collectionReference.snapshots(),
                        builder: (context, AsyncSnapshot<QuerySnapshot> snapshot){
                          if(snapshot.hasData){
                            return ListView.builder(
                              controller: _scrollController,
                              scrollDirection: Axis.horizontal,
                              itemCount: 3,
                              itemBuilder: (itemBuilder, index) {
                                DocumentSnapshot data=snapshot.data!.docs[index];
                                return Padding(
                                  padding: const EdgeInsets.fromLTRB(5, 0, 5, 0),
                                  child: Container(
                                    height: 250,
                                    width: MediaQuery.of(context).size.width-50,
                                    decoration: BoxDecoration(image: DecorationImage(image: NetworkImage(data['propertyImageUrl']), fit: BoxFit.fill),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(20),
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.start,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text("Get your special", style: TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.w500),),
                                          Text("sale up to 50%", style: TextStyle(fontSize: 19, color: Colors.white, fontWeight: FontWeight.w500),),
                                          Text("Buy, before it runs out", style: TextStyle(fontSize: 15, color: Colors.white70, fontWeight: FontWeight.w500),),
                                          SizedBox(height: 25,),
                                          Container(
                                            height: 35,
                                            width: 100,
                                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30)),
                                            child: TextButton(
                                                child: Text("Buy now", style: TextStyle(fontSize: 14, color: Colors.black87, fontWeight: FontWeight.w600),),
                                                onPressed: () {
                                                  Navigator.push(context, MaterialPageRoute(builder: (builder) {
                                                    return ProInfo(documentId: data.id,);
                                                  }));
                                                }),
                                          )
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
                ),),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 5, 15, 10),
                  child: Container(
                    height: 50,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        TextButton(
                          child: Text("All", style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),),
                          onPressed: () {},
                        ),
                        TextButton(
                          child: Text("Luxury", style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),),
                          onPressed: () {
                            final msg=SnackBar(content: Text("Feature coming soon!"),duration: Duration(seconds: 1),);
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                          },
                        ),
                        TextButton(
                          child: Text("Beachfront", style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),),
                          onPressed: () {
                            final msg=SnackBar(content: Text("Feature coming soon!"),duration: Duration(seconds: 1),);
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                          },
                        ),
                        TextButton(
                          child: Text("Mountain", style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),),
                          onPressed: () {
                            final msg=SnackBar(content: Text("Feature coming soon!"),duration: Duration(seconds: 1),);
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                          },
                        ),
                        TextButton(
                          child: Text("Modern", style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),),
                          onPressed: () {
                            final msg=SnackBar(content: Text("Feature coming soon!"),duration: Duration(seconds: 1),);
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                          },
                        ),
                        TextButton(
                          child: Text("Pool", style: TextStyle(fontSize: 16, color: Colors.grey[700], fontWeight: FontWeight.w600),),
                          onPressed: () {
                            final msg=SnackBar(content: Text("Feature coming soon!"),duration: Duration(seconds: 1),);
                            ScaffoldMessenger.of(context).showSnackBar(msg);
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 0, 15, 0),
                  child: Container(
                    height: 470,
                    child: StreamBuilder(
                      stream: collectionReference.snapshots(),
                      builder: (context, AsyncSnapshot<QuerySnapshot> streamSnapshot) {
                        if(streamSnapshot.hasData){
                          return ListView.builder(
                            itemCount: streamSnapshot.data!.docs.length,
                            itemBuilder: (itemBuilder, index) {
                              DocumentSnapshot data=streamSnapshot.data!.docs[index];
                              return Padding(
                                padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                                child: Container(
                                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), border: Border.all(color: Colors.black87.withOpacity(0.2))),
                                  child: Padding(
                                    padding: const EdgeInsets.fromLTRB(10, 10, 0, 10),
                                    child: Row(
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
                        } else if (streamSnapshot.hasError) {
                          return Center(child: Text('Something went wrong!'),);
                        } else {
                          return Center(child: CircularProgressIndicator(),);
                        }
                      },
                    )
                  ),
                ),
                SizedBox(
                  height: 15,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 10, 15, 15),
                  child: Container(
                    padding: EdgeInsets.all(13.0),
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                            child: Text('Add your property today!', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w600))),
                        Container(
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), color: Colors.white),
                          width: 140,
                          child: TextButton(
                            style: TextButton.styleFrom(foregroundColor: Colors.black87, backgroundColor: Colors.white,),
                            child: Text('Get Started', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),),
                            onPressed: () {
                              Navigator.push(context,
                                  MaterialPageRoute(builder: (builder) {
                                return Add();
                              }));
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(15, 10, 15, 10),
                  child: Text('Recent Activity', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),),
                ListTile(
                  leading: Icon(Icons.new_releases),
                  title: Text('New Property Listed', style: TextStyle(fontWeight: FontWeight.w600),),
                  subtitle: Text('Luxury Villa in Mumbai'),
                ),
                ListTile(
                  leading: Icon(Icons.trending_down),
                  title: Text('Price Drop', style: TextStyle(fontWeight: FontWeight.w600),),
                  subtitle: Text('Modern Flat in Pune'),
                ),
                ListTile(
                  leading: Icon(Icons.check_circle),
                  title: Text('Property Sold', style: TextStyle(fontWeight: FontWeight.w600),),
                  subtitle: Text('Beach House in Goa'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
