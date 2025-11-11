package assistant.genuinecoder.s_assistant.main.profile;

import android.app.Activity;
import android.database.Cursor;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import assistant.genuinecoder.s_assistant.R;
import assistant.genuinecoder.s_assistant.main.AppBase;

public class EditStudentActivity extends AppCompatActivity {
    Activity activity = this;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit__student);

        Button loadButton = findViewById(R.id.loadForEdit);
        loadButton.setOnClickListener(v -> {
            EditText adm = findViewById(R.id.register_);
            String qu = "SELECT * FROM STUDENT WHERE regno = '" + adm.getText().toString().toUpperCase() + "'";
            Cursor cr = AppBase.handler.execQuery(qu);
            if (cr == null || cr.getCount() == 0) {
                Toast.makeText(getBaseContext(), "No Such Student", Toast.LENGTH_LONG).show();
            } else {
                cr.moveToFirst();
                try {
                    EditText name = findViewById(R.id.edit_name_);
                    EditText roll = findViewById(R.id.roll_);
                    EditText contact = findViewById(R.id.contact_);
                    name.setText(cr.getString(0));
                    roll.setText(cr.getString(4));
                    contact.setText(cr.getString(3));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });

        Button saveEdit = findViewById(R.id.buttonSAVEEDITS);
        saveEdit.setOnClickListener(v -> {
            EditText name = findViewById(R.id.edit_name_);
            EditText roll = findViewById(R.id.roll_);
            EditText contact = findViewById(R.id.contact_);
            EditText adm = findViewById(R.id.register_);

            String qu = "UPDATE STUDENT SET name = '" + name.getText().toString() + "' , " +
                    " roll = " + roll.getText().toString() + " , contact = '" + contact.getText().toString() + "' " +
                    "WHERE regno = '" + adm.getText().toString().toUpperCase() + "'";
            Log.d("EditStudentActivity", qu);
            if (AppBase.handler.execAction(qu)) {
                Toast.makeText(getBaseContext(), "Edit Saved", Toast.LENGTH_LONG).show();
                activity.finish();
            } else
                Toast.makeText(getBaseContext(), "Error Occured", Toast.LENGTH_LONG).show();
        });
    }
}
