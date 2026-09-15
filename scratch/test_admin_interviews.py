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
    print("RUNNING ADMIN INTERVIEW & AI ANALYTICS TESTS (STEP 6)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful")

    # 2. GET /api/admin/interviews
    status_code, int_list_resp = make_request(f"{BASE_URL}/api/admin/interviews?page=1&limit=10", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch admin interviews failed: {int_list_resp}"
    print(f"TEST 2: GET /api/admin/interviews Status={status_code}")
    print(f"  -> Total Interviews: {int_list_resp['total_interviews']}")
    print(f"  -> Completed Interviews: {int_list_resp['completed_interviews']}")
    print(f"  -> Average Score: {int_list_resp['average_score']}%")

    # 3. Student Registration & Mock Interview Session Test
    student_email = "student_step6_interview@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Step6 Candidate Student",
        "email": student_email,
        "password": "Password123!",
        "college": "Harvard University",
        "degree": "B.S. Artificial Intelligence"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    # Start Interview
    status_code, start_res = make_request(f"{BASE_URL}/api/interview/start", method="POST", data={
        "domain": "Full Stack Engineering",
        "difficulty": "Medium",
        "question_count": 3
    }, headers=stud_headers)
    assert status_code == 201, f"Start interview failed: {start_res}"
    sess_id = start_res["session_id"]
    print(f"TEST 3: Student started mock interview session (ID: {sess_id})")

    # Submit Answers & Finish Interview
    eval_1, _ = make_request(f"{BASE_URL}/api/interview/answer", method="POST", data={
        "question_id": "fs_q1",
        "candidate_answer": "Client side rendering CSR renders HTML using JavaScript in browser, SSR renders HTML on server using Next.js for better SEO. REST API communicates JSON payload."
    }, headers=stud_headers)
    
    status_code, finish_res = make_request(f"{BASE_URL}/api/interview/finish/{sess_id}", method="POST", data=[
        {
            "question_id": "fs_q1",
            "score": 90,
            "rating": "Mastered",
            "clarity_score": 30,
            "technical_accuracy_score": 60,
            "strengths": ["Covered CSR, SSR, and Next.js REST API principles."],
            "missing_concepts": [],
            "improvement_feedback": "Great explanation!",
            "ideal_sample_response": "CSR renders HTML in browser via JavaScript..."
        }
    ], headers=stud_headers)
    assert status_code == 200, f"Finish interview failed: {finish_res}"
    print(f"TEST 4: Student finished interview with score {finish_res['average_score']}%")

    # 4. Verify Completed Interview Appears in Admin Interviews List
    status_code, admin_search = make_request(f"{BASE_URL}/api/admin/interviews?q={sess_id}", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(admin_search["interviews"]) >= 1, "Completed student interview session missing in admin list!"
    found_sess = admin_search["interviews"][0]
    assert found_sess["student_name"] == "Step6 Candidate Student"
    print("TEST 5: Passed! Completed student interview session immediately synchronized with Admin Interviews table")

    # 5. Fetch Admin Interview Detail
    status_code, detail_res = make_request(f"{BASE_URL}/api/admin/interviews/{sess_id}", method="GET", headers=admin_headers)
    assert status_code == 200
    assert detail_res["student_name"] == "Step6 Candidate Student"
    assert len(detail_res["evaluations"]) >= 1
    print("TEST 6: Passed! Admin fetched detailed interview scorecard with question evaluations")

    # 6. GET /api/admin/interview-analytics Summary Endpoint
    status_code, analytics_resp = make_request(f"{BASE_URL}/api/admin/interview-analytics", method="GET", headers=admin_headers)
    assert status_code == 200
    assert "score_distribution" in analytics_resp
    assert "domain_analytics" in analytics_resp
    print("TEST 7: Passed! /api/admin/interview-analytics returned valid aggregate metrics")

    # 7. RBAC Security Check: Student token accessing admin interviews
    status_code, stud_rbac_err = make_request(f"{BASE_URL}/api/admin/interviews", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student accessing /api/admin/interviews, got {status_code}"
    print("TEST 8: Passed! Student token rejected with HTTP 403 Forbidden on admin interview APIs")

    # 8. Unauthenticated Access Check
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/interviews", method="GET")
    assert status_code == 401, f"Expected 401 Unauthorized for missing token, got {status_code}"
    print("TEST 9: Passed! Unauthenticated request rejected with HTTP 401 Unauthorized")

    # 9. Credential Audit
    resp_str = json.dumps(detail_res)
    assert "passwordHash" not in resp_str, "passwordHash leaked in admin interview detail API!"
    assert "JWT_SECRET" not in resp_str, "JWT_SECRET leaked in admin interview detail API!"
    assert "MONGODB_URI" not in resp_str, "MONGODB_URI leaked in admin interview detail API!"
    print("TEST 10: Passed! Credential security audit clean (0 sensitive tokens leaked)")

    print("\nALL STEP 6 ADMIN INTERVIEW & AI ANALYTICS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
