# routes/analyze.py
from flask import Blueprint, request, jsonify
import pandas as pd
import chardet
import io

analyze_bp = Blueprint("analyze_bp", __name__)


def read_file(file):
    filename = file.filename.lower()

    if filename.endswith(".xlsx"):
        import openpyxl

        return pd.read_excel(file, engine="openpyxl")
    elif filename.endswith(".xls"):
        import xlrd

        return pd.read_excel(file, engine="xlrd")
    elif filename.endswith(".csv"):
        file.seek(0)
        rawdata = file.read()
        result = chardet.detect(rawdata)
        encoding = result.get("encoding") or "utf-8"
        decoded = rawdata.decode(encoding, errors="replace")
        file_like = io.StringIO(decoded)

        for sep in [",", ";", "\t", "|"]:
            try:
                df = pd.read_csv(
                    file_like,
                    sep=sep,
                    engine="python",
                    dtype=str,
                    on_bad_lines="skip",
                    na_values=["", "NA", "N/A", "null", "NULL"],
                )
                if df.shape[1] > 1:
                    return df
                file_like.seek(0)
            except Exception:
                file_like.seek(0)
                continue

        file_like.seek(0)
        return pd.read_csv(
            file_like, sep=None, engine="python", dtype=str, on_bad_lines="skip"
        )
    else:
        raise ValueError("Unsupported file type. Please upload CSV or Excel files.")


@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        df = read_file(file)
        numeric_stats = None
        if not df.empty:
            numeric_df = df.select_dtypes(include=["float64", "int64"])
            if not numeric_df.empty:
                numeric_stats = numeric_df.describe().to_dict()

        info = {
            "rows": df.shape[0],
            "columns": df.shape[1],
            "column_names": df.columns.tolist(),
            "column_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "missing_percentage": {
                col: round(df[col].isnull().mean() * 100, 2) for col in df.columns
            },
            "unique_values": {col: df[col].nunique() for col in df.columns},
            "top_values": {
                col: df[col].value_counts().head(5).to_dict() for col in df.columns
            },
            "numeric_stats": numeric_stats,
            "preview": df.head(5).to_dict(orient="records"),
        }
        return jsonify(info)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
