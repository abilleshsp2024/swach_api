from sqlalchemy import Column, Integer, String, Boolean
from database import Base
from datetime import datetime

class Register(Base):
    __tablename__ = "registered_account"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)

class TotalList(Base):
    __tablename__ = "total_list"

    s_no = Column(Integer, primary_key=True, index=True)
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    swach_code = Column(String, nullable=False)
    swatch_path = Column(String, nullable=False)
    model_path = Column(String, nullable=True)
    status = Column(String, default="Pending")
    final_image = Column(String, nullable=True)


    
