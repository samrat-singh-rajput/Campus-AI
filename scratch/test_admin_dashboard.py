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
    print("RUNNING ADMIN DASHBOARD TESTS (STEP 2)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    print("TEST 1: Admin Login successful")

    # 2. Fetch Admin Dashboard Stats
    status_code, db_stats = make_request(f"{BASE_URL}/api/admin/dashboard", method="GET", headers={"Authorization": f"Bearer {admin_token}"})
    print(f"TEST 2: GET /api/admin/dashboard Status={status_code}")
    assert status_code == 200, f"Expected 200 OK, got {status_code}: {db_stats}"

    # Verify keys
    expected_keys = [
        "total_students", "total_resumes", "total_jobs", "total_applications",
        "active_applications", "completed_interviews", "average_ats_score",
        "average_interview_score", "average_career_readiness", "recent_users",
        "recent_applications", "recent_activity"
    ]
    for key in expected_keys:
        assert key in db_stats, f"Missing key in response: {key}"

    print(f"  -> Total Students: {db_stats['total_students']}")
    print(f"  -> Total Resumes: {db_stats['total_resumes']}")
    print(f"  -> Total Jobs: {db_stats['total_jobs']}")
    print(f"  -> Total Applications: {db_stats['total_applications']}")
    print(f"  -> Active Applications: {db_stats['active_applications']}")
    print(f"  -> Completed Interviews: {db_stats['completed_interviews']}")
    print(f"  -> Average ATS Score: {db_stats['average_ats_score']}%")
    print(f"  -> Average Career Readiness: {db_stats['average_career_readiness']}%")
    print(f"  -> Recent Users count: {len(db_stats['recent_users'])}")
    print(f"  -> Recent Applications count: {len(db_stats['recent_applications'])}")

    # Verify recent users do NOT contain password or passwordHash
    for u in db_stats["recent_users"]:
        assert "password" not in u, "Exposed password in user list!"
        assert "passwordHash" not in u, "Exposed passwordHash in user list!"

    print("  -> Passed! Real MongoDB statistics and safe user records returned")

    # 3. Student Access Blocked
    student_email = "student_step2_test@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Step2 Student",
        "email": student_email,
        "password": "Password123!",
        "college": "MIT"
    })
    _, student_res = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    student_token = student_res.get("access_token")

    status_code, student_err = make_request(f"{BASE_URL}/api/admin/dashboard", method="GET", headers={"Authorization": f"Bearer {student_token}"})
    print(f"TEST 3 (Student Access to Admin Dashboard): Status={status_code}, Detail={student_err.get('detail')}")
    assert status_code == 403, f"Expected 403 Forbidden, got {status_code}"
    assert student_err.get("detail") == "Administrator privileges are required.", f"Unexpected detail: {student_err.get('detail')}"
    print("  -> Passed! Student correctly blocked with HTTP 403 Forbidden")

    # 4. Unauthenticated Access Blocked
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/dashboard", method="GET")
    print(f"TEST 4 (Unauthenticated Access): Status={status_code}, Detail={unauth_err.get('detail')}")
    assert status_code == 401, f"Expected 401 Unauthorized, got {status_code}"
    print("  -> Passed! Unauthenticated access correctly blocked with HTTP 401 Unauthorized")

    print("\nALL STEP 2 ADMIN DASHBOARD TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
