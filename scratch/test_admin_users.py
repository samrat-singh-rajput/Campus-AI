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
    print("RUNNING ADMIN USER MANAGEMENT TESTS (STEP 3)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful")

    # 2. Fetch Admin Users List
    status_code, users_list = make_request(f"{BASE_URL}/api/admin/users?page=1&limit=10", method="GET", headers=admin_headers)
    print(f"TEST 2: GET /api/admin/users Status={status_code}")
    assert status_code == 200, f"Expected 200 OK, got {status_code}: {users_list}"
    
    print(f"  -> Total Students: {users_list['total_users']}")
    print(f"  -> Total Active: {users_list['total_active']}")
    print(f"  -> Total With Resume: {users_list['total_with_resume']}")
    print(f"  -> Total With Apps: {users_list['total_with_apps']}")
    print(f"  -> Page Users Count: {len(users_list['users'])}")

    # Check security: No passwords in list
    for u in users_list['users']:
        assert "password" not in u, "Exposed password in user list!"
        assert "passwordHash" not in u, "Exposed passwordHash in user list!"
    print("  -> Security check passed: No passwords/hashes in user list")

    # 3. Register New Real Student from public website
    student_email = "anuj_step3_test@campusmate.ai"
    status_code, reg_res = make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Anuj Step3 Candidate",
        "email": student_email,
        "password": "Password123!",
        "college": "Ganpat University",
        "degree": "B.Tech",
        "skills": ["Python", "FastAPI", "React", "MongoDB"]
    })
    assert status_code == 201, f"Student registration failed: {reg_res}"
    new_student_id = reg_res["user"]["id"]
    student_token = reg_res["access_token"]
    print(f"TEST 3: Registered new student '{reg_res['user']['name']}' (ID: {new_student_id})")

    # 4. Verify New Student appears in Admin -> Users list
    status_code, updated_users_list = make_request(f"{BASE_URL}/api/admin/users?page=1&limit=10", method="GET", headers=admin_headers)
    user_ids_in_list = [u["id"] for u in updated_users_list["users"]]
    assert new_student_id in user_ids_in_list, "Newly registered student did not appear automatically in Admin Users list!"
    print("TEST 4: Passed! Newly registered student automatically appeared in Admin Users list")

    # 5. Search Test
    status_code, search_res = make_request(f"{BASE_URL}/api/admin/users?q=anuj", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(search_res["users"]) >= 1, "Search query 'anuj' failed to find student"
    assert search_res["users"][0]["name"] == "Anuj Step3 Candidate"
    print("TEST 5: Passed! Search by name 'anuj' returned candidate")

    status_code, search_college_res = make_request(f"{BASE_URL}/api/admin/users?q=ganpat", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(search_college_res["users"]) >= 1, "Search query 'ganpat' failed to find student by college"
    print("TEST 6: Passed! Search by college 'ganpat' returned candidate")

    # 6. User Detail Test
    status_code, user_detail = make_request(f"{BASE_URL}/api/admin/users/{new_student_id}", method="GET", headers=admin_headers)
    assert status_code == 200, f"Expected 200 OK for user detail, got {status_code}: {user_detail}"
    assert user_detail["name"] == "Anuj Step3 Candidate"
    assert user_detail["email"] == student_email
    assert user_detail["college"] == "Ganpat University"
    assert user_detail["skills_count"] == 4
    assert user_detail["resume"]["has_resume"] is False
    assert "career_readiness_score" in user_detail["insights"]
    assert "password" not in user_detail
    assert "passwordHash" not in user_detail
    print("TEST 7: Passed! User detail returned full safe profile, skills, resume summary, app summary, and career insights")

    # 7. Disable User Account
    status_code, disable_res = make_request(f"{BASE_URL}/api/admin/users/{new_student_id}/status", method="PATCH", data={"status": "Disabled"}, headers=admin_headers)
    assert status_code == 200, f"Failed to disable user: {disable_res}"
    assert disable_res["new_status"] == "Disabled"
    print("TEST 8: Passed! Admin disabled student account")

    # 8. Attempt Student Login with Disabled Account
    status_code, login_err = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    assert status_code == 403, f"Expected 403 Forbidden for disabled student login, got {status_code}: {login_err}"
    assert login_err.get("detail") == "Your account has been disabled. Please contact the administrator."
    print("TEST 9: Passed! Disabled student login blocked with HTTP 403 Forbidden")

    # 9. Re-enable User Account
    status_code, enable_res = make_request(f"{BASE_URL}/api/admin/users/{new_student_id}/status", method="PATCH", data={"status": "Active"}, headers=admin_headers)
    assert status_code == 200, f"Failed to enable user: {enable_res}"
    assert enable_res["new_status"] == "Active"
    print("TEST 10: Passed! Admin re-enabled student account")

    # 10. Verify Student can login again
    status_code, re_login_res = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    assert status_code == 200, f"Expected 200 OK after re-enabling student, got {status_code}: {re_login_res}"
    print("TEST 11: Passed! Student successfully logged in again after re-activation")

    # 11. Security Test: Student token hitting admin API
    status_code, stud_admin_err = make_request(f"{BASE_URL}/api/admin/users", method="GET", headers={"Authorization": f"Bearer {student_token}"})
    assert status_code == 403, f"Expected 403 Forbidden for student accessing admin API, got {status_code}: {stud_admin_err}"
    print("TEST 12: Passed! Student token accessing /api/admin/users blocked with HTTP 403 Forbidden")

    print("\nALL STEP 3 ADMIN USER MANAGEMENT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
