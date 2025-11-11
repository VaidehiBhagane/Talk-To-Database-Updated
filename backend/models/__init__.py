from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models to register them with SQLAlchemy
from models.user import User
from models.business_unit import BusinessUnit, UserBUAccess
from models.query_log import QueryLog
from models.notification import Notification, AccessRequest
