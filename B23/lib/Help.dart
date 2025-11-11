import  'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:login_form/ProfileEdit.dart';

class Help extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Help",style: GoogleFonts.arima(),),
      ),
      body: ListView(
        children:[ Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 10,0,0),
              child: Text("Welcome to the",style: TextStyle(fontSize: 25),),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10,0,0,10),
              child: Text("Help & Support Page!",style: GoogleFonts.arima(fontSize: 32)),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(15, 0,10,0),
              child: Text(style: TextStyle(fontSize: 14),"Thank you for using our Nestly app. We're here to help you with any questions or issues you may have. Below, you'll find detailed information and guidance on how to use our app effectively."),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 30,0,10),
              child: Text("Account Management",style: TextStyle(fontSize: 22),),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 2,10,10),
              child: Container(
                height: 55,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),color: Colors.black.withOpacity(0.1)),
                child: ListTile(
                  title: Text("Updating Your Profile",style: TextStyle(fontSize: 16),),
                  leading: Icon(Icons.stop_rounded,size: 13,),
                  trailing: Icon(Icons.arrow_forward_ios_sharp,size: 18,),
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (builder){
                      return ProfileEdit();
                    }));
                  },
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 2,10,0),
              child: Container(
                height: 55,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),color: Colors.black.withOpacity(0.1)),
                child: ListTile(
                  title: Text("Change Profile Photo"),
                  leading: Icon(Icons.stop_rounded,size: 13,),
                  trailing: Icon(Icons.arrow_forward_ios_sharp,size: 18,),
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (builder){
                      return ProfileEdit();
                    }));
                  },
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 30, 0, 0),
              child: Text("Frequently Asked Questions (FAQs)",style: TextStyle(fontSize: 22),),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 5, 0, 0),
              child: Text("How do I delete my account?",style: TextStyle(fontSize: 15),),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(15, 0, 0,0),
              child: Text("-Contact our support team via the Contact Us section and request account deletion.",style: TextStyle(fontSize: 14),),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 30, 0, 0),
              child: Text("Contact Us",style: TextStyle(fontSize: 22),),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 10),
              child: ListTile(
                title: Text("Email: support@nestly.com",style: TextStyle(fontSize: 16),),
                leading: Icon(Icons.email_outlined,size: 16,),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 10),
              child: ListTile(
                title: Text("Phone: +91 23456 17890",style: TextStyle(fontSize: 16)),
                leading: Icon(Icons.call,size: 16),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 10),
              child: ListTile(
                title: Text("Working Hours: Mon-Fri, 9 AM - 6 PM",style: TextStyle(fontSize: 16)),
                leading: Icon(Icons.access_time_outlined,size: 16),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 30, 0, 0),
              child: Text("Feedback and Suggestions",style: TextStyle(fontSize: 22),),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(15, 5, 0, 0),
              child: Text("We value your feedback! Please send any suggestions or comments to feedback@nestly.com.",style: TextStyle(fontSize: 15),),
            ),
          ],
        ),
      ]
      ),
    );
  }
}
