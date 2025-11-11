package assistant.genuinecoder.s_assistant.main;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity; // ✅ AndroidX import
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.widget.GridView;

import java.util.ArrayList;

import assistant.genuinecoder.s_assistant.R;
import assistant.genuinecoder.s_assistant.main.components.About;
import assistant.genuinecoder.s_assistant.main.components.GridAdapter;
import assistant.genuinecoder.s_assistant.main.components.SettingsActivity;
import assistant.genuinecoder.s_assistant.main.database.DatabaseHandler;

public class AppBase extends AppCompatActivity {

    public static ArrayList<String> divisions;
    public static DatabaseHandler handler;
    public static Activity activity;
    ArrayList<String> basicFields;
    GridAdapter adapter;
    GridView gridView;

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.mai_menu, menu);
        return true;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.base_layout);

        basicFields = new ArrayList<>();
        handler = new DatabaseHandler(this);
        activity = this;

        getSupportActionBar().show();

        divisions = new ArrayList<>();
        divisions.add("S1 COMPUTER SCIENCE");
        divisions.add("S2 COMPUTER SCIENCE");
        divisions.add("S3 COMPUTER SCIENCE");
        divisions.add("S4 COMPUTER SCIENCE");
        divisions.add("S5 COMPUTER SCIENCE");
        divisions.add("S6 COMPUTER SCIENCE");
        divisions.add("S7 COMPUTER SCIENCE");

        gridView = findViewById(R.id.grid);

        basicFields.add("ATTENDANCE");
        basicFields.add("SCHEDULER");
        basicFields.add("NOTES");
        basicFields.add("PROFILE");
        basicFields.add("CGPA CALCULATOR");

        adapter = new GridAdapter(this, basicFields);
        gridView.setAdapter(adapter);
    }

    public void loadSettings(MenuItem item) {
        Intent launchIntent = new Intent(this, SettingsActivity.class);
        startActivity(launchIntent);
    }

    public void loadAbout(MenuItem item) {
        Intent launchIntent = new Intent(this, About.class);
        startActivity(launchIntent);
    }
}
