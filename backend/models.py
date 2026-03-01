from sqlalchemy import Column, String, Integer, Text, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    skill_level = Column(String(50), default='beginner')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    skill_level = Column(String(50))
    duration_weeks = Column(Integer)
    topics = Column(JSON)
    generated_at = Column(TIMESTAMP, server_default=func.now())

class Problem(Base):
    __tablename__ = "problems"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    difficulty = Column(String(20), nullable=False)
    topic = Column(String(100), nullable=False)
    description = Column(Text)
    solution_link = Column(String(500))
    tags = Column(JSON)
    created_at = Column(TIMESTAMP, server_default=func.now())

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'))
    problem_id = Column(String(36), ForeignKey('problems.id', ondelete='CASCADE'))
    status = Column(String(20), default='pending')
    completed_at = Column(TIMESTAMP, nullable=True)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

class RoadmapProblem(Base):
    __tablename__ = "roadmap_problems"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    roadmap_id = Column(String(36), ForeignKey('roadmaps.id', ondelete='CASCADE'))
    problem_id = Column(String(36), ForeignKey('problems.id', ondelete='CASCADE'))
    week_number = Column(Integer)
    day_number = Column(Integer)
    order_index = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())
