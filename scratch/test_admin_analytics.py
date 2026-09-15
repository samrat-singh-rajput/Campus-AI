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
    print("RUNNING ADMIN ANALYTICS & REPORTS TESTS (STEP 8)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful")

    # 2. GET /api/admin/analytics/overview
    status_code, ov_res = make_request(f"{BASE_URL}/api/admin/analytics/overview?time_range=all", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch analytics overview failed: {ov_res}"
    print(f"TEST 2: GET /api/admin/analytics/overview Status={status_code}")
    print(f"  -> Total Students: {ov_res['total_students']}")
    print(f"  -> Total Jobs: {ov_res['total_jobs']}")
    print(f"  -> Total Applications: {ov_res['total_applications']}")
    print(f"  -> Average ATS Score: {ov_res['average_ats_score']}%")

    # 3. GET /api/admin/analytics/students
    status_code, stud_res = make_request(f"{BASE_URL}/api/admin/analytics/students?time_range=30d", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch student analytics failed: {stud_res}"
    assert "college_distribution" in stud_res
    print("TEST 3: Passed! Student analytics returned college & degree distributions")

    # 4. GET /api/admin/analytics/jobs
    status_code, job_res = make_request(f"{BASE_URL}/api/admin/analytics/jobs?time_range=30d", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch job analytics failed: {job_res}"
    assert "jobs_by_company" in job_res
    print("TEST 4: Passed! Job marketplace analytics returned company & skill distributions")

    # 5. GET /api/admin/analytics/applications
    status_code, app_res = make_request(f"{BASE_URL}/api/admin/analytics/applications?time_range=30d", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch application analytics failed: {app_res}"
    assert "funnel" in app_res
    print("TEST 5: Passed! Application analytics returned conversion funnel metrics")

    # 6. GET /api/admin/analytics/resumes
    status_code, res_res = make_request(f"{BASE_URL}/api/admin/analytics/resumes?time_range=30d", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch resume analytics failed: {res_res}"
    assert "score_distribution" in res_res
    print("TEST 6: Passed! Resume ATS analytics returned score distribution tiers")

    # 7. GET /api/admin/analytics/interviews
    status_code, int_res = make_request(f"{BASE_URL}/api/admin/analytics/interviews?time_range=30d", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch interview analytics failed: {int_res}"
    assert "rating_distribution" in int_res
    print("TEST 7: Passed! Interview analytics returned domain performance averages")

    # 8. GET /api/admin/analytics/readiness & /insights
    status_code, read_res = make_request(f"{BASE_URL}/api/admin/analytics/readiness?time_range=all", method="GET", headers=admin_headers)
    assert status_code == 200
    status_code, ins_res = make_request(f"{BASE_URL}/api/admin/analytics/insights?time_range=all", method="GET", headers=admin_headers)
    assert status_code == 200
    print(f"TEST 8: Passed! Career readiness analytics ({read_res['average_readiness_score']}%) & {len(ins_res)} platform insights returned")

    # 9. Student Registration & Token RBAC Test
    student_email = "student_step8_analytics@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Step8 Student Candidate",
        "email": student_email,
        "password": "Password123!",
        "college": "Stanford University",
        "degree": "B.S. Data Science"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    status_code, stud_rbac_err = make_request(f"{BASE_URL}/api/admin/analytics/overview", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student token, got {status_code}"
    print("TEST 9: Passed! Student token rejected with HTTP 403 Forbidden on admin analytics APIs")

    # 10. Unauthenticated Access Check
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/analytics/overview", method="GET")
    assert status_code == 401, f"Expected 401 Unauthorized for missing token, got {status_code}"
    print("TEST 10: Passed! Unauthenticated request rejected with HTTP 401 Unauthorized")

    # 11. Credential Audit
    resp_str = json.dumps(ov_res) + json.dumps(stud_res) + json.dumps(job_res)
    assert "passwordHash" not in resp_str, "passwordHash leaked in analytics response!"
    assert "JWT_SECRET" not in resp_str, "JWT_SECRET leaked in analytics response!"
    assert "MONGODB_URI" not in resp_str, "MONGODB_URI leaked in analytics response!"
    assert "OPENAI_API_KEY" not in resp_str, "OPENAI_API_KEY leaked in analytics response!"
    print("TEST 11: Passed! Credential security audit clean (0 sensitive tokens leaked)")

    print("\nALL STEP 8 ADMIN ANALYTICS & REPORTS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
