package assistant.genuinecoder.s_assistant.main.schedule;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TimePicker;
import android.widget.Toast;

import java.util.ArrayList;

import androidx.appcompat.app.AppCompatActivity;

import assistant.genuinecoder.s_assistant.R;
import assistant.genuinecoder.s_assistant.main.AppBase;

public class CreateScheduleActivity extends AppCompatActivity {

    Spinner classSelect, daySelect;
    ArrayAdapter<String> adapterSpinner, days;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.schedule_create);

        classSelect = findViewById(R.id.classSelector);
        daySelect = findViewById(R.id.daySelector);

        adapterSpinner = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, AppBase.divisions);
        classSelect.setAdapter(adapterSpinner);

        ArrayList<String> weekdays = new ArrayList<>();
        weekdays.add("MONDAY");
        weekdays.add("TUESDAY");
        weekdays.add("WEDNESDAY");
        weekdays.add("THURSDAY");
        weekdays.add("FRIDAY");
        weekdays.add("SATURDAY");
        weekdays.add("SUNDAY");

        days = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, weekdays);
        daySelect.setAdapter(days);

        Button btn = findViewById(R.id.saveBUTTON_SCHEDULE);
        btn.setOnClickListener(this::saveSchedule);
    }

    private void saveSchedule(View v) {
        String daySelected = daySelect.getSelectedItem().toString();
        String classSelected = classSelect.getSelectedItem().toString();
        EditText editText = findViewById(R.id.subjectName);
        String subject = editText.getText().toString();

        if (subject.length() < 2) {
            Toast.makeText(getBaseContext(), "Enter Valid Subject Name", Toast.LENGTH_SHORT).show();
            return;
        }

        TimePicker timePicker = findViewById(R.id.timePicker);
        int hour = timePicker.getCurrentHour();
        int min = timePicker.getCurrentMinute();

        String sql = "INSERT INTO SCHEDULE VALUES('" + classSelected + "'," +
                "'" + subject + "'," +
                "'" + hour + ":" + min + "'," +
                "'" + daySelected + "');";
        Log.d("Schedule", sql);

        if (AppBase.handler.execAction(sql)) {
            Toast.makeText(getBaseContext(), "Scheduling Done", Toast.LENGTH_LONG).show();
            finish();
        } else {
            Toast.makeText(getBaseContext(), "Failed To Schedule", Toast.LENGTH_LONG).show();
        }
    }
}
