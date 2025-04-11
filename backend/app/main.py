from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

users_db = {
    "admin": {"username": "admin", "password": "admin123"},
    "user1": {"username": "user1", "password": "password123"},
}

class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/api/login")
async def login(user_data: UserLogin):
    user = users_db.get(user_data.username)
    if not user or user["password"] != user_data.password:
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误"
        )
    return {"message": "登录成功", "username": user["username"]}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
