import secrets
import string
import hashlib
import time
import sys
from datetime import datetime

MAX_ATTEMPTS = 3       # failures before each lockout
SHUTDOWN_AFTER = 9     # total failures before the system shuts down
LOG_FILE = "failed_logins.log"


def generate_password(length=16):
    chars = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(chars) for _ in range(length))


def hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)


def log_failure(count):
    with open(LOG_FILE, "a") as f:
        f.write(f"{datetime.now():%Y-%m-%d %H:%M:%S} - failed attempt #{count}\n")


salt = secrets.token_bytes(16)
password = generate_password()
stored_hash = hash_password(password, salt)
print("Your generated password:", password)

failures = 0
lock_time = 30

while True:
    guess = input("Login: ")
    if secrets.compare_digest(hash_password(guess, salt), stored_hash):
        print("Access granted")
        break

    failures += 1
    log_failure(failures)
    print(f"Wrong password ({failures} failed)")

    if failures >= SHUTDOWN_AFTER:
        print("Intrusion suspected. System shutting down.")
        sys.exit(1)

    if failures % MAX_ATTEMPTS == 0:
        print(f"Locked for {lock_time} seconds...")
        time.sleep(lock_time)
        lock_time *= 2
