import os
import random
import time
from datetime import datetime, timedelta, timezone

import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 72

SMS_CODES: dict[str, dict] = {}

SMS_CODE_EXPIRE_MINUTES = 5


def create_jwt_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_sms_code() -> str:
    return f"{random.randint(0, 999999):06d}"


def send_sms_code(phone: str) -> str:
    code = generate_sms_code()
    expires_at = time.time() + SMS_CODE_EXPIRE_MINUTES * 60
    SMS_CODES[phone] = {"code": code, "expires_at": expires_at}
    return code


def verify_sms_code(phone: str, code: str) -> bool:
    entry = SMS_CODES.get(phone)
    if entry is None:
        return False
    if time.time() > entry["expires_at"]:
        del SMS_CODES[phone]
        return False
    if entry["code"] != code:
        return False
    del SMS_CODES[phone]
    return True
