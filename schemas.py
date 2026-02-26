from pydantic import BaseModel, Field
from typing import Optional, Any

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    phone_number: str = Field(..., min_length=10, max_length=10)

class UserCreate(BaseModel):
    username: str
    password: str

class UserSchema(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class SwatchCreate(BaseModel):
    s_no: int
    style_code: str

class SwatchResponse(BaseModel):
    s_no: int
    created_at: Any
    swach_code: str
    swatch_path: str
    model_path: Optional[str] = None
    status: str
    final_image: Optional[str] = None

    class Config:
        from_attributes = True
