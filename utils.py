from functools import wraps
from flask import jsonify, request, redirect, url_for, session
from main import cache
from models import *

def validate_json(required_keys=None):
    required_keys = required_keys or []
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({"error": "Expected JSON"}), 400
            data = request.get_json()
            missing = [key for key in required_keys if key not in data]
            if missing:
                return jsonify({"error": f"Missing keys: {missing}"}), 400
            return f(*args, **kwargs, json_data=data)
        return wrapper
    return decorator

def validate_or_raise(condition, message):
    if not condition:
        raise ValueError(message)


def cache_user():
    if 'telegram_user_id' not in session and not cache.get('user'):
            return redirect(url_for("index"))
    else:
        user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
        if user:
            cache.set('user', user)
            return user
        else:
            return redirect(url_for("index"))

def parse_positive_int(value, field_name):
    try:
        value = int(value)
        validate_or_raise(value >= 1, f"{field_name} must be an integer >= 1")
        return value
    except (ValueError, TypeError):
        raise ValueError(f"{field_name} must be an integer >= 1")

def parse_and_validate_region_id(rid):
    region_exists = db.session.query(Region.id).filter_by(id=rid).first()
    validate_or_raise(region_exists is not None, "Region not found")
    return rid

def parse_phone(phone):
    validate_or_raise(phone and isinstance(phone, str) and len(phone) <= 20, "Phone number too long")
    return phone

def parse_positive_numeric(value, field_name):
    try:
        num = float(value)
        validate_or_raise(num >= 0, f"{field_name} must be >= 0")
        return num
    except (ValueError, TypeError):
        raise ValueError(f"{field_name} must be numeric")

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'telegram_user_id' not in session and not cache.get('user'):
            return redirect(url_for("index"))
        return f(*args, **kwargs)
    return decorated_function
