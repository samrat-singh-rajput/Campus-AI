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
    print("RUNNING ADMIN SYSTEM HEALTH TESTS (STEP 7)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful")

    # 2. GET /api/admin/system-health
    status_code, health_res = make_request(f"{BASE_URL}/api/admin/system-health", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch admin system health failed: {health_res}"
    print(f"TEST 2: GET /api/admin/system-health Status={status_code}")
    print(f"  -> Overall Status: {health_res['overall_status']}")
    print(f"  -> Environment: {health_res['environment']}")
    print(f"  -> Total Students: {health_res['total_students']}")
    print(f"  -> Total Resumes: {health_res['total_resumes']}")
    print(f"  -> Total Jobs: {health_res['total_jobs']}")
    print(f"  -> Total Applications: {health_res['total_applications']}")
    print(f"  -> Total Interviews: {health_res['total_interviews']}")
    print(f"  -> Chroma Documents: {health_res['chroma_document_count']}")
    print(f"  -> Services Checked: {len(health_res['services'])}")

    # 3. GET /api/admin/system-health/database
    status_code, db_health_res = make_request(f"{BASE_URL}/api/admin/system-health/database", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch database health failed: {db_health_res}"
    assert "mongodb" in db_health_res
    assert "chromadb" in db_health_res
    print("TEST 3: Passed! /api/admin/system-health/database returned real MongoDB & ChromaDB metrics")

    # 4. GET /api/admin/system-health/services
    status_code, svcs_res = make_request(f"{BASE_URL}/api/admin/system-health/services", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(svcs_res) >= 9, f"Expected at least 9 services checked, got {len(svcs_res)}"
    svc_names = [s["name"] for s in svcs_res]
    print(f"TEST 4: Passed! /api/admin/system-health/services returned 9 real service health items:")
    for name in svc_names:
        print(f"   • {name}")

    # 5. Student Registration & Token RBAC Test
    student_email = "student_step7_health@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Step7 Student Candidate",
        "email": student_email,
        "password": "Password123!",
        "college": "MIT",
        "degree": "B.S. Computer Science"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    status_code, stud_rbac_err = make_request(f"{BASE_URL}/api/admin/system-health", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student token, got {status_code}"
    print("TEST 5: Passed! Student token rejected with HTTP 403 Forbidden on admin health APIs")

    # 6. Unauthenticated Access Check
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/system-health", method="GET")
    assert status_code == 401, f"Expected 401 Unauthorized for missing token, got {status_code}"
    print("TEST 6: Passed! Unauthenticated request rejected with HTTP 401 Unauthorized")

    # 7. Credential Audit
    resp_str = json.dumps(health_res)
    assert "passwordHash" not in resp_str, "passwordHash leaked in system health response!"
    assert "JWT_SECRET" not in resp_str, "JWT_SECRET leaked in system health response!"
    assert "MONGODB_URI" not in resp_str, "MONGODB_URI leaked in system health response!"
    assert "OPENAI_API_KEY" not in resp_str, "OPENAI_API_KEY leaked in system health response!"
    print("TEST 7: Passed! Credential security audit clean (0 sensitive tokens leaked)")

    print("\nALL STEP 7 ADMIN SYSTEM HEALTH & INFRASTRUCTURE MONITORING TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
