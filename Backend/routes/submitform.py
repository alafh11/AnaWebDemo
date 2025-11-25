from flask import Blueprint, request, jsonify
from db_connection import get_db_connection
from datetime import datetime
import requests

submitform_bp = Blueprint("submitform", __name__)


@submitform_bp.route("/submit-form", methods=["POST"])
def submit_form():
    try:
        email = request.form.get("email")
        file = request.files.get("file")

        if not email:
            return jsonify({"message": "Email is required"}), 400

        try:
            conn = get_db_connection()
            cur = conn.cursor()

            now = datetime.utcnow()

            cur.execute(
                """
                INSERT INTO users (email, created_at, last_activity)
                VALUES (%s, %s, %s)
                ON CONFLICT (email) DO UPDATE
                SET last_activity = EXCLUDED.last_activity;
            """,
                (email, now, now),
            )

            conn.commit()
            cur.close()
            conn.close()

        except Exception as db_err:
            print("Database error:", db_err)
            return jsonify({"status": "error", "message": "Database error"}), 500

        if not file:
            return jsonify({"message": "No file uploaded"}), 400

        files = {"data": (file.filename, file.read(), file.mimetype)}
        data = {"email": email}

        response = requests.post(
            "http://localhost:5678/webhook-test/submitform", data=data, files=files
        )

        if response.ok:
            try:
                result = response.json()
            except:
                result = response.text
            return jsonify({"status": "success", "result": result}), 200
        else:
            return (
                jsonify({"status": "error", "message": response.text}),
                response.status_code,
            )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
