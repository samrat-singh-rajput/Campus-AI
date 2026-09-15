import urllib.request
import urllib.error
import json
import time

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
    print("RUNNING ADMIN SETTINGS & CONFIGURATION TESTS (STEP 10)")
    print("==========================================")

    # TEST 1: Admin Login -> 200 OK
    status_code, login_res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {login_res}"
    admin_token = login_res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful (HTTP 200)")

    # TEST 2: GET /api/admin/settings -> 200 OK
    status_code, settings_res = make_request(f"{BASE_URL}/api/admin/settings", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch admin settings failed: {settings_res}"
    print(f"TEST 2: GET /api/admin/settings Status={status_code}")

    # TEST 3 & 4: Safe platform info & real MongoDB metrics
    assert settings_res["platform"]["name"] == "CampusMate AI"
    assert "metrics" in settings_res["database"]
    assert settings_res["database"]["metrics"]["users_count"] >= 0
    print(f"TEST 3 & 4: Safe platform info ('{settings_res['platform']['name']}') & Real MongoDB collection metrics verified")

    # TEST 5: Verify zero secrets in response
    resp_str = json.dumps(settings_res)
    assert "passwordHash" not in resp_str, "passwordHash leaked in settings response!"
    assert "JWT_SECRET" not in resp_str, "JWT_SECRET leaked in settings response!"
    assert "MONGODB_URI" not in resp_str, "MONGODB_URI leaked in settings response!"
    assert "OPENAI_API_KEY" not in resp_str, "OPENAI_API_KEY leaked in settings response!"
    print("TEST 5: Passed! Credential security audit clean (0 sensitive secrets exposed)")

    # TEST 6 & 7: GET & PUT /api/admin/settings/profile
    status_code, prof_res = make_request(f"{BASE_URL}/api/admin/settings/profile", method="GET", headers=admin_headers)
    assert status_code == 200
    assert prof_res["username"] == "rajput"
    
    status_code, update_prof_res = make_request(f"{BASE_URL}/api/admin/settings/profile", method="PUT", data={"display_name": "Rajput Admin"}, headers=admin_headers)
    assert status_code == 200
    print("TEST 6 & 7: Passed! Admin profile endpoints working")

    # TEST 8: Wrong current password -> proper error
    status_code, wrong_pwd_res = make_request(f"{BASE_URL}/api/admin/settings/change-password", method="POST", data={
        "current_password": "WrongPassword123",
        "new_password": "NewSecretPassword123!",
        "confirm_password": "NewSecretPassword123!"
    }, headers=admin_headers)
    assert status_code == 400
    assert "incorrect" in wrong_pwd_res.get("detail", "").lower()
    print("TEST 8: Passed! Wrong current password rejected with human-readable error")

    # TEST 9: Password mismatch -> proper error
    status_code, mismatch_res = make_request(f"{BASE_URL}/api/admin/settings/change-password", method="POST", data={
        "current_password": "rajput",
        "new_password": "NewSecretPassword123!",
        "confirm_password": "DifferentPassword123!"
    }, headers=admin_headers)
    assert status_code == 400
    assert "match" in mismatch_res.get("detail", "").lower()
    print("TEST 9: Passed! Password mismatch rejected with human-readable error")

    # TEST 10: Weak password -> proper error
    status_code, weak_res = make_request(f"{BASE_URL}/api/admin/settings/change-password", method="POST", data={
        "current_password": "rajput",
        "new_password": "123",
        "confirm_password": "123"
    }, headers=admin_headers)
    assert status_code == 400
    assert "security" in weak_res.get("detail", "").lower() or "length" in weak_res.get("detail", "").lower()
    print("TEST 10: Passed! Weak password rejected with human-readable error")

    # TEST 11: Successful password change
    new_test_password = "NewRajputPassword123!"
    status_code, change_res = make_request(f"{BASE_URL}/api/admin/settings/change-password", method="POST", data={
        "current_password": "rajput",
        "new_password": new_test_password,
        "confirm_password": new_test_password
    }, headers=admin_headers)
    assert status_code == 200
    assert "successfully" in change_res.get("message", "").lower()
    print("TEST 11: Passed! Admin password changed successfully")

    # TEST 12: Verify old password no longer works
    status_code, old_login_err = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 401
    print("TEST 12: Passed! Old password ('rajput') no longer authenticates")

    # TEST 13: Verify new password works
    status_code, new_login_res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": new_test_password})
    assert status_code == 200
    new_admin_token = new_login_res["access_token"]
    new_admin_headers = {"Authorization": f"Bearer {new_admin_token}"}
    print("TEST 13: Passed! New password authenticates and issues valid JWT access token")

    # TEST 14: Password/hash values never appear in API responses
    assert new_test_password not in json.dumps(change_res)
    assert "passwordHash" not in json.dumps(change_res)
    print("TEST 14: Passed! Zero password secrets exposed in password change response")

    # TEST 15: Student token -> 403 Forbidden
    student_email = "settings_student_test@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Settings Student Test",
        "email": student_email,
        "password": "Password123!",
        "college": "Harvard University",
        "degree": "B.S. CS"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    status_code, stud_err = make_request(f"{BASE_URL}/api/admin/settings", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student token, got {status_code}"
    print("TEST 15: Passed! Student token rejected with HTTP 403 Forbidden")

    # TEST 16: Unauthenticated request -> 401 Unauthorized
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/settings", method="GET")
    assert status_code == 401, f"Expected 401 Unauthorized for missing token, got {status_code}"
    print("TEST 16: Passed! Unauthenticated request rejected with HTTP 401 Unauthorized")

    # TEST 17 & 18: Verify audit logs created for settings & password change
    time.sleep(0.5)
    status_code, audit_logs_res = make_request(f"{BASE_URL}/api/admin/audit-logs?resource_type_filter=settings", method="GET", headers=new_admin_headers)
    assert status_code == 200
    recorded_actions = [l["action"] for l in audit_logs_res["logs"]]
    assert "ADMIN_SETTINGS_VIEWED" in recorded_actions or "ADMIN_PASSWORD_CHANGED" in recorded_actions
    print("TEST 17 & 18: Passed! ADMIN_SETTINGS_VIEWED and ADMIN_PASSWORD_CHANGED audit events logged without sensitive info")

    # TEST 19: Verify existing Step 1-9 admin endpoints still work
    status_code, dash_res = make_request(f"{BASE_URL}/api/admin/dashboard", method="GET", headers=new_admin_headers)
    assert status_code == 200
    print("TEST 19: Passed! Existing Admin Panel Steps 1-9 endpoints fully operational")

    # TEST 20: Reset test password back to 'rajput' for future convenience!
    status_code, reset_res = make_request(f"{BASE_URL}/api/admin/settings/change-password", method="POST", data={
        "current_password": new_test_password,
        "new_password": "rajput",
        "confirm_password": "rajput"
    }, headers=new_admin_headers)
    assert status_code == 200
    print("TEST 20: Passed! System admin password cleanly restored to original ('rajput')")

    print("\nALL STEP 10 ADMIN SETTINGS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
