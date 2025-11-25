from flask import Blueprint, request, jsonify, send_file
import pandas as pd
import chardet
import io
import ast

edit_bp = Blueprint("edit", __name__)


def detect_encoding(file_bytes):
    result = chardet.detect(file_bytes)
    return result["encoding"] or "utf-8"


def safe_eval(expr, row):
    """Evaluate a formula safely with row values."""
    try:
        expr_mod = expr
        for col, val in row.items():
            if isinstance(val, str):
                safe_val = f'"{val.replace("\"", "\\\"")}"'
            else:
                safe_val = str(val)
            expr_mod = expr_mod.replace(col, safe_val)
        return eval(expr_mod)
    except Exception:
        return "ERR"




@edit_bp.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    file_bytes = file.read()
    encoding = detect_encoding(file_bytes)
    file.seek(0)

    try:
        df = pd.read_csv(io.BytesIO(file_bytes), encoding=encoding)
    except Exception as e:
        return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400

    return jsonify(
        {
            "columns": df.columns.tolist(),
            "rows": df.head(50).to_dict(orient="records"),
            "total_rows": len(df),
        }
    )


@edit_bp.route("/drop-columns", methods=["POST"])
def drop_columns():
    data = request.json
    file_content = data.get("file_content")
    cols_to_drop = data.get("columns", [])

    if not file_content:
        return jsonify({"error": "Missing file content"}), 400

    df = pd.read_csv(io.StringIO(file_content))
    df.drop(columns=cols_to_drop, inplace=True, errors="ignore")

    return jsonify(
        {
            "columns": df.columns.tolist(),
            "rows": df.head(50).to_dict(orient="records"),
            "total_rows": len(df),
        }
    )


@edit_bp.route("/add-column", methods=["POST"])
def add_column():
    """
    Supports:
    - Adding empty column
    - Adding column with formula
    - Adding column with condition (col, op, value, true_val, false_val)
    """
    data = request.json
    file_content = data.get("file_content")
    new_col = data.get("new_col")
    formula = data.get("formula")
    condition = data.get("condition")

    if not file_content or not new_col:
        return jsonify({"error": "Missing file content or new_col"}), 400

    df = pd.read_csv(io.StringIO(file_content))

    if condition:
        col = condition.get("col")
        op = condition.get("op")
        val = condition.get("val")
        true_val = condition.get("true_val")
        false_val = condition.get("false_val")

        def apply_cond(x):
            try:
                if op == "=":
                    return true_val if str(x[col]) == str(val) else false_val
                elif op == "!=":
                    return true_val if str(x[col]) != str(val) else false_val
                elif op == ">":
                    return true_val if float(x[col]) > float(val) else false_val
                elif op == "<":
                    return true_val if float(x[col]) < float(val) else false_val
                elif op == ">=":
                    return true_val if float(x[col]) >= float(val) else false_val
                elif op == "<=":
                    return true_val if float(x[col]) <= float(val) else false_val
                else:
                    return false_val
            except Exception:
                return "ERR"

        df[new_col] = df.apply(apply_cond, axis=1)

    elif formula:
        df[new_col] = df.apply(lambda row: safe_eval(formula, row), axis=1)

    else:
        df[new_col] = ""

    return jsonify(
        {
            "columns": df.columns.tolist(),
            "rows": df.head(50).to_dict(orient="records"),
            "total_rows": len(df),
        }
    )


@edit_bp.route("/download", methods=["POST"])
def download_csv():
    data = request.json
    file_content = data.get("file_content")

    if not file_content:
        return jsonify({"error": "Missing file content"}), 400

    df = pd.read_csv(io.StringIO(file_content))
    output = io.BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)

    return send_file(
        output, as_attachment=True, download_name="edited.csv", mimetype="text/csv"
    )
