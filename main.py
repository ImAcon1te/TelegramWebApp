from flask import Flask, session, redirect, url_for, request, render_template, jsonify
from sqlalchemy import or_
from flask_caching import Cache
import datetime
from extensions import db, init_app
from models import *
import requests
from functools import wraps
import os
app = Flask(__name__)
app.secret_key = 'key123'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:james_132587@localhost/TgWebAppDatabase'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://flask_user:flask_pass@db:5432/flask_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache = Cache(app)
init_app(app)

@app.before_request
def create_tables():
    print('ok')
    db.create_all()
    db.session.add(Region('Test-oblast-1','Test-district-1'))
    db.session.add(Region('Test-oblast-2','Test-district-2'))
    db.session.commit()



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

@app.route('/')
def index():
    return render_template('telegram_init.html')

@app.route('/register', methods=['GET', 'POST'])
@login_required
def register():
    if request.method == 'POST':
        telegram_user_id = session['telegram_user_id']
        phone = request.form.get('phone')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        region_id = request.form.get('region')
        is_sale = True if request.form.get('is_sale') == '1' else False
        is_purchase = True if request.form.get('is_purchase') == '1' else False
        is_rental = True if request.form.get('is_rental') == '1' else False
        if not phone:
            return "Номер телефона обязателен", 400
        if not first_name:
            return "Имя обязательно", 400
        if not (is_sale or is_purchase or is_rental):
            return "Выберите хотя бы одну роль", 400
        if not region_id:
            return "Выберите регион", 400
        new_user = User(
            user_id = telegram_user_id,
            first_name = first_name,
            last_name = last_name,
            phone = phone,
            region_id = region_id,
            is_sale = is_sale,
            is_purchase = is_purchase,
            is_rental = is_rental,
            created_at = datetime.datetime.now(),
            updated_at = datetime.datetime.now()
        )
        db.session.add(new_user)
        db.session.commit()
        if cache.get('last_role'):
            return redirect(url_for(cache.get('last_role')))#jsonify({'redirect': url_for(cache.get('last_role'))})
        else:
            if new_user.is_purchase:
                return redirect( url_for('purchase_offers')) #jsonify({'redirect': url_for('purchase_offers')})
            elif new_user.is_sale:
                return redirect(url_for('sale_offers')) #jsonify({'redirect': url_for('sale_offers')})
            else:
                return redirect(url_for('rental_offers')) #jsonify({'redirect': url_for('rental_offers')})
    regions = Region.query.all()
    print(regions)
    return render_template('register_d.html',
                           regions=regions,
                           telegram_first_name=session.get('telegram_first_name', ''),
                           telegram_last_name=session.get('telegram_last_name', ''))

@app.route('/mainpage')
@login_required
def mainpage():
    user = db.session.get(User, session['telegram_user_id'])
    if not user:
        return redirect(url_for('register'))
    return render_template('mainpage.html', user=user)

@app.route('/sale_offers')
@login_required
def sale_offers():
        role = cache.get('last_role') if cache.get('last_role') else set_role()
        user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
        sale_data = db.session.query(SaleOffer).filter(SaleOffer.user_id != session['telegram_user_id']).all()
        regions = db.session.query(Region).all()
        return render_template('sale_offers_d.html',
                               user=user,
                               sale_data=sale_data,
                               role=role,
                               regions=regions)

@app.route('/sale_offers_filtered', methods=['GET'])
@login_required
def sale_offers_filtered():
    price_min = request.args.get('priceMin', type=float)
    price_max = request.args.get('priceMax', type=float)
    fio = request.args.get('fio', type=str)
    culture_type = request.args.get('cultureType', type=str)
    region_id = request.args.get('region', type=int)

    if price_min is not None and price_max is not None and price_min > price_max:
        return jsonify({'error': 'priceMin не может быть больше чем priceMax'}), 400

    query = db.session.query(SaleOffer).filter(SaleOffer.user_id != session['telegram_user_id'])

    if price_min is not None:
        query = query.filter(SaleOffer.price_per_ton >= price_min)
    if price_max is not None:
        query = query.filter(SaleOffer.price_per_ton <= price_max)

    if fio:
        query = query.join(User).filter(
            or_(
                User.first_name.ilike(f'%{fio}%'),
                User.last_name.ilike(f'%{fio}%')
            )
        )

    if culture_type:
        query = query.filter(SaleOffer.commodity_type.ilike(f'%{culture_type}%'))

    if region_id:
        query = query.filter(SaleOffer.region_id == region_id)

    sale_data = query.all()

    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
    role = cache.get('last_role')
    regions = db.session.query(Region).all()
    return render_template('sale_offers_d.html',
                           user=user,
                           sale_data=sale_data,
                           role=role,
                           regions=regions)

@app.route('/rental_offers')
@login_required
def rental_offers():
        role = cache.get('last_role') if cache.get('last_role') else set_role()
        user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
        rental_offers = db.session.query(RentalOffer).filter(RentalOffer.user_id != session['telegram_user_id']).all()
        return render_template('rental_offers_d.html', user=user, rental_offers=rental_offers, role=role)

@app.route('/rental_offers_filtered', methods=['GET'])
@login_required
def rental_offers_filtered():
    price_min = request.args.get('priceMin', type=float)
    price_max = request.args.get('priceMax', type=float)
    fio = request.args.get('fio', type=str)
    culture_type = request.args.get('cultureType', type=str)
    _ = request.args.get('region', type=int)

    if price_min is not None and price_max is not None and price_min > price_max:
        return jsonify({'error': 'priceMin не может быть больше чем priceMax'}), 400

    query = db.session.query(RentalOffer)\
        .filter(RentalOffer.user_id != session['telegram_user_id'])

    if price_min is not None:
        query = query.filter(RentalOffer.rental_price >= price_min)
    if price_max is not None:
        query = query.filter(RentalOffer.rental_price <= price_max)

    if fio:
        query = query.join(User).filter(
            or_(
                User.first_name.ilike(f'%{fio}%'),
                User.last_name.ilike(f'%{fio}%')
            )
        )

    if culture_type:
        query = query.filter(RentalOffer.equipment_type.ilike(f'%{culture_type}%'))

    rental_data = query.all()

    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
    role = cache.get('last_role')
    regions = db.session.query(Region).all()

    return render_template('rental_offers_d.html',
                           user=user,
                           rental_offers=rental_data,
                           role=role,
                           regions=regions)

@app.route('/purchase_offers')
@login_required
def purchase_offers():
    role = cache.get('last_role') if cache.get('last_role') else set_role()
    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
    #user = db.session.get(User, session['telegram_user_id'])
    purchase_offers = db.session.query(PurchaseOffer).filter(PurchaseOffer.user_id != session['telegram_user_id']).all()
    return render_template('purchase_offers_d.html', user=user, purchase_offers=purchase_offers, role=role)

@app.route('/purchase_offers_filtered', methods=['GET'])
@login_required
def purchase_offers_filtered():
    price_min = request.args.get('priceMin', type=float)
    price_max = request.args.get('priceMax', type=float)
    fio = request.args.get('fio', type=str)
    culture_type = request.args.get('cultureType', type=str)
    region_id = request.args.get('region', type=int)

    if price_min is not None and price_max is not None and price_min > price_max:
        return jsonify({'error': 'priceMin не может быть больше чем priceMax'}), 400

    query = db.session.query(PurchaseOffer).filter(PurchaseOffer.user_id != session['telegram_user_id'])

    if price_min is not None:
        query = query.filter(PurchaseOffer.price_per_ton >= price_min)
    if price_max is not None:
        query = query.filter(PurchaseOffer.price_per_ton <= price_max)

    if fio:
        query = query.join(User).filter(
            or_(
                User.first_name.ilike(f'%{fio}%'),
                User.last_name.ilike(f'%{fio}%')
            )
        )

    if culture_type:
        query = query.filter(PurchaseOffer.commodity_type.ilike(f'%{culture_type}%'))

    if region_id:
        query = query.filter(PurchaseOffer.region_id == region_id)
    purchase_data = query.all()
    print(purchase_data)
    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
    role = cache.get('last_role')
    regions = db.session.query(Region).all()

    return render_template('purchase_offers_d.html',
                           user=user,
                           purchase_offers=purchase_data,
                           role=role,
                           regions=regions)

@app.route('/notifications/get_amount')
@login_required
def notifications_get_amount():
    current_user_id = session.get('telegram_user_id')
    offer_model_map = {
        OfferTypeEnum.SaleOffer: SaleOffer,
        OfferTypeEnum.PurchaseOffer: PurchaseOffer,
        OfferTypeEnum.RentalOffer: RentalOffer
    }
    notifications_count = []
    for offer_type,join_model in offer_model_map.items():
        notifications_count.append(db.session.query(OfferRequests, join_model)
                     .join(join_model, OfferRequests.offer_id == join_model.id)
                     .filter(
                         OfferRequests.offer_type == offer_type,
                         OfferRequests.user_id != current_user_id,
                         join_model.user_id == current_user_id,
                         OfferRequests.deleted_at.is_(None)
                     ).count())
    return jsonify({'notifications_count': notifications_count}), 200
@app.route('/notifications/incoming')
@login_required
def incoming_notifications():
    current_user_id = session.get('telegram_user_id')
    user = db.session.query(User).filter_by(user_id=current_user_id).first()
    role = cache.get('last_role') if cache.get('last_role') else set_role()
    if role == 'sale_offers':
        offer_type = OfferTypeEnum.SaleOffer
        join_model = SaleOffer
    elif role == 'purchase_offers':
        offer_type = OfferTypeEnum.PurchaseOffer
        join_model = PurchaseOffer
    elif role == 'rental_offers':
        offer_type = OfferTypeEnum.RentalOffer
        join_model = RentalOffer
    else:
        notifications = []
        return render_template('incoming_notifications_d.html',
                           notifications=notifications,
                           user=user,
                           role=role)
    notifications = (db.session.query(OfferRequests, join_model)
                 .join(join_model, OfferRequests.offer_id == join_model.id)
                 .filter(
                     OfferRequests.offer_type == offer_type,
                     OfferRequests.user_id != current_user_id,
                     join_model.user_id == current_user_id,
                     OfferRequests.deleted_at.is_(None)
                 )).all()

    return render_template('incoming_notifications_d.html',
                           notifications=notifications,
                           user=user,
                           role=role)

@app.route('/notifications/outgoing')
@login_required
def outgoing_notifications():
    current_user_id = session.get('telegram_user_id')
    user = db.session.query(User).filter_by(user_id=current_user_id).first()
    role = cache.get('last_role') if cache.get('last_role') else set_role()

    if role == 'sale_offers':
        offer_type = OfferTypeEnum.SaleOffer
        join_model = SaleOffer
    elif role == 'purchase_offers':
        offer_type = OfferTypeEnum.PurchaseOffer
        join_model = PurchaseOffer
    elif role == 'rental_offers':
        offer_type = OfferTypeEnum.RentalOffer
        join_model = RentalOffer
    else:
        notifications = []
        return render_template('outgoing_notifications_d.html',
                               notifications=notifications,
                               user=user,
                               role=role)
    notifications = (db.session.query(OfferRequests, join_model)
                     .join(join_model, join_model.id == OfferRequests.offer_id)
                     .filter(
                        OfferRequests.user_id == current_user_id,
                        OfferRequests.deleted_at.is_(None),
                        OfferRequests.offer_type == offer_type
                     )
                     .all())
    return render_template('outgoing_notifications_d.html',
                           notifications=notifications,
                           user=user,
                           role=role)

@app.route('/notification/cancel', methods=['POST'])
@login_required
def cancel_notification():
    data = request.get_json()
    notification_id = data.get('notification_id')
    if not notification_id:
        return jsonify({'error': 'Не указан notification_id'}), 400
    notification = db.session.query(OfferRequests).filter(OfferRequests.id == notification_id).first()
    if not notification:
        return jsonify({'error': 'Оповещение не найдено'}), 404
    notification.deleted_at = datetime.datetime.now()
    db.session.commit()
    return jsonify({'message': 'Оповещение отменено'})

@app.route('/notification/create', methods=['POST'])
@login_required
def create_notification():
    data = request.get_json()
    offer_id = int(data.get('offer_id'))
    offer_type = data.get('offer_type')
    comment = data.get('comment')
    overwrite_sum = data.get('overwrite_sum')
    overwrite_amount = data.get('overwrite_amount')
    offer_model_map = {
        OfferTypeEnum.SaleOffer: SaleOffer,
        OfferTypeEnum.PurchaseOffer: PurchaseOffer,
        OfferTypeEnum.RentalOffer: RentalOffer
    }

    if not offer_id:
        print('Не указан offer_id')
        return jsonify({'error': 'Не указан offer_id'}), 400

    offer_type_enum = OfferTypeEnum(offer_type)
    model = offer_model_map.get(offer_type_enum)
    offer = db.session.query(model).filter_by(id=offer_id).first()
    if not offer:
        print('Заявка не найдена')
        return jsonify({'error': 'Заявка не найдена'}), 404

    notification = OfferRequests(
        user_id=session['telegram_user_id'],
        offer_id=offer.id,
        offer_type=OfferTypeEnum(offer_type),
        status=StatusEnum.active,
        created_at=datetime.datetime.now(),
        updated_at=datetime.datetime.now(),
        comment=comment,
        overwrite_sum=overwrite_sum,
        overwrite_amount=overwrite_amount
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({'message': 'Оповещение создано'})

@app.route('/offer/create', methods=['GET', 'POST'])
@login_required
def create_offer():
    current_user_id = session.get('telegram_user_id')
    role = cache.get('last_role') if cache.get('last_role') else set_role()
    user = db.session.query(User).filter_by(user_id=current_user_id).first()
    if request.method == 'POST':
        offer_type = request.form.get('offer_type')
        if offer_type == "sale":
            commodity_type = request.form.get('commodity_type')
            tonnage = request.form.get('tonnage')
            price_per_ton = request.form.get('price_per_ton')
            region_id = request.form.get('region_id')
            additional_info = request.form.get('additional_info')

            offer = SaleOffer(
                user_id=current_user_id,
                commodity_type=commodity_type,
                tonnage=tonnage,
                price_per_ton=price_per_ton,
                region_id=region_id,
                additional_info=additional_info,
                created_at=datetime.datetime.now(),
                updated_at=datetime.datetime.now()
            )
        elif offer_type == "purchase":
            commodity_type = request.form.get('commodity_type')
            tonnage = request.form.get('tonnage')
            price_per_ton = request.form.get('price_per_ton')
            region_id = request.form.get('region_id')
            additional_info = request.form.get('additional_info')

            offer = PurchaseOffer(
                user_id=current_user_id,
                commodity_type=commodity_type,
                tonnage=tonnage,
                price_per_ton=price_per_ton,
                region_id=region_id,
                additional_info=additional_info,
                created_at=datetime.datetime.now(),
                updated_at=datetime.datetime.now()
            )
        elif offer_type == "rental":
            equipment_type = request.form.get('equipment_type')
            rental_price = request.form.get('rental_price')
            time_unit = request.form.get('time_unit')
            additional_info = request.form.get('additional_info')

            offer = RentalOffer(
                user_id=current_user_id,
                equipment_type=equipment_type,
                rental_price=rental_price,
                time_unit=time_unit,
                additional_info=additional_info,
                created_at=datetime.datetime.now(),
                updated_at=datetime.datetime.now()
            )
        else:
            return redirect(url_for('create_offer'))

        db.session.add(offer)
        db.session.commit()
        return redirect(url_for('create_offer'))
    else:
        regions = Region.query.all()
        time_units = [unit.value for unit in TimeUnitEnum]
        return render_template('offer_create_d.html',
                               regions=regions,
                               time_units=time_units,
                               user=user, role=role)

@app.route('/update_roles', methods=['POST'])
@login_required
def update_roles():
    data = request.get_json()
    is_sale = data.get('is_sale', False)
    is_purchase = data.get('is_purchase', False)
    is_rental = data.get('is_rental', False)
    user = db.session.query(User).filter_by(user_id=session.get('telegram_user_id')).first()
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404
    user.is_sale = bool(is_sale)
    user.is_purchase = bool(is_purchase)
    user.is_rental = bool(is_rental)
    db.session.commit()
    return jsonify({'message': 'Роли обновлены'})

def set_role():
    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
    if user.is_purchase:
        return 'purchase_offers'
    elif user.is_sale:
        return 'sale_offers'
    else:
        return 'rental_offers'

@app.route('/my_offers')
@login_required
def my_offers():
    role = cache.get('last_role') if cache.get('last_role') else set_role()
    current_user_id = session.get('telegram_user_id')
    sale_offers = db.session.query(SaleOffer).filter_by(user_id=current_user_id).all()
    purchase_offers = db.session.query(PurchaseOffer).filter_by(user_id=current_user_id).all()
    rental_offers = db.session.query(RentalOffer).filter_by(user_id=current_user_id).all()
    user = db.session.query(User).filter_by(user_id=current_user_id).first()
    return render_template('my_offers_d.html',
                           sale_offers=sale_offers,
                           purchase_offers=purchase_offers,
                           rental_offers=rental_offers,
                           user=user, role=role)

@app.route('/my_offers/delete', methods=['POST'])
@login_required
def delete_offer():
    data = request.get_json()
    offer_id = data.get('offer_id')
    offer_type = data.get('offer_type')
    if not offer_id or not offer_type:
        return jsonify({'error': 'Недостаточно данных'}), 400

    model_map = {
        'sale': SaleOffer,
        'purchase': PurchaseOffer,
        'rental': RentalOffer
    }
    model = model_map.get(offer_type)
    if not model:
        return jsonify({'error': 'Неверный тип предложения'}), 400

    offer = db.session.query(model).filter_by(id=offer_id, user_id=session.get('telegram_user_id')).first()
    if not offer:
        return jsonify({'error': 'Предложение не найдено'}), 404
    try:
        db.session.query(OfferRequests).filter_by(offer_id=offer_id, offer_type=OfferTypeEnum(offer_type.capitalize() + 'Offer')).delete()
    except Exception as e:
        print(e)
    db.session.delete(offer)
    db.session.commit()
    return jsonify({'message': 'Предложение успешно удалено'})

@app.route('/my_offers/edit', methods=['POST'])
@login_required
def edit_offer():
    data = request.get_json()
    offer_id = data.get('offer_id')
    offer_type = data.get('offer_type')
    if not offer_id or not offer_type:
        return jsonify({'error': 'Недостаточно данных'}), 400

    model_map = {
        'sale': SaleOffer,
        'purchase': PurchaseOffer,
        'rental': RentalOffer
    }
    model = model_map.get(offer_type)
    if not model:
        return jsonify({'error': 'Неверный тип предложения'}), 400

    offer = db.session.query(model).filter_by(id=offer_id, user_id=session.get('telegram_user_id')).first()
    if not offer:
        return jsonify({'error': 'Предложение не найдено'}), 404

    if offer_type in ['sale', 'purchase']:
        offer.commodity_type = data.get('commodity_type')
        offer.tonnage = data.get('tonnage')
        offer.price_per_ton = data.get('price_per_ton')
        offer.additional_info = data.get('additional_info')
        # Обновление региона можно реализовать через select
    elif offer_type == 'rental':
        offer.equipment_type = data.get('equipment_type')
        offer.rental_price = data.get('rental_price')
        offer.time_unit = data.get('time_unit')
        offer.additional_info = data.get('additional_info')
    offer.updated_at = datetime.datetime.now()
    db.session.commit()
    return jsonify({'message': 'Предложение успешно обновлено'})

@app.route('/my_offers/get_offer')
@login_required
def get_offer():
    offer_id = request.args.get('offer_id')
    offer_type = request.args.get('offer_type')
    if not offer_id or not offer_type:
        return jsonify({'error': 'Недостаточно данных'}), 400

    model_map = {
        'sale': SaleOffer,
        'purchase': PurchaseOffer,
        'rental': RentalOffer
    }
    model = model_map.get(offer_type)
    if not model:
        return jsonify({'error': 'Неверный тип предложения'}), 400
    offer = db.session.query(model).filter_by(id=offer_id, user_id=session.get('telegram_user_id')).first()
    if not offer:
        return jsonify({'error': 'Предложение не найдено'}), 404

    if offer_type in ['sale', 'purchase']:
        offer_data = {
            'commodity_type': offer.commodity_type,
            'tonnage': float(offer.tonnage),
            'price_per_ton': float(offer.price_per_ton),
            'additional_info': offer.additional_info,
            'region_name': offer.region.oblast if offer.region else ''
        }
    elif offer_type == 'rental':
        offer_data = {
            'equipment_type': offer.equipment_type,
            'rental_price': float(offer.rental_price),
            'time_unit': offer.time_unit.value if offer.time_unit else '',
            'additional_info': offer.additional_info
        }
    return jsonify({'offer': offer_data})

@app.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
    role = cache.get('last_role') if cache.get('last_role') else set_role()
    regions = db.session.query(Region).all()
    if request.method == 'POST':
        user.first_name = request.form.get('first_name')
        user.last_name = request.form.get('last_name')
        user.phone = request.form.get('phone')
        region_id = request.form.get('region_id')
        if region_id:
            user.region_id = int(region_id)
        user.is_sale = (request.form.get('is_sale') == 'on')
        user.is_purchase = (request.form.get('is_purchase') == 'on')
        user.is_rental = (request.form.get('is_rental') == 'on')
        db.session.commit()
        set_role()
        return redirect(url_for('settings'))
    return render_template('settings.html', user=user, regions=regions, role=role)

@app.route('/role_change', methods=['POST'])
@login_required
def role_change():
    data = request.get_json()
    selected_role = data.get('role')
    if selected_role not in ['sale', 'purchase', 'rental']:
        return jsonify({'message': 'Некорректная роль.'}), 400
    cache.set('last_role', selected_role + "_offers")
    return redirect(url_for('role_redirect')) # redirect(url_for('my_offers')) if data.get('url') == '/my_offers' else

@app.route('/role_redirect', methods=['GET', 'POST'])
@login_required
def role_redirect():
    user = db.session.query(User).filter_by(user_id=session['telegram_user_id']).first()
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

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=80)
