import datetime
import enum
from extensions import db

class TimeUnitEnum(enum.Enum):
    hour = "hour"
    day = "day"
    month = "month"

    def display(self):
        mapping = {
            TimeUnitEnum.hour: "година",
            TimeUnitEnum.day: "доба",
            TimeUnitEnum.month: "місяць"
        }
        return mapping[self]

class OfferTypeEnum(enum.Enum):
    SaleOffer = "sale"
    PurchaseOffer = "purchase"
    RentalOffer = "rental"
    def display(self):
        mapping = {
            OfferTypeEnum.SaleOffer: "продаж",
            OfferTypeEnum.PurchaseOffer: "закупівля",
            OfferTypeEnum.RentalOffer: "оренда"
        }
        return mapping[self]

class StatusEnum(enum.Enum):
    active = "active"
    pending = "pending"

class Region(db.Model):
    __tablename__ = 'regions'
    id = db.Column(db.Integer, primary_key=True)
    oblast = db.Column(db.String(100), nullable=False)
    district = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    def __repr__(self):
        return f"<Region {self.oblast}, {self.district}>"

    def __init__(self, oblast, district):
        self.oblast = oblast
        self.district = district

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.BigInteger, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(256))
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    is_sale = db.Column(db.Boolean, default=False)
    is_purchase = db.Column(db.Boolean, default=False)
    is_rental = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    region = db.relationship('Region', backref=db.backref('users', lazy=True))
    def __repr__(self):
        return f"<User {self.user_id}: {self.first_name} {self.last_name}>"

class SaleOffer(db.Model):
    __tablename__ = 'sale_offers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    commodity_type = db.Column(db.String(100), nullable=False)  # Тип культуры/товара
    tonnage = db.Column(db.Numeric, nullable=False)  # Количество в тоннах
    price_per_ton = db.Column(db.Numeric(10, 2), nullable=False)  # Цена за тонну
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    additional_info = db.Column(db.Text)  # Дополнительные поля
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    user = db.relationship('User', backref=db.backref('sale_offers', lazy=True))
    region = db.relationship('Region', backref=db.backref('sale_offers', lazy=True))
    def __repr__(self):
        return f"<SaleOffer {self.id} by User {self.user_id}>"

class PurchaseOffer(db.Model):
    __tablename__ = 'purchase_offers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    commodity_type = db.Column(db.String(100), nullable=False)
    tonnage = db.Column(db.Numeric, nullable=False)
    price_per_ton = db.Column(db.Numeric(10, 2), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    additional_info = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    user = db.relationship('User', backref=db.backref('purchase_offers', lazy=True))
    region = db.relationship('Region', backref=db.backref('purchase_offers', lazy=True))
    def __repr__(self):
        return f"<PurchaseOffer {self.id} by User {self.user_id}>"

class RentalOffer(db.Model):
    __tablename__ = 'rental_offers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    equipment_type = db.Column(db.String(100), nullable=False)  # Тип техники
    rental_price = db.Column(db.Numeric(10, 2), nullable=False)  # Стоимость аренды
    time_unit = db.Column(db.Enum(TimeUnitEnum), nullable=False)  # Единица времени
    additional_info = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    user = db.relationship('User', backref=db.backref('rental_offers', lazy=True))
    def __repr__(self):
        return f"<RentalOffer {self.id} by User {self.user_id}>"

class OfferRequests(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    offer_id = db.Column(db.Integer, nullable=False)
    offer_type = db.Column(db.Enum(OfferTypeEnum), nullable=False)
    status = db.Column(db.Enum(StatusEnum), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    deleted_at = db.Column(db.DateTime, default=None, nullable=True)
    overwrite_sum = db.Column(db.Numeric(10, 2), nullable=True)
    overwrite_amount = db.Column(db.Numeric(10, 2), nullable=True)
    comment = db.Column(db.Text, nullable=True)
