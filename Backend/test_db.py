from db_connection import get_db_connection


def test_connection():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        print("✅ Database connected successfully!")
        print("PostgreSQL version:", db_version)
        cur.close()
        conn.close()
    except Exception as e:
        print("❌ Database connection failed:", e)


if __name__ == "__main__":
    test_connection()
