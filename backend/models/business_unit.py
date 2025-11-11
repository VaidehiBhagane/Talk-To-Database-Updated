from datetime import datetime
from models import db

class BusinessUnit(db.Model):
    __tablename__ = 'business_units'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    schema_name = db.Column(db.String(100), nullable=False)  # Database schema for this BU
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user_access = db.relationship('UserBUAccess', backref='business_unit', lazy=True, cascade='all, delete-orphan')
    query_logs = db.relationship('QueryLog', backref='business_unit', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert business unit object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'schema_name': self.schema_name,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<BusinessUnit {self.name}>'


class UserBUAccess(db.Model):
    __tablename__ = 'user_bu_access'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bu_id = db.Column(db.Integer, db.ForeignKey('business_units.id'), nullable=False)
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate access entries
    __table_args__ = (db.UniqueConstraint('user_id', 'bu_id', name='unique_user_bu_access'),)
    
    def to_dict(self):
        """Convert access object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bu_id': self.bu_id,
            'granted_at': self.granted_at.isoformat() if self.granted_at else None
        }
    
    def __repr__(self):
        return f'<UserBUAccess user_id={self.user_id} bu_id={self.bu_id}>'
