import datetime
import enum
from extensions import db

class OfferTypeEnum(enum.Enum):
    CultureOffer = "culture"
    VehicleOffer = "vehicle"
    def display(self):
        mapping = {
            OfferTypeEnum.CultureOffer: "культури",
            OfferTypeEnum.VehicleOffer: "техніка",
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

    def to_dict(self):
        return {
            "id": self.id,
            "oblast": self.oblast,
            "district": self.district,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class OfferRequests(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    offer_id = db.Column(db.Integer, nullable=False)
    offer_type = db.Column(db.Enum(OfferTypeEnum), nullable=False)
    status = db.Column(db.Enum(StatusEnum), nullable=False)
    overwrite_sum = db.Column(db.Numeric(10, 2), nullable=True)
    overwrite_amount = db.Column(db.Numeric(10, 2), nullable=True)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    deleted_at = db.Column(db.DateTime, default=None, nullable=True)

class CommodityType(db.Model):
    __tablename__ = 'commodity_types'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<CommodityType {self.code}>"

class VehicleType(db.Model):
    __tablename__ = 'vehicle_types'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"<VehicleType {self.code}>"

class Culture(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    commodity_type_id = db.Column(db.Integer, db.ForeignKey('commodity_types.id'), nullable=False)
    commodity_type = db.relationship('CommodityType', backref='cultures')
    tonnage = db.Column(db.Numeric, nullable=False)  
    price = db.Column(db.Numeric(10, 2), nullable=False)  
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    additional_info = db.Column(db.Text)  
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    user = db.relationship('User', backref=db.backref('Culture_offers', lazy=True))
    region = db.relationship('Region', backref=db.backref('Culture_offers', lazy=True))

    def __repr__(self):
        return f"<CultureOffer {self.id} by User {self.user_id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "commodity_type_id": self.commodity_type_id,
            "region_id": self.region_id,
            "price": float(self.price),
            "tonnage": float(self.tonnage),
            "additional_info": self.additional_info,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user_last_name": self.user.last_name,
            "user_first_name": self.user.first_name,
            "user_image":"тут будет фото"
    }

class Vehicle(db.Model):
    __tablename__ = 'rental_offers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id'), nullable=False)
    vehicle_type_id = db.Column(db.Integer, db.ForeignKey('vehicle_types.id'), nullable=False)
    vehicle_type = db.relationship('VehicleType', backref='vehicles')
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    additional_info = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    user = db.relationship('User', backref=db.backref('Vehicle_offers', lazy=True))
    region = db.relationship('Region', backref=db.backref('Vehicle_offers', lazy=True))

    def __repr__(self):
        return f"<VehicleOffer {self.id} by User {self.user_id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "vehicle_type_id": self.vehicle_type_id,
            "region_id": self.region_id,
            "price": float(self.price),
            "days": self.days,
            "additional_info": self.additional_info,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user_last_name": self.user.last_name,
            "user_first_name": self.user.first_name,
            "user_image":"тут будет фото"
        }

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.BigInteger, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(256))
    region_id = db.Column(db.Integer, db.ForeignKey('regions.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.now,
                           onupdate=datetime.datetime.now)
    region = db.relationship('Region', backref=db.backref('users', lazy=True))

    def __repr__(self):
        return f"<User {self.user_id}: {self.first_name} {self.last_name}>"

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "region_id": self.region_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }