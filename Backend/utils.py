import re


def is_valid_email(email: str) -> bool:
    """Basic email validation using regex."""
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email) is not None
