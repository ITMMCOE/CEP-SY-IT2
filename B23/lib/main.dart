import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:login_form/Home.dart';
import 'package:login_form/flash.dart';
import 'Register.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:login_form/Error.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(myApp());
}

class myApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(textTheme: GoogleFonts.andikaTextTheme(Theme.of(context).textTheme,),),
      title: "Nestly",
      home: Flash(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class Login extends StatefulWidget {
  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  late final uid;
  User? user;
  bool loading=false;
  bool pass=true;

  FirebaseAuth _auth = FirebaseAuth.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: ListView(children: [
        Form(
          key: _formKey,
          child: Container(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 130),
                  child: Text("Good to see you!", style: GoogleFonts.alexBrush(fontSize: 47),),
                ),
                Text("Let's continue the journey.", style: GoogleFonts.albertSans(fontSize: 14),),
                SizedBox(height: 40,),
                Container(
                  width: 300,
                  child: TextFormField(
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(labelText: "Email", hintStyle: TextStyle(fontSize: 14), prefixIcon: Icon(Icons.email_outlined),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(5))),
                    controller: emailController,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter email!';
                      }
                      return null;
                    },
                  ),
                ),
                SizedBox(
                  height: 30,
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 25),
                  child: Container(
                    width: 300,
                    child: TextFormField(
                      keyboardType: TextInputType.text,
                      obscureText: pass?true:false,
                      decoration: InputDecoration(labelText: "Password", hintStyle: TextStyle(fontSize: 14),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(5),),
                        prefixIcon: Icon(Icons.security_outlined),
                        suffixIcon: IconButton(icon: pass?Icon(Icons.lock_outline):Icon(Icons.lock_open_outlined),
                            onPressed: (){
                          setState(() {
                            pass=pass?false:true;
                        });
                      }),),
                      controller: passwordController,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter password!';
                        }
                        return null;
                      },
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(25, 0, 25, 0),
                  child: Text("or"),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 20, 0, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                          height: 32,
                          width: 32,
                          decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(50),
                              border: Border.all(color: Colors.black)),
                          child: Center(
                              child: FaIcon(FontAwesomeIcons.facebookF,
                                  size: 16))),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                        child: Container(
                            height: 32,
                            width: 32,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(50),
                              border: Border.all(color: Colors.black),
                            ),
                            child: Center(
                                child: FaIcon(
                              FontAwesomeIcons.google,
                              size: 15,
                            ))),
                      ),
                      Container(
                          height: 32,
                          width: 32,
                          decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(50),
                              border: Border.all(
                                  color: Colors.black.withOpacity(0.8))),
                          child: Center(
                              child: FaIcon(FontAwesomeIcons.twitter, size: 15,))
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 20, 0, 8),
                  child: Container(
                    height: 44,
                    width: 260,
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(5),
                        color: Colors.black),
                    child: ElevatedButton(
                        child: loading?CircularProgressIndicator(color: Colors.white,):Text("Log In", style: TextStyle(fontSize: 17)),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.black,
                            foregroundColor: Colors.white),
                        onPressed: () async {
                          if (_formKey.currentState!.validate()) {
                            setState(() {
                              loading=true;
                            });
                            await _auth.signInWithEmailAndPassword(
                                    email: emailController.text,
                                    password: passwordController.text).then((onValue) {
                              Navigator.of(context).pushAndRemoveUntil( MaterialPageRoute(builder: (context) => Home()),
                                (Route<dynamic> route) => false,);
                            }).onError((error, stackTrace) {
                              Error().toastMessage(error.toString());
                              setState(() {
                                loading=false;
                              });
                            });
                          }
                        }),
                  ),
                ),
                Text(
                  "Don't have an account?",
                  style: TextStyle(fontSize: 13),
                ),
                TextButton(
                  child: Text(
                    "Sign Up",
                    style: TextStyle(fontSize: 14, color: Colors.black),
                  ),
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: (builder) {
                      return Registration();
                    }));
                  },
                )
              ],
            ),
          ),
        ),
      ]),
    );
  }
}
