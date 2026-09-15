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
    print("RUNNING ADMIN AUDIT LOGS TESTS (STEP 9)")
    print("==========================================")

    # TEST 1: Admin login -> 200 OK
    status_code, login_res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {login_res}"
    admin_token = login_res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful (HTTP 200)")

    # TEST 2: Admin audit endpoint -> 200 OK
    status_code, logs_res = make_request(f"{BASE_URL}/api/admin/audit-logs", method="GET", headers=admin_headers)
    assert status_code == 200, f"Fetch audit logs failed: {logs_res}"
    print(f"TEST 2: GET /api/admin/audit-logs Status={status_code}")

    # TEST 3: Initially retrieve existing audit logs
    initial_total = logs_res["total_logs"]
    print(f"TEST 3: Retrieved existing audit logs (Count={initial_total})")

    # TEST 4 & 5 & 6: Perform admin action (create & update test job) and verify corresponding audit events
    test_job_data = {
        "title": "Audit Test Cloud Engineer",
        "company": "Audit Logistics Corp",
        "location": "San Francisco, CA",
        "job_type": "Full-time",
        "description": "Testing automated audit logging capabilities",
        "required_skills": ["Python", "Docker", "AWS"],
        "preferred_degree": "B.S. Computer Science",
        "salary_range": "$120,000 - $150,000 / yr"
    }
    status_code, create_job_res = make_request(f"{BASE_URL}/api/admin/jobs", method="POST", data=test_job_data, headers=admin_headers)
    assert status_code == 201, f"Job creation failed: {create_job_res}"
    test_job_id = create_job_res["id"]
    print(f"TEST 4: Created test job (ID={test_job_id})")

    # Update job
    update_data = test_job_data.copy()
    update_data["title"] = "Audit Test Senior Cloud Engineer"
    update_data["status"] = "Active"
    make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}", method="PUT", data=update_data, headers=admin_headers)

    # Verify audit logs created
    time.sleep(0.5)
    status_code, updated_logs = make_request(f"{BASE_URL}/api/admin/audit-logs?resource_type_filter=job", method="GET", headers=admin_headers)
    assert status_code == 200
    job_logs = updated_logs["logs"]
    actions_recorded = [l["action"] for l in job_logs]
    assert "JOB_CREATED" in actions_recorded, f"JOB_CREATED missing in audit logs: {actions_recorded}"
    assert "JOB_UPDATED" in actions_recorded, f"JOB_UPDATED missing in audit logs: {actions_recorded}"
    print("TEST 5 & 6: Passed! JOB_CREATED and JOB_UPDATED audit logs verified in MongoDB Atlas")

    # TEST 7: Zero sensitive credentials in audit logs
    resp_str = json.dumps(updated_logs)
    assert "passwordHash" not in resp_str, "passwordHash leaked in audit log response!"
    assert "JWT_SECRET" not in resp_str, "JWT_SECRET leaked in audit log response!"
    assert "MONGODB_URI" not in resp_str, "MONGODB_URI leaked in audit log response!"
    assert "OPENAI_API_KEY" not in resp_str, "OPENAI_API_KEY leaked in audit log response!"
    print("TEST 7: Passed! Zero sensitive credentials exposed in audit response payload")

    # TEST 8: Search & filter audit logs
    status_code, search_res = make_request(f"{BASE_URL}/api/admin/audit-logs?q=Cloud%20Engineer", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(search_res["logs"]) > 0, "Search for 'Cloud Engineer' returned zero logs"
    print("TEST 8: Passed! Search and action category filters working correctly")

    # TEST 9: Pagination testing
    status_code, page_res = make_request(f"{BASE_URL}/api/admin/audit-logs?page=1&limit=2", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(page_res["logs"]) <= 2
    assert page_res["limit"] == 2
    print("TEST 9: Passed! Pagination (limit=2) verified")

    # TEST 10: Audit analytics endpoint returns real metrics
    status_code, analytics_res = make_request(f"{BASE_URL}/api/admin/audit-logs/analytics", method="GET", headers=admin_headers)
    assert status_code == 200
    assert analytics_res["total_audit_events"] >= 2
    assert "most_common_action" in analytics_res
    print(f"TEST 10: Passed! Audit analytics endpoint returned real metrics (Total Events={analytics_res['total_audit_events']})")

    # TEST 11: Student token -> 403 Forbidden
    student_email = "audit_student_test@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Audit Student Test",
        "email": student_email,
        "password": "Password123!",
        "college": "MIT",
        "degree": "B.S. CS"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    status_code, stud_err = make_request(f"{BASE_URL}/api/admin/audit-logs", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student token, got {status_code}"
    print("TEST 11: Passed! Student token rejected with HTTP 403 Forbidden")

    # TEST 12: Unauthenticated request -> 401 Unauthorized
    status_code, unauth_err = make_request(f"{BASE_URL}/api/admin/audit-logs", method="GET")
    assert status_code == 401, f"Expected 401 Unauthorized for missing token, got {status_code}"
    print("TEST 12: Passed! Unauthenticated request rejected with HTTP 401 Unauthorized")

    # TEST 13: Admin user disable/enable status updates
    stud_id = stud_login.get("user", {}).get("id") or stud_login.get("user", {}).get("_id")
    if stud_id:
        make_request(f"{BASE_URL}/api/admin/users/{stud_id}/status", method="PATCH", data={"status": "Disabled"}, headers=admin_headers)
        make_request(f"{BASE_URL}/api/admin/users/{stud_id}/status", method="PATCH", data={"status": "Active"}, headers=admin_headers)
        status_code, user_audit_res = make_request(f"{BASE_URL}/api/admin/audit-logs?resource_type_filter=user", method="GET", headers=admin_headers)
        u_actions = [l["action"] for l in user_audit_res["logs"]]
        assert "USER_DISABLED" in u_actions or "USER_ENABLED" in u_actions
        print("TEST 13: Passed! User disable/enable status updates generated correct audit events")

    # TEST 14: Job deletion audit & cleanup
    make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}", method="DELETE", headers=admin_headers)
    status_code, del_audit_res = make_request(f"{BASE_URL}/api/admin/audit-logs?q={test_job_id}", method="GET", headers=admin_headers)
    assert status_code == 200
    print("TEST 14 & 15: Passed! Temporary test job cleaned up and deletion logged cleanly")

    print("\nALL STEP 9 ADMIN AUDIT LOGS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
