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
    print("RUNNING ADMIN JOBS & APPLICATIONS TESTS (STEP 4)")
    print("==========================================")

    # 1. Admin Login
    status_code, res = make_request(f"{BASE_URL}/api/admin/login", method="POST", data={"username": "rajput", "password": "rajput"})
    assert status_code == 200, f"Admin login failed: {res}"
    admin_token = res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("TEST 1: Admin Login successful")

    # 2. Fetch Admin Jobs List
    status_code, jobs_list = make_request(f"{BASE_URL}/api/admin/jobs?page=1&limit=10", method="GET", headers=admin_headers)
    print(f"TEST 2: GET /api/admin/jobs Status={status_code}")
    assert status_code == 200, f"Expected 200 OK, got {status_code}: {jobs_list}"
    print(f"  -> Total Jobs: {jobs_list['total_jobs']}")
    print(f"  -> Active Jobs: {jobs_list['active_jobs']}")
    print(f"  -> Closed Jobs: {jobs_list['closed_jobs']}")

    # 3. Create New Job as Admin
    job_payload = {
        "title": "STEP4 TEST — Full Stack Engineer",
        "company": "CampusMate Automated Systems",
        "location": "San Francisco, CA (Remote)",
        "job_type": "Full-time",
        "description": "Develop automated web systems using Python, FastAPI, React, and MongoDB.",
        "required_skills": ["Python", "FastAPI", "React", "MongoDB"],
        "preferred_degree": "B.S. Computer Science",
        "salary_range": "$120,000 - $150,000 / yr"
    }
    status_code, new_job = make_request(f"{BASE_URL}/api/admin/jobs", method="POST", data=job_payload, headers=admin_headers)
    assert status_code == 201, f"Create job failed: {new_job}"
    test_job_id = new_job["id"]
    print(f"TEST 3: Created new job '{new_job['title']}' (ID: {test_job_id})")

    # 4. Student Sync: Verify newly created job appears in Student Job Recommendations
    student_email = "student_step4_test@campusmate.ai"
    make_request(f"{BASE_URL}/api/auth/register", method="POST", data={
        "name": "Step4 Student Candidate",
        "email": student_email,
        "password": "Password123!",
        "college": "Stanford"
    })
    _, stud_login = make_request(f"{BASE_URL}/api/auth/login", method="POST", data={
        "email": student_email,
        "password": "Password123!"
    })
    stud_token = stud_login["access_token"]
    stud_headers = {"Authorization": f"Bearer {stud_token}"}

    status_code, recs = make_request(f"{BASE_URL}/api/jobs/recommendations/me", method="GET", headers=stud_headers)
    assert status_code == 200, f"Fetch student recommendations failed: {recs}"
    rec_job_ids = [j["id"] for j in recs]
    assert test_job_id in rec_job_ids, "Newly created admin job did not appear in student job recommendations!"
    print("TEST 4: Passed! Admin created job immediately synchronized with Student Job Matches")

    # 5. Edit Job
    edit_payload = {
        "title": "STEP4 TEST — Principal Engineer",
        "company": "CampusMate Automated Systems",
        "location": "San Francisco, CA (Remote)",
        "job_type": "Full-time",
        "description": "Updated job description for principal engineer role.",
        "required_skills": ["Python", "FastAPI", "React", "MongoDB", "Architecture"],
        "preferred_degree": "B.S. Computer Science",
        "salary_range": "$130,000 - $160,000 / yr",
        "status": "Active"
    }
    status_code, updated_job = make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}", method="PUT", data=edit_payload, headers=admin_headers)
    assert status_code == 200, f"Edit job failed: {updated_job}"
    assert updated_job["title"] == "STEP4 TEST — Principal Engineer"
    print("TEST 5: Passed! Job edited successfully in MongoDB")

    # 6. Close Job
    status_code, close_res = make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}/status", method="PATCH", data={"status": "Closed"}, headers=admin_headers)
    assert status_code == 200
    assert close_res["new_status"] == "Closed"
    print("TEST 6: Passed! Admin closed job position")

    # 7. Attempt Student Application to Closed Job
    status_code, app_err = make_request(f"{BASE_URL}/api/applications", method="POST", data={"job_id": test_job_id}, headers=stud_headers)
    assert status_code == 400, f"Expected 400 Bad Request for applying to closed job, got {status_code}: {app_err}"
    assert "closed" in app_err.get("detail", "").lower()
    print("TEST 7: Passed! Student application to closed job rejected with 400 Bad Request")

    # 8. Re-open Job
    status_code, reopen_res = make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}/status", method="PATCH", data={"status": "Active"}, headers=admin_headers)
    assert status_code == 200
    assert reopen_res["new_status"] == "Active"
    print("TEST 8: Passed! Admin reopened job position")

    # 9. Student Applies to Reopened Job
    status_code, app_res = make_request(f"{BASE_URL}/api/applications", method="POST", data={"job_id": test_job_id}, headers=stud_headers)
    assert status_code == 201, f"Student application failed: {app_res}"
    test_app_id = app_res["id"]
    print(f"TEST 9: Passed! Student submitted application (ID: {test_app_id})")

    # 10. Fetch Admin Applications List
    status_code, admin_apps = make_request(f"{BASE_URL}/api/admin/applications?q=STEP4", method="GET", headers=admin_headers)
    assert status_code == 200
    assert len(admin_apps["applications"]) >= 1
    found_app = admin_apps["applications"][0]
    assert found_app["job_title"] == "STEP4 TEST — Principal Engineer"
    print("TEST 10: Passed! Application appeared in Admin Applications list")

    # 11. Admin Updates Application Status (Applied -> Interviewing)
    status_code, status_res = make_request(f"{BASE_URL}/api/admin/applications/{test_app_id}/status", method="PATCH", data={"status": "Interviewing"}, headers=admin_headers)
    assert status_code == 200
    assert status_res["new_status"] == "Interviewing"
    print("TEST 11: Passed! Admin updated application status to 'Interviewing'")

    # 12. Student Kanban Sync Verification
    status_code, stud_apps = make_request(f"{BASE_URL}/api/applications/me", method="GET", headers=stud_headers)
    assert status_code == 200
    target_stud_app = next((a for a in stud_apps if a["id"] == test_app_id), None)
    assert target_stud_app is not None, "Application missing in student list!"
    assert target_stud_app["status"] == "Interviewing", f"Expected status 'Interviewing', got '{target_stud_app['status']}'"
    print("TEST 12: Passed! Student Application Kanban synchronized with updated status 'Interviewing'")

    # 13. Attempt Deleting Job with Existing Applications
    status_code, del_err = make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}", method="DELETE", headers=admin_headers)
    assert status_code == 400, f"Expected 400 Bad Request when deleting job with applications, got {status_code}: {del_err}"
    assert "existing applications" in del_err.get("detail", "").lower()
    print("TEST 13: Passed! Deletion of job with existing applications safely prevented")

    # 14. RBAC Security Check
    status_code, stud_job_err = make_request(f"{BASE_URL}/api/admin/jobs", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student accessing /api/admin/jobs, got {status_code}"
    status_code, stud_app_err = make_request(f"{BASE_URL}/api/admin/applications", method="GET", headers=stud_headers)
    assert status_code == 403, f"Expected 403 Forbidden for student accessing /api/admin/applications, got {status_code}"
    print("TEST 14: Passed! Student token rejected with HTTP 403 Forbidden on admin job/app APIs")

    # Clean up test application and test job created in this test
    # (Clean up ONLY the test records created in this script)
    make_request(f"{BASE_URL}/api/applications/{test_app_id}", method="DELETE", headers=stud_headers)
    make_request(f"{BASE_URL}/api/admin/jobs/{test_job_id}", method="DELETE", headers=admin_headers)
    print("TEST 15: Cleaned up Step 4 test job and test application safely.")

    print("\nALL STEP 4 ADMIN JOBS & APPLICATIONS TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
