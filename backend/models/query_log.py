from datetime import datetime
from models import db

class QueryLog(db.Model):
    __tablename__ = 'query_logs'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bu_id = db.Column(db.Integer, db.ForeignKey('business_units.id'), nullable=False)
    query_text = db.Column(db.Text, nullable=False)  # Natural language query
    generated_sql = db.Column(db.Text)  # AI-generated SQL
    result_count = db.Column(db.Integer, default=0)  # Number of rows returned
    execution_time = db.Column(db.Float)  # Query execution time in seconds
    status = db.Column(db.String(20), default='success')  # 'success' or 'error'
    error_message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert query log object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bu_id': self.bu_id,
            'query_text': self.query_text,
            'generated_sql': self.generated_sql,
            'result_count': self.result_count,
            'execution_time': self.execution_time,
            'status': self.status,
            'error_message': self.error_message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<QueryLog id={self.id} user_id={self.user_id}>'
