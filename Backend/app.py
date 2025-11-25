from flask import Flask
from flask_cors import CORS
from routes.analyze import analyze_bp
from routes.edit import edit_bp
from routes.submitform import submitform_bp
from routes.collect_email import collect_email_bp


app = Flask(__name__)
CORS(app)

app.register_blueprint(analyze_bp)
app.register_blueprint(edit_bp)
app.register_blueprint(submitform_bp)
app.register_blueprint(collect_email_bp)

if __name__ == "__main__":
    app.run(debug=True)
