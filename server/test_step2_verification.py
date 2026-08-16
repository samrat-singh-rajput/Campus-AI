import time
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== CAMPUSMATE AI — STEP 2 VERIFICATION SUITE ===")
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    
    # 0. Health Check (Step 1 baseline)
    res_health = client.get("/api/health")
    assert res_health.status_code == 200, f"Health check failed: {res_health.status_code}"
    health_data = res_health.json()
    print("[1] Step 1 Health Check PASSED:", health_data["status"], "| DB:", health_data["database"]["mongodb_atlas"]["status"])

    # Unique test user
    timestamp = int(time.time())
    test_email = f"test_user_{timestamp}@campus.edu"
    test_password = "SecurePassword123!"
    
    # 1. Register New User
    reg_payload = {
        "name": "Jordan Lee",
        "email": test_email,
        "password": test_password,
        "college": "MIT",
        "degree": "B.S. Computer Science",
        "graduationYear": 2026,
        "skills": ["Python", "FastAPI", "React", "MongoDB"]
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 201, f"Registration failed ({res_reg.status_code}): {res_reg.text}"
    reg_data = res_reg.json()
    assert "access_token" in reg_data, "Token missing in registration response"
    assert "password" not in reg_data["user"], "Plain password exposed!"
    assert "passwordHash" not in reg_data["user"], "Password hash exposed!"
    user_id = reg_data["user"]["id"]
    token = reg_data["access_token"]
    print(f"[2] User Registration PASSED: User ID {user_id} created for {test_email}")

    # 2. Login User
    login_payload = {"email": test_email, "password": test_password}
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200, f"Login failed: {res_login.text}"
    login_data = res_login.json()
    login_token = login_data["access_token"]
    assert bool(login_token), "JWT token empty"
    print("[3] User Login PASSED: JWT Access Token generated successfully")

    # 3. GET /api/auth/me (Protected Route with valid JWT)
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {login_token}"})
    assert res_me.status_code == 200, f"Get profile failed: {res_me.text}"
    me_data = res_me.json()
    assert me_data["email"] == test_email, "Profile email mismatch"
    assert me_data["name"] == "Jordan Lee", "Profile name mismatch"
    assert "passwordHash" not in me_data, "Password hash exposed in /me!"
    print("[4] Protected Route /api/auth/me PASSED: Correct user profile returned")

    # 4. Invalid Password Test
    bad_login = client.post("/api/auth/login", json={"email": test_email, "password": "WrongPassword!"})
    assert bad_login.status_code == 401, f"Expected 401 for bad password, got {bad_login.status_code}"
    print("[5] Incorrect Password Test PASSED: Received HTTP 401 Unauthorized")

    # 5. Duplicate Email Registration Test
    dup_reg = client.post("/api/auth/register", json=reg_payload)
    assert dup_reg.status_code == 400, f"Expected 400 for duplicate email, got {dup_reg.status_code}"
    print("[6] Duplicate Email Test PASSED: Received HTTP 400 Bad Request")

    # 6. Invalid Input Validation (Short password & invalid email format)
    invalid_reg = client.post("/api/auth/register", json={"name": "X", "email": "not-an-email", "password": "123"})
    assert invalid_reg.status_code == 422, f"Expected 422 for Pydantic validation error, got {invalid_reg.status_code}"
    print("[7] Pydantic Schema Validation Test PASSED: Received HTTP 422 Unprocessable Entity")

    # 7. Protected Route Without Token Test
    no_token_me = client.get("/api/auth/me")
    assert no_token_me.status_code == 401, f"Expected 401 for missing token, got {no_token_me.status_code}"
    print("[8] Protected Route Without Token PASSED: Received HTTP 401 Unauthorized")

    # 8. Protected Route With Invalid Token Test
    bad_token_me = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_token_xyz"})
    assert bad_token_me.status_code == 401, f"Expected 401 for bad token, got {bad_token_me.status_code}"
    print("[9] Protected Route With Invalid Token PASSED: Received HTTP 401 Unauthorized")

    print("\n✅ ALL STEP 2 VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
