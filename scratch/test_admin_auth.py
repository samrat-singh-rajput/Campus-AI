import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = body
        return e.code, parsed

def run_tests():
    print("==========================================")
    print("RUNNING ADMIN AUTHENTICATION TESTS (STEP 1)")
    print("==========================================")

    # TEST 1: Valid Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    print(f"TEST 1 (Valid Login): Status={status_code}")
    assert status_code == 200, f"Expected 200, got {status_code}: {res}"
    admin_token = res.get("access_token")
    assert admin_token, "No access_token returned"
    print("  -> Passed! Received admin access_token")

    # TEST 2: Correct Username + Wrong Password
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "wrongpassword"})
    print(f"TEST 2 (Wrong Password): Status={status_code}, Detail={res.get('detail')}")
    assert status_code == 401, f"Expected 401, got {status_code}"
    assert res.get("detail") == "Incorrect admin password. Please try again.", f"Unexpected message: {res.get('detail')}"
    print("  -> Passed! Received expected error message")

    # TEST 3: Wrong Username
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "wronguser", "password": "rajput"})
    print(f"TEST 3 (Wrong Username): Status={status_code}, Detail={res.get('detail')}")
    assert status_code == 401, f"Expected 401, got {status_code}"
    assert res.get("detail") == "Administrator account not found.", f"Unexpected message: {res.get('detail')}"
    print("  -> Passed! Received expected error message")

    # TEST 4: Empty Fields
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "", "password": ""})
    print(f"TEST 4 (Empty Fields): Status={status_code}, Detail={res.get('detail')}")
    assert status_code == 400, f"Expected 400, got {status_code}"
    assert res.get("detail") == "Please enter your username and password.", f"Unexpected message: {res.get('detail')}"
    print("  -> Passed! Received expected error message")

    # TEST 5: Authenticated Admin GET /api/admin/me
    status_code, res = make_request(f"{BASE_URL}/api/admin/me", method="GET", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"TEST 5 (Admin Profile): Status={status_code}, Role={res.get('role')}")
    assert status_code == 200, f"Expected 200, got {status_code}"
    assert res.get("role") == "admin", f"Expected role admin, got {res.get('role')}"
    print("  -> Passed! Authenticated as admin")

    # TEST 6: Student Login & Forbidden Access Test
    # Register/Login as student
    student_email = "student_test_step1@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Test Student",
        "email": student_email,
        "password": "Password123!",
        "college": "MIT",
        "degree": "B.S. CS"
    })
    _, student_res = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    student_token = student_res.get("access_token")
    assert student_token, "Failed to get student token"

    # Attempt to hit admin endpoint with Student Token
    status_code, res = make_request(f"{BASE_URL}/api/admin/test-protected", method="GET", headers={"Authorization": f"Bearer {student_token}"})
    print(f"TEST 6 (Student Accessing Admin Endpoint): Status={status_code}, Detail={res.get('detail')}")
    assert status_code == 403, f"Expected 403 Forbidden, got {status_code}"
    assert res.get("detail") == "Administrator privileges are required.", f"Unexpected detail: {res.get('detail')}"
    print("  -> Passed! Student token correctly rejected with HTTP 403 Forbidden")

    # TEST 7: Unauthenticated Access to Admin Endpoint
    status_code, res = make_request(f"{BASE_URL}/api/admin/test-protected", method="GET")
    print(f"TEST 7 (Unauthenticated Accessing Admin Endpoint): Status={status_code}, Detail={res.get('detail')}")
    assert status_code == 401, f"Expected 401 Unauthorized, got {status_code}"
    print("  -> Passed! Unauthenticated access rejected with HTTP 401 Unauthorized")

    print("\nALL 7 BACKEND ADMIN AUTHENTICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
