from flask import Flask, session, redirect, url_for, request, render_template, jsonify
from sqlalchemy import or_
from flask_caching import Cache
import datetime
from extensions import db, init_app
from models import *
import requests
from functools import wraps
import os

from utils import validate_json, validate_or_raise, parse_positive_int, \
    parse_and_validate_region_id, parse_phone, parse_positive_numeric

app = Flask(__name__)
app.secret_key = 'key123'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:james_132587@localhost/TgWebAppDatabase'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://flask_user:flask_pass@db:5432/flask_db'
)
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache = Cache(app)
init_app(app)

@app.route('/create_db', methods=['POST'])
def create_db():
    db.drop_all()
    db.create_all()
    db.session.add(Region('Test-oblast-1','Test-district-1'))
    db.session.add(Region('Test-oblast-2','Test-district-2'))
    db.session.commit()
    return jsonify({'status':'ok'}), 200

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

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'telegram_user_id' not in session and not cache.get('user'):
            return redirect(url_for("index"))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/init_telegram', methods=['POST'])
def init_telegram():
    data = request.get_json()
    if not data or 'user' not in data:
        return jsonify({'error': 'No access tg'}), 400
    user_data = data['user']
    session['telegram_user_id'] = user_data.get('id')
    user = db.session.get(User, session['telegram_user_id'])
    cache.set('user', user, timeout=3600)
    if user:
        if cache.get('last_role'):
            return jsonify({'redirect': url_for(cache.get('last_role'))})
        else:
            if user.is_purchase:
                return jsonify({'redirect': url_for('purchase_offers')})
            elif user.is_sale:
                return jsonify({'redirect': url_for('sale_offers')})
            else:
                return jsonify({'redirect': url_for('rental_offers')})
    else:
        return jsonify({'redirect': url_for('register')})

@app.route('/register', methods=['POST'])
@validate_json(required_keys=['telegram_user_id', 'firstName', 'phone', 'region_id'])
def register(json_data):
    try:
        if db.session.query(User).filter_by(user_id=json_data['telegram_user_id']).first():
            return jsonify({"message": "User already registered"}), 409
        user_data = {
            "user_id": json_data.get('telegram_user_id'),
            "first_name": json_data.get('firstName'),
            "last_name": json_data.get('lastName'),
            "region_id": parse_and_validate_region_id(json_data.get('region_id')),
            "phone": parse_phone(json_data.get('phone')),
        }
        db.session.add(User(**user_data))
        db.session.commit()
        return jsonify({"message": "success"}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "error"}), 500

@app.route('/offer/create', methods=['POST'])
@login_required
@validate_json(required_keys=['telegram_user_id', "offer_type", "region_id", "type_id", "price"])
def create_offer(json_data):
    offer_data = {
        "user_id": json_data.get('telegram_user_id'),
        "region_id": json_data.get('region_id'),
        "price": json_data.get('price'),
        "additional_info": json_data.get('additional_info'),
    }
    try:
        offer_type = json_data.get('offer_type')
        model_class = {
            'Culture': Culture,
            'Vehicle': Vehicle
        }.get(json_data.get('offer_type'))

        if not model_class:
            return jsonify({"error": "Invalid offer type"}), 400

        if offer_type == 'Culture':
            type_id = json_data.get('commodity_type_id')
            validate_or_raise(type_id is not None, "commodity_type_id is required")
            exists = db.session.query(CommodityType.id).filter_by(id=type_id).first()
            validate_or_raise(exists is not None, "Invalid commodity_type_id (not exists)")
            offer_data["tonnage"] = parse_positive_int(json_data.get('tonnage'), "tonnage")
            offer_data["commodity_type_id"] = type_id

        elif offer_type == 'Vehicle':
            type_id = json_data.get('vehicle_type_id')
            validate_or_raise(type_id is not None, "vehicle_type_id is required")
            exists = db.session.query(VehicleType.id).filter_by(id=type_id).first()
            validate_or_raise(exists is not None, "Invalid vehicle_type_id (not exists)")
            offer_data["days"] = parse_positive_int(json_data.get('days'), "days")
            offer_data["vehicle_type_id"] = type_id

        db.session.add(model_class(**offer_data))
        db.session.commit()
        return jsonify({"message": "success"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/update', methods=['PATCH'])
@validate_json(required_keys=['offer_type', 'id', 'telegram_user_id'])
def update_offer(json_data):
    try:
        offer_type = json_data.get('offer_type')
        offer_id = json_data.get('id')
        user_id = json_data.get('telegram_user_id')

        model_map = {
            'Culture': Culture,
            'Vehicle': Vehicle
        }

        model = model_map.get(offer_type)
        if not model:
            return jsonify({"error": "Invalid offer_type"}), 400

        offer = db.session.query(model).filter_by(id=offer_id, user_id=user_id).first()
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        # Общие поля
        if 'region_id' in json_data:
            offer.region_id = parse_and_validate_region_id(json_data['region_id'])

        if 'price' in json_data:
            offer.price = parse_positive_numeric(json_data['price'], 'price')

        if 'additional_info' in json_data:
            offer.additional_info = json_data['additional_info']

        # Culture-specific
        if offer_type == 'Culture':
            if 'commodity_type_id' in json_data:
                type_id = json_data['commodity_type_id']
                validate_or_raise(
                    db.session.query(CommodityType.id).filter_by(id=type_id).first() is not None,
                    "Invalid commodity_type_id"
                )
                offer.commodity_type_id = type_id

            if 'tonnage' in json_data:
                offer.tonnage = parse_positive_numeric(json_data['tonnage'], 'tonnage')

        # Vehicle-specific
        elif offer_type == 'Vehicle':
            if 'vehicle_type_id' in json_data:
                type_id = json_data['vehicle_type_id']
                validate_or_raise(
                    db.session.query(VehicleType.id).filter_by(id=type_id).first() is not None,
                    "Invalid vehicle_type_id"
                )
                offer.vehicle_type_id = type_id

            if 'days' in json_data:
                offer.days = parse_positive_int(json_data['days'], 'days')

        db.session.commit()
        return jsonify({"message": "Offer updated successfully"}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/user/update', methods=['POST'])
@validate_json(required_keys=['telegram_user_id'])
def update_user(json_data):
    try:
        user_id = json_data['telegram_user_id']
        user = db.session.query(User).filter_by(user_id=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404
        if 'firstName' in json_data:
            user.first_name = json_data['firstName']
        if 'lastName' in json_data:
            user.last_name = json_data['lastName']
        if 'phone' in json_data:
            phone = parse_phone(json_data['phone'])
            phone_owner = db.session.query(User).filter(User.phone == phone, User.user_id != user_id).first()
            if phone_owner:
                return jsonify({"message": "Phone already in use"}), 409
            user.phone = phone
        if 'region_id' in json_data:
            user.region_id = parse_and_validate_region_id(json_data['region_id'])
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": "error"}), 500

@app.route('/offer/types', methods=['GET'])
def get_offer_types():
    try:
        commodity_types = db.session.query(CommodityType).all()
        vehicle_types = db.session.query(VehicleType).all()

        return jsonify({
            "commodity_types": [
                {"id": ct.id, "code": ct.code, "name": ct.name}
                for ct in commodity_types
            ],
            "vehicle_types": [
                {"id": vt.id, "code": vt.code, "name": vt.name}
                for vt in vehicle_types
            ]
        }), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/types/create', methods=['POST'])
@validate_json(required_keys=['dictionary', 'code', 'name'])
def create_offer_type(json_data):
    try:
        dictionary = json_data['dictionary']
        code = json_data['code'].strip().lower()
        name = json_data['name'].strip()

        validate_or_raise(code != "", "Code cannot be empty")
        validate_or_raise(name != "", "Name cannot be empty")

        if dictionary == 'commodity':
            Model = CommodityType
        elif dictionary == 'vehicle':
            Model = VehicleType
        else:
            return jsonify({"error": "Invalid dictionary. Must be 'commodity' or 'vehicle'"}), 400

        exists = db.session.query(Model).filter_by(code=code).first()
        validate_or_raise(not exists, f"{dictionary.capitalize()} type with code '{code}' already exists")

        db.session.add(Model(code=code, name=name))
        db.session.commit()

        return jsonify({"message": f"{dictionary.capitalize()} type created", "code": code, "name": name}), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/delete', methods=['POST'])
@validate_json(required_keys=['telegram_user_id', 'offer_type', 'id'])
def delete_offer(json_data):
    try:
        model_class = {
            'Culture': Culture,
            'Vehicle': Vehicle
        }.get(json_data.get('offer_type'))

        if not model_class:
            return jsonify({"error": "Invalid offer_type"}), 400

        offer = db.session.query(model_class).filter_by(
            user_id=json_data['telegram_user_id'],
            id=json_data['id']
        ).first()

        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        db.session.delete(offer)
        db.session.commit()
        return jsonify({'message': 'offer deleted'}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/offer', methods=['GET'])
@validate_json(required_keys=['telegram_user_id', 'offer_type'])
def get_offer(json_data):
    try:
        model_class = {
            'Culture': Culture,
            'Vehicle': Vehicle
        }.get(json_data.get('offer_type'))

        if not model_class:
            return jsonify({"error": "Invalid offer_type"}), 400

        offers = db.session.query(model_class)\
            .filter(model_class.user_id != json_data.get('telegram_user_id')).all()

        return jsonify([offer.to_dict() for offer in offers]), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/regions/<id>', methods=['GET'])
@validate_json(required_keys=['telegram_user_id'])
def get_regions(json_data):
    try:
        if json_data.get('id'):
            region = db.session.query(Region).filter_by(id=json_data.get('id')).first()
            if region:
                return jsonify(region.to_dict()), 200
            else:
                return jsonify({'message':f"region with id='{json_data.get('id')} not exists'"}), 200
        else:
            regions = db.session.query(Region).all()
            return jsonify([region.to_dict() for region in regions]), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/user/<id>', methods=['GET'])
def get_user(id):
    try:
        user = db.session.query(User).filter_by(user_id=id).first()
        if user:
            return jsonify(user.to_dict()), 200
        else:
            return jsonify({'message': f"user with id='{id} not exists'"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    with app.app_context():
        create_db()
    app.run(debug=True, host="0.0.0.0", port=80)
