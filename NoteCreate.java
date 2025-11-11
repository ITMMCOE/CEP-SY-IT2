package assistant.genuinecoder.s_assistant.main.notes;

import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import assistant.genuinecoder.s_assistant.R;
import assistant.genuinecoder.s_assistant.main.AppBase;

public class NoteCreate extends AppCompatActivity {
    EditText title, body;
    Spinner spinner;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.note_create);

        Button btn = findViewById(R.id.noteSaveButton);
        btn.setOnClickListener(v -> saveData());

        spinner = findViewById(R.id.pinSpinner);
        ArrayAdapter<String> adapterSpinner = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, AppBase.divisions);
        spinner.setAdapter(adapterSpinner);
    }

    private void saveData() {
        title = findViewById(R.id.noteTitle);
        body = findViewById(R.id.noteBody);
        EditText sub = findViewById(R.id.subjectNote);

        String qu = "INSERT INTO NOTES(title,body,cls,sub) VALUES('"
                + title.getText().toString() + "','"
                + body.getText().toString() + "','"
                + spinner.getSelectedItem().toString() + "','"
                + sub.getText().toString().toUpperCase() + "')";

        if (AppBase.handler.execAction(qu)) {
            Toast.makeText(getBaseContext(), "Note Saved", Toast.LENGTH_LONG).show();
            this.finish();
        }
    }
}
