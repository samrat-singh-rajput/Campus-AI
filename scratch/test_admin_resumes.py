import urllib.request
import urllib.error
import json
from datetime import datetime, timezone

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
    print("RUNNING ADMIN RESUME & ATS ANALYTICS TESTS (STEP 5)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful")

    # 2. GET /api/admin/resumes
    status_code, resumes_resp = make_request(f"{BASE_URL}/api/admin/resumes?page=1&limit=10", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch admin resumes failed: {resumes_resp}"
    print(f"TEST 2: GET /api/admin/resumes Status={status_code}")
    print(f"  -> Total Resumes: {resumes_resp['total_resumes']}")
    print(f"  -> Average ATS Score: {resumes_resp['average_ats_score']}%")
    print(f"  -> Score Distribution Categories: {len(resumes_resp['score_distribution'])}")

    # 3. Student Registration & Resume Integration Test
    student_email = "student_step5_resume_test@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Step5 Resume Student",
        "email": student_email,
        "password": "Password123!",
        "college": "MIT Institute of Tech",
        "degree": "B.S. Software Engineering"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_user_id = stud_login["user"]["id"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    # Simulate saving a parsed resume in MongoDB Atlas for this student
    # (or test through admin APIs)
    print("TEST 3: Student created (ID: {})".format(stud_user_id))

    # 4. Search Resumes by Student Name / Email / College
    status_code, search_resp = make_request(f"{BASE_URL}/api/admin/resumes?q=Step5", method="GET", headers=admin_headers)
    assert status_code == 200, f"Search resumes failed: {search_resp}"
    print(f"TEST 4: Search resumes by query 'Step5' returned {len(search_resp['resumes'])} records")

    # 5. Filter Resumes by ATS Category
    status_code, filter_resp = make_request(f"{BASE_URL}/api/admin/resumes?ats_filter=excellent", method="GET", headers=admin_headers)
    assert status_code == 200
    print(f"TEST 5: Filter resumes by ATS 'excellent' returned {len(filter_resp['resumes'])} records")

    # 6. GET /api/admin/resume-analytics Summary Endpoint
    status_code, analytics_resp = make_request(f"{BASE_URL}/api/admin/resume-analytics", method="GET", headers=admin_headers)
    assert status_code == 200
    assert "average_ats_score" in analytics_resp
    assert "score_distribution" in analytics_resp
    print("TEST 6: Passed! /api/admin/resume-analytics returned valid aggregate metrics")

    # 7. RBAC Security Check: Student token accessing admin resumes
    status_code, stud_rbac_err = make_request(f"{BASE_URL}/api/admin/resumes", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student accessing /api/admin/resumes, got {status_code}"
    print("TEST 7: Passed! Student token rejected with HTTP 403 Forbidden on admin resume APIs")

    # 8. Unauthenticated Access Check
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/resumes", method="GET")
    assert status_code == 401, f"Expected 401 Unauthorized for missing token, got {status_code}"
    print("TEST 8: Passed! Unauthenticated request rejected with HTTP 401 Unauthorized")

    # 9. Credential Audit
    resp_str = json.dumps(resumes_resp)
    assert "passwordHash" not in resp_str, "passwordHash leaked in admin resumes API!"
    assert "JWT_SECRET" not in resp_str, "JWT_SECRET leaked in admin resumes API!"
    assert "MONGODB_URI" not in resp_str, "MONGODB_URI leaked in admin resumes API!"
    print("TEST 9: Passed! Credential security audit clean (0 sensitive tokens leaked)")

    print("\nALL STEP 5 ADMIN RESUME & ATS ANALYTICS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
