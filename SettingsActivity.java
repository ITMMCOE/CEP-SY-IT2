package assistant.genuinecoder.s_assistant.main.components;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.preference.Preference;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.appcompat.app.ActionBar;

import assistant.genuinecoder.s_assistant.R;
import assistant.genuinecoder.s_assistant.main.AppBase;
import assistant.genuinecoder.s_assistant.main.components.AppCompatPreferenceActivity;

public class SettingsActivity extends AppCompatPreferenceActivity {
    Activity base = this;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupActionBar();
        addPreferencesFromResource(R.xml.pref_general);

        // Clear schedule preference
        Preference myPref = findPreference("clear_schedule");
        myPref.setOnPreferenceClickListener(preference -> {
            final AlertDialog.Builder alert = new AlertDialog.Builder(base);
            alert.setTitle("Are you sure?");
            alert.setMessage("This will wipe your entire scheduling data");
            alert.setPositiveButton("YES", (dialog, which) -> {
                String qu = "DROP TABLE SCHEDULE";
                if (AppBase.handler.execAction(qu)) {
                    Toast.makeText(getBaseContext(), "Done", Toast.LENGTH_LONG).show();
                    AppBase.handler.createTable();
                    dialog.dismiss();
                }
            });
            alert.setNegativeButton("NO", (dialog, which) -> dialog.dismiss());
            alert.show();
            return true;
        });

        // Clear attendance preference
        myPref = findPreference("clear_attendance");
        myPref.setOnPreferenceClickListener(preference -> {
            final AlertDialog.Builder alert = new AlertDialog.Builder(base);
            alert.setTitle("Are you sure?");
            alert.setMessage("This will wipe your entire attendance data");
            alert.setPositiveButton("YES", (dialog, which) -> {
                String qu = "DROP TABLE ATTENDANCE";
                if (AppBase.handler.execAction(qu)) {
                    Toast.makeText(getBaseContext(), "Done", Toast.LENGTH_LONG).show();
                    AppBase.handler.createTable();
                    dialog.dismiss();
                }
            });
            alert.setNegativeButton("NO", (dialog, which) -> dialog.dismiss());
            alert.show();
            return true;
        });

        // Clear notes preference
        myPref = findPreference("clear_notes");
        myPref.setOnPreferenceClickListener(preference -> {
            final AlertDialog.Builder alert = new AlertDialog.Builder(base);
            alert.setTitle("Are you sure?");
            alert.setMessage("This will wipe your entire Notes data");
            alert.setPositiveButton("YES", (dialog, which) -> {
                String qu = "DROP TABLE NOTES";
                if (AppBase.handler.execAction(qu)) {
                    Toast.makeText(getBaseContext(), "Done", Toast.LENGTH_LONG).show();
                    AppBase.handler.createTable();
                    dialog.dismiss();
                }
            });
            alert.setNegativeButton("NO", (dialog, which) -> dialog.dismiss());
            alert.show();
            return true;
        });

        // Clear student preference
        myPref = findPreference("clear_student");
        myPref.setOnPreferenceClickListener(preference -> {
            final AlertDialog.Builder alert = new AlertDialog.Builder(base);
            alert.setTitle("Are you sure?");
            alert.setMessage("This will wipe your entire Student data");
            alert.setPositiveButton("YES", (dialog, which) -> {
                String qu = "DROP TABLE STUDENT";
                if (AppBase.handler.execAction(qu)) {
                    Toast.makeText(getBaseContext(), "Done", Toast.LENGTH_LONG).show();
                    AppBase.handler.createTable();
                    dialog.dismiss();
                }
            });
            alert.setNegativeButton("NO", (dialog, which) -> dialog.dismiss());
            alert.show();
            return true;
        });
    }

    private void setupActionBar() {
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            this.finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
