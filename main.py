from __future__ import annotations
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from typing import Optional, Annotated, List
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db

# Create the database tables
models.Base.metadata.create_all(bind=engine)

# Reload trigger comment
app = FastAPI()

@app.get("/total-swach-count")
def get_total_swach_count(db: Session = Depends(get_db)):
    count = db.query(models.TotalList).count()
    return {"count": count}

@app.get("/list-all", response_model=List[schemas.SwatchResponse])
def get_all_swatches(db: Session = Depends(get_db)):
    records = db.query(models.TotalList).order_by(models.TotalList.s_no.desc()).all()
    return records

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Refresh-Token"],
)

from passlib.context import CryptContext

# Password hashing configuration
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Request, Response

# JWT configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Sliding Session Middleware
@app.middleware("http")
async def sliding_session_middleware(request: Request, call_next):
    # Skip check for skip-auth endpoints
    if request.url.path in ["/login", "/register", "/", "/docs", "/openapi.json"]:
        return await call_next(request)
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        # Let the endpoint handle 401 via dependency, but we still call next
        return await call_next(request)
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return await call_next(request)
        
        # If valid, generate a NEW token with fresh 30m expiry
        new_token = create_access_token(data={"sub": username})
        
        # Call next
        response = await call_next(request)
        
        # Add new token to response header for frontend to pick up
        response.headers["X-Refresh-Token"] = new_token
        return response
    except JWTError:
        return await call_next(request)

@app.post("/register")
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    print(f"Registration attempt for: {user.username}")
    db_user = db.query(models.Register).filter(models.Register.username == user.username).first()
    if db_user:
        print(f"Registration failed: {user.username} already exists")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = models.Register(
        username=user.username, 
        hashed_password=hashed_pwd, 
        phone_number=user.phone_number
    )
    try:
        db.add(new_user)
        db.commit()
    except Exception as e:
        print(f"Registration database error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    db.refresh(new_user)
    print(f"Registration successful for: {user.username}")
    return {"message": "registered"}

@app.post("/login")
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"Login attempt for: {user.username}")
    db_user = db.query(models.Register).filter(models.Register.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        print(f"Login failed: Invalid credentials for {user.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    db_user.is_active = True
    db.commit()
    
    access_token = create_access_token(data={"sub": db_user.username})
    print(f"Login successful for: {user.username}")
    return {
        "message": "Login successful", 
        "user_id": db_user.id, 
        "is_active": db_user.is_active,
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/upload-swatch")
async def upload_swach(
    swach_code: Annotated[str, Form(...)],
    file: Annotated[UploadFile, File(...)],
    model_file: Annotated[UploadFile | None, File()] = None,
    db: Session = Depends(get_db)
):
    try:
        import os
        import shutil
        
        # Path to Desktop swach image folder
        desktop_path = os.path.join(os.environ["USERPROFILE"], "Desktop", "swach image")
        model_image_folder = os.path.join(desktop_path, "model image")
        
        # Create directories if they don't exist
        if not os.path.exists(desktop_path):
            os.makedirs(desktop_path)
        if not os.path.exists(model_image_folder):
            os.makedirs(model_image_folder)
        
        # Generate swatch file path
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{swach_code}{file_extension}"
        swatch_path = os.path.join(desktop_path, file_name)
        
        # Save swatch file
        with open(swatch_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Handle model file if provided
        model_path = None
        if model_file:
            model_extension = os.path.splitext(model_file.filename)[1]
            model_name = f"{swach_code}{model_extension}"
            model_path = os.path.join(model_image_folder, model_name)
            with open(model_path, "wb") as buffer:
                shutil.copyfileobj(model_file.file, buffer)
        
        # Make record in postgres total_list table
        new_swatch = models.TotalList(
            swach_code=swach_code,
            swatch_path=swatch_path,
            model_path=model_path,
            status="Pending" # Default status
        )
        db.add(new_swatch)
        db.commit()
        db.refresh(new_swatch)
        
        return {
            "message": "Upload successful",
            "s_no": new_swatch.s_no,
            "swach_code": new_swatch.swach_code,
            "swatch_path": new_swatch.swatch_path,
            "model_path": new_swatch.model_path
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Upload error: {error_trace}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {"message": "FastAPI is running and connected to PostgreSQL!"}


