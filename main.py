from flask import Flask, session, redirect, url_for, request, render_template, jsonify
from sqlalchemy import or_
from flask_caching import Cache
import datetime
from extensions import db, init_app
from models import *
import requests
from functools import wraps
import os
# временно для генерации тестовых данных
from random import choice, randint, uniform
from faker import Faker

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
fake = Faker('uk_UA')

@app.route('/create_db', methods=['POST'])
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()
    return jsonify({'status':'db recreated'}), 200

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

# генератор данных
@app.route('/generate-test-data', methods=['POST'])
def generate_test_data():
    try:
        from urllib.parse import parse_qs
        from sqlalchemy import delete

        truncate = request.args.get('truncate', 'false').lower() == 'true'
        user_count = int(request.args.get('users', 10))
        offer_count = int(request.args.get('offers', 10))
        request_count = int(request.args.get('requests', 20))

        if truncate:
            db.session.execute(delete(OfferRequests))
            db.session.execute(delete(Culture))
            db.session.execute(delete(Vehicle))
            db.session.execute(delete(User))
            db.session.execute(delete(Region))
            db.session.commit()

        regions = []
        for _ in range(5):
            region = Region(oblast=fake.region(), district=fake.city())
            db.session.add(region)
            regions.append(region)
        db.session.flush()

        users = []
        for _ in range(user_count):
            user = User(
                user_id=fake.unique.random_int(100000, 999999),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                phone=fake.unique.phone_number(),
                region_id=choice(regions).id
            )
            db.session.add(user)
            users.append(user)
        db.session.flush()

        commodity_types = db.session.query(CommodityType).all()
        vehicle_types = db.session.query(VehicleType).all()
        if not commodity_types or not vehicle_types:
            return jsonify({"error": "Seed commodity_types and vehicle_types first"}), 400

        culture_offers = []
        vehicle_offers = []
        for _ in range(offer_count):
            if choice([True, False]):
                offer = Culture(
                    user_id=choice(users).user_id,
                    commodity_type_id=choice(commodity_types).id,
                    tonnage=round(uniform(10, 100), 1),
                    price=round(uniform(5000, 15000), 2),
                    region_id=choice(regions).id,
                    additional_info=fake.sentence()
                )
                db.session.add(offer)
                culture_offers.append(offer)
            else:
                offer = Vehicle(
                    user_id=choice(users).user_id,
                    vehicle_type_id=choice(vehicle_types).id,
                    days=randint(1, 30),
                    price=round(uniform(1000, 10000), 2),
                    region_id=choice(regions).id,
                    additional_info=fake.sentence()
                )
                db.session.add(offer)
                vehicle_offers.append(offer)
        db.session.flush()

        for _ in range(request_count):
            if culture_offers and choice([True, False]):
                offer = choice(culture_offers)
                offer_type = OfferTypeEnum.cultureOffer
            else:
                offer = choice(vehicle_offers)
                offer_type = OfferTypeEnum.vehicleOffer

            other_users = [u for u in users if u.user_id != offer.user_id]
            if not other_users:
                continue

            req = OfferRequests(
                user_id=choice(other_users).user_id,
                offer_id=offer.id,
                offer_type=offer_type,
                status=choice(list(StatusEnum)),
                overwrite_sum=round(offer.price * uniform(0.8, 1.1), 2),
                overwrite_amount=round(uniform(1, 20), 1),
                comment=fake.sentence()
            )
            db.session.add(req)

        db.session.commit()
        return jsonify({"message": "Test data generated"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

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
            'culture': Culture,
            'vehicle': Vehicle
        }.get(json_data.get('offer_type'))

        if not model_class:
            return jsonify({"error": "Invalid offer type"}), 400

        if offer_type == 'culture':
            type_id = json_data.get('type_id')
            validate_or_raise(type_id is not None, "type_id (commodity) is required")
            exists = db.session.query(CommodityType.id).filter_by(id=type_id).first()
            validate_or_raise(exists is not None, "Invalid commodity_type_id (not exists)")
            offer_data["tonnage"] = parse_positive_int(json_data.get('tonnage'), "tonnage")
            offer_data["commodity_type_id"] = type_id

        elif offer_type == 'vehicle':
            type_id = json_data.get('type_id')
            validate_or_raise(type_id is not None, "type_id (type) is required")
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

@app.route('/offer/update', methods=['PATCH'])
@validate_json(required_keys=['offer_type', 'id', 'telegram_user_id'])
def update_offer(json_data):
    try:
        offer_type = json_data.get('offer_type')
        offer_id = json_data.get('id')
        user_id = json_data.get('telegram_user_id')

        model_map = {
            'culture': Culture,
            'vehicle': Vehicle
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
        if offer_type == 'culture':
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
        elif offer_type == 'vehicle':
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


@app.route('/offer/delete', methods=['POST'])
@validate_json(required_keys=['telegram_user_id', 'offer_type', 'id'])
def delete_offer(json_data):
    try:
        model_class = {
            'culture': Culture,
            'vehicle': Vehicle
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
def get_offer():
    try:
        telegram_user_id = request.args.get('telegram_user_id')
        offer_type = request.args.get('offer_type')

        if not telegram_user_id or not offer_type:
            return jsonify({"error": "Missing required query parameters: telegram_user_id and offer_type"}), 400

        model_class = {
            'culture': Culture,
            'vehicle': Vehicle
        }.get(offer_type)

        if not model_class:
            return jsonify({"error": "Invalid offer_type"}), 400

        offers = db.session.query(model_class).filter(model_class.user_id != telegram_user_id).all()
        return jsonify([offer.to_dict() for offer in offers]), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/my', methods=['GET'])
def get_offer_my():
    try:
        telegram_user_id = request.args.get('telegram_user_id')
        offer_type = request.args.get('offer_type')

        if not telegram_user_id or not offer_type:
            return jsonify({"error": "Missing required query parameters: telegram_user_id and offer_type"}), 400

        model_class = {
            'culture': Culture,
            'vehicle': Vehicle
        }.get(offer_type)

        if not model_class:
            return jsonify({"error": "Invalid offer_type"}), 400

        offers = db.session.query(model_class)\
            .filter(model_class.user_id == telegram_user_id).all()

        return jsonify([offer.to_dict() for offer in offers]), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/regions', methods=['GET'])
def get_regions():
    try:
        if request.args.get('id'):
            region = db.session.query(Region).filter_by(id=id).first()
            if region:
                return jsonify(region.to_dict()), 200
            else:
                return jsonify({'message':f"region with id='{id} not exists'"}), 200
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

@app.route('/offer/request', methods=['POST'])
@validate_json(required_keys=['telegram_user_id', 'offer_id', 'offer_type'])
def create_offer_request(json_data):
    try:
        offer_type_raw = json_data['offer_type']
        offer_id = json_data['offer_id']
        telegram_user_id = json_data['telegram_user_id']

        offer_type_enum_map = {
            'culture': OfferTypeEnum.cultureOffer,
            'vehicle': OfferTypeEnum.vehicleOffer
        }

        offer_type = offer_type_enum_map.get(offer_type_raw)
        if not offer_type:
            return jsonify({"error": "Invalid offer_type"}), 400

        offer_model_map = {
            OfferTypeEnum.cultureOffer: Culture,
            OfferTypeEnum.vehicleOffer: Vehicle
        }
        model_class = offer_model_map[offer_type]
        offer = db.session.query(model_class).filter_by(id=offer_id).first()
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        offer_request = OfferRequests(
            user_id=telegram_user_id,
            offer_id=offer_id,
            offer_type=offer_type,
            status=StatusEnum.pending,
            overwrite_sum=json_data.get('overwrite_sum'),
            overwrite_amount=json_data.get('overwrite_amount'),
            comment=json_data.get('comment')
        )

        db.session.add(offer_request)
        db.session.commit()
        return jsonify({"message": "Offer request created"}), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(e)
        raise e
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/requests/sent', methods=['GET'])
def get_sent_requests():
    user_id = request.args.get('telegram_user_id')
    offer_type_enum_map = {
        'culture': OfferTypeEnum.cultureOffer,
         'vehicle': OfferTypeEnum.vehicleOffer
    }.get(request.args.get('offer_type'))
    try:
        data = db.session.query(OfferRequests).filter_by(user_id=user_id, status=StatusEnum.pending, offer_type=offer_type_enum_map).all()
        return jsonify([req.to_dict() for req in data]), 200
    except Exception as e:
        print(e)
        raise e
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/requests/received', methods=['GET'])
def get_received_requests():
    user_id = request.args.get('telegram_user_id')
    try:
        culture_ids = db.session.query(Culture.id).filter_by(user_id=user_id).subquery()
        vehicle_ids = db.session.query(Vehicle.id).filter_by(user_id=user_id).subquery()

        requests = db.session.query(OfferRequests).filter(
            db.or_(
                db.and_(
                    OfferRequests.offer_type == OfferTypeEnum.cultureOffer,
                    OfferRequests.status == StatusEnum.pending,
                    OfferRequests.offer_id.in_(culture_ids)
                ),
                db.and_(
                    OfferRequests.offer_type == OfferTypeEnum.vehicleOffer,
                    OfferRequests.status == StatusEnum.pending,
                    OfferRequests.offer_id.in_(vehicle_ids)
                )
            )
        ).all()

        return jsonify([req.to_dict() for req in requests]), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/requests/update', methods=['PATCH'])
@validate_json(required_keys=['telegram_user_id', 'id'])
def update_offer_request(json_data):
    try:
        user_id = json_data['telegram_user_id']
        offer_id = json_data['id']

        offer = db.session.query(OfferRequests).filter_by(id=offer_id, user_id=user_id).first()
        if not offer:
            return jsonify({"error": "Offer not found or access denied"}), 404

        if 'overwrite_amount' in json_data:
            offer.overwrite_amount = parse_positive_numeric(json_data['overwrite_amount'], 'overwrite_amount')

        if 'overwrite_sum' in json_data:
            offer.overwrite_amount = parse_positive_numeric(json_data['overwrite_sum'], 'overwrite_sum')

        if 'comment' in json_data:
            offer.comment = json_data['comment']

        db.session.commit()
        return jsonify({"message": "Offer requests updated successfully"}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/requests/delete', methods=['POST'])
@validate_json(required_keys=['telegram_user_id', 'id'])
def delete_offer_request(json_data):
    try:
        offer = db.session.query(OfferRequests).filter_by(
            user_id=json_data['telegram_user_id'],
            id=json_data['id']
        ).first()

        if not offer:
            return jsonify({"error": "Offer request not found"}), 404

        db.session.delete(offer)
        db.session.commit()
        return jsonify({'message': 'offer deleted'}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offer/requests/decline', methods=['POST'])
@validate_json(required_keys=['telegram_user_id', 'request_offer_id'])
def decline_offer_request(json_data):
    try:
        offer_request = db.session.query(OfferRequests).filter_by(
            id=json_data['request_offer_id']
        ).first()

        if not offer_request:
            return jsonify({"error": "Offer request not found"}), 404

        model_class = {
            'culture': Culture,
            'vehicle': Vehicle
        }.get(offer_request.offer_type)

        offer = db.session.query(model_class).filter_by(id=offer_request.offer_id).first()

        if offer.user_id == json_data['telegram_user_id']:
            offer_request.status = StatusEnum.declined
            db.session.commit()
            return jsonify({'message': 'offer declined'}), 200
        else:
            return jsonify({"error": "User isn't offer creator"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offers/search', methods=['GET'])
def search_offers():
    try:
        offer_type = request.args.get('offer_type')
        if offer_type not in ['culture', 'vehicle']:
            return jsonify({"error": "Invalid offer_type"}), 400

        model = Culture if offer_type == 'culture' else Vehicle
        query = db.session.query(model)

        if not request.args.get('telegram_user_id'):
            return jsonify({"error": "telegram_user_id required"}), 400
        query = query.filter(model.user_id != request.args.get('telegram_user_id'))

        query = query.join(model.user).join(model.region)

        price_start = request.args.get('price_start', type=float)
        price_end = request.args.get('price_end', type=float)
        if price_start is not None:
            query = query.filter(model.price >= price_start)
        if price_end is not None:
            query = query.filter(model.price <= price_end)

        name = request.args.get('name')
        if name:
            ilike = f"%{name.lower()}%"
            query = query.filter(
                db.func.lower(User.first_name + ' ' + User.last_name).ilike(ilike)
            )

        region_id = request.args.get('region', type=int)
        if region_id:
            query = query.filter(model.region_id == region_id)

        type_id = request.args.get('type_id', type=int)
        if type_id:
            if offer_type == 'culture':
                query = query.filter(model.commodity_type_id == type_id)
            else:
                query = query.filter(model.vehicle_type_id == type_id)

        offers = query.all()
        return jsonify([offer.to_dict() for offer in offers]), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/offers/price-range', methods=['GET'])
def get_price_range():
    try:
        offer_type = request.args.get('offer_type')
        if offer_type not in ['culture', 'vehicle']:
            return jsonify({"error": "Invalid or missing offer_type"}), 400

        model = Culture if offer_type == 'culture' else Vehicle
        query = db.session.query(model).join(model.user)
        if not request.args.get('telegram_user_id'):
            return jsonify({"error": "telegram_user_id required"}), 400
        query = query.filter(model.user_id != request.args.get('telegram_user_id'))

        region_id = request.args.get('region', type=int)
        if region_id:
            query = query.filter(model.region_id == region_id)

        type_id = request.args.get('type_id', type=int)
        if type_id:
            if offer_type == 'culture':
                query = query.filter(model.commodity_type_id == type_id)
            else:
                query = query.filter(model.vehicle_type_id == type_id)

        name = request.args.get('name')
        if name:
            ilike = f"%{name.lower()}%"
            query = query.filter(
                db.func.lower(User.first_name + ' ' + User.last_name).ilike(ilike)
            )

        result = query.with_entities(
            db.func.min(model.price).label('min_price'),
            db.func.max(model.price).label('max_price')
        ).first()

        return jsonify({
            "offer_type": offer_type,
            "min_price": float(result.min_price) if result.min_price is not None else None,
            "max_price": float(result.max_price) if result.max_price is not None else None
        }), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500



if __name__ == '__main__':
    with app.app_context():
        create_db()
    app.run(debug=True, host="0.0.0.0", port=80)
