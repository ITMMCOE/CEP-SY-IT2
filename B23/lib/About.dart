import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

class About extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("About us"),
        bottom: PreferredSize(preferredSize: Size.fromHeight(4),
          child: Container(
            height: 4,decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.black,width: 1.0))),
          ),),
      ),
      body: ListView(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text("Welcome to Nestly App!",style: GoogleFonts.arima(fontSize: 35),),
                Text(style: TextStyle(fontSize: 15),textAlign: TextAlign.justify,"At Nestly App, we are passionate about connecting property sellers and buyers seamlessly through our innovative platform. Our mission is to make property transactions as simple, transparent, and efficient as possible. Whether you're looking to sell your flat, bungalow, or nestly, or you're in the market to buy a new property, we've got you covered."),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                  child: Text("What We Offer",style: GoogleFonts.arima(fontSize: 30),),
                ),
                Text(style: TextStyle(fontSize: 15),textAlign: TextAlign.justify,"Extensive Listings: Browse a wide range of properties, including flats, bungalows, and villas, all in one place."),
                Text(style: TextStyle(fontSize: 15),textAlign: TextAlign.justify,"User-Friendly Interface: Our app is designed to be intuitive and easy to navigate, ensuring a smooth experience for all users."),
                Text(style: TextStyle(fontSize: 15),textAlign: TextAlign.justify,"Advanced Search and Filters: Find your dream property quickly with our advanced search tools and filters."),
                Text(style: TextStyle(fontSize: 15),textAlign: TextAlign.justify,"Secure Transactions: We prioritize your security and privacy, ensuring that your transactions are safe and confidential."),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                  child: Text("Our Team",style: GoogleFonts.arima(fontSize: 30),),
                ),
                Text(style: TextStyle(fontSize: 15),textAlign: TextAlign.justify,"At Nestly App, we are proud of our diverse and talented team. Our experts bring a wealth of knowledge and experience to the table, working tirelessly to provide the best service possible."),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                  child: Text("Join Us on Our Journey",style: GoogleFonts.arima(fontSize: 30),),
                ),
                Text(textAlign: TextAlign.justify,"We invite you to join us on our journey to make property transactions easier and more enjoyable. Whether you are selling or buying, Nestly App is here to help you every step of the way."),
                Text(textAlign: TextAlign.justify,"Thank you for choosing Nestly App. We look forward to serving you!",style: TextStyle(fontSize: 18),),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                  child: Text("Contact Us",style: GoogleFonts.arima(fontSize: 30),),
                ),
                Text("Have questions or need assistance? Reach out to us at"),
                ListTile(
                  title: Text("Email: info@nestly.com",style: TextStyle(fontSize: 16),),
                  leading: Icon(Icons.email_outlined,size: 16,),
                ),
                ListTile(
                  title: Text("Phone: +91 23415 67890",style: TextStyle(fontSize: 16),),
                  leading: Icon(Icons.call,size: 16,),
                ),
                ListTile(
                  title: Text("Address: 123 Main Street, City, Country",style: TextStyle(fontSize: 16),),
                  leading: Icon(Icons.location_on_outlined,size: 16,),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(0, 30, 0, 0),
                  child: Text("Follow us on social media",style: GoogleFonts.arima(fontSize: 24),),
                ),
                ListTile(
                  title: Text("Facebook: facebook.com/nestly",style: TextStyle(fontSize: 16),),
                  leading: FaIcon(FontAwesomeIcons.facebook, color: Colors.blue, size: 16,),
                ),
                ListTile(
                  title: Text("Twitter: twitter.com/nestly",style: TextStyle(fontSize: 16),),
                  leading: FaIcon(FontAwesomeIcons.twitter, color: Colors.blue, size: 16,),
                ),
                ListTile(
                  title: Text("Instagram: instagram.com/nestly",style: TextStyle(fontSize: 16),),
                  leading: FaIcon(FontAwesomeIcons.instagram, color: Colors.purpleAccent, size: 16,),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
