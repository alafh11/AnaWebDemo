from flask import Blueprint, request, jsonify
from db_connection import get_db_connection
from datetime import datetime
from utils import is_valid_email

collect_email_bp = Blueprint("collect_email", __name__)


@collect_email_bp.route("/api/collect_email", methods=["POST"])
def collect_email():
    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    now = datetime.utcnow()

    try:
        conn = get_db_connection()
        cur = conn.cursor()

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

        return jsonify({"status": "ok", "email": email}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "internal server error"}), 500
