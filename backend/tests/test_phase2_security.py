import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.repositories.db_state import db_state

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_state():
    db_state.reset()


def test_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["video_generation"]["status"] == "strictly_disabled"
    assert data["video_generation"]["enabled"] is False


def test_auth_student_login_and_me():
    res = client.post("/api/v1/auth/login", json={
        "email": "vishwak@studyai.internal",
        "password": "StudentPass123!"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    assert res.json()["role"] == "student"

    # Call /me with token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "vishwak@studyai.internal"
    assert "tutor:chat" in me_res.json()["permissions"]


def test_superadmin_mfa_login_and_elevation():
    # Login without MFA code should fail
    fail_res = client.post("/api/v1/auth/superadmin/login", json={
        "email": "superadmin@studyai.com",
        "password": "SuperAdminSecretPass2026!",
        "mfa_code": "000000"
    })
    assert fail_res.status_code == 401

    # Login with valid MFA code succeeds
    succ_res = client.post("/api/v1/auth/superadmin/login", json={
        "email": "superadmin@studyai.com",
        "password": "SuperAdminSecretPass2026!",
        "mfa_code": "123456"
    })
    assert succ_res.status_code == 200
    super_token = succ_res.json()["access_token"]
    assert succ_res.json()["role"] == "superadmin"

    # Superadmin can view audit logs
    audit_res = client.get("/api/v1/superadmin/audit-logs", headers={"Authorization": f"Bearer {super_token}"})
    assert audit_res.status_code == 200


def test_rbac_escalation_prevention():
    # Login as admin
    admin_res = client.post("/api/v1/auth/login", json={
        "email": "admin@nps-bengaluru.edu.in",
        "password": "AdminPass123!"
    })
    assert admin_res.status_code == 200
    admin_token = admin_res.json()["access_token"]

    # Admin attempts to escalate a student to superadmin -> MUST BE REJECTED 403
    escalate_res = client.post("/api/v1/roles/assign", json={
        "user_id": "usr_student_001",
        "role": "superadmin"
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert escalate_res.status_code == 403
    assert escalate_res.json()["detail"]["code"] == "ROLE_ESCALATION_BLOCKED"


def test_parent_child_privacy_enforcement():
    # Login as parent Rajesh
    parent_res = client.post("/api/v1/auth/login", json={
        "email": "rajesh@studyai.internal",
        "password": "ParentPass123!"
    })
    assert parent_res.status_code == 200
    parent_token = parent_res.json()["access_token"]

    # Parent can view verified child progress
    progress_res = client.get(
        "/api/v1/parent/children/usr_student_001/progress",
        headers={"Authorization": f"Bearer {parent_token}"}
    )
    assert progress_res.status_code == 200
    assert "progress" in progress_res.json()

    # STRICT PRIVACY: Parent attempts to view child's private tutor chat without consent -> MUST BE REJECTED 403
    chat_res = client.get(
        "/api/v1/parent/children/usr_student_001/conversations",
        headers={"Authorization": f"Bearer {parent_token}"}
    )
    assert chat_res.status_code == 403
    assert chat_res.json()["detail"]["code"] == "STUDENT_CHAT_CONFIDENTIAL"


def test_unlinked_child_access_rejection():
    parent_res = client.post("/api/v1/auth/login", json={
        "email": "rajesh@studyai.internal",
        "password": "ParentPass123!"
    })
    parent_token = parent_res.json()["access_token"]

    # Rajesh is NOT linked to usr_student_002 (Bob)
    unlinked_res = client.get(
        "/api/v1/parent/children/usr_student_002/progress",
        headers={"Authorization": f"Bearer {parent_token}"}
    )
    assert unlinked_res.status_code == 403
    assert unlinked_res.json()["detail"]["code"] == "LINK_NOT_FOUND"


def test_video_generation_strictly_disabled():
    # Student token
    student_res = client.post("/api/v1/auth/login", json={
        "email": "vishwak@studyai.internal",
        "password": "StudentPass123!"
    })
    s_token = student_res.json()["access_token"]

    # POST /api/v1/media/video must return 403
    video_res = client.post(
        "/api/v1/media/video",
        json={"prompt": "create an educational video on cell division"},
        headers={"Authorization": f"Bearer {s_token}"}
    )
    assert video_res.status_code == 403
    assert video_res.json()["detail"]["code"] == "FEATURE_DISABLED"

    # Even Superadmin cannot enable video generation flag
    super_res = client.post("/api/v1/auth/superadmin/login", json={
        "email": "superadmin@studyai.com",
        "password": "SuperAdminSecretPass2026!",
        "mfa_code": "123456"
    })
    super_token = super_res.json()["access_token"]
    flag_update = client.patch(
        "/api/v1/superadmin/feature-flags/video_generation",
        json={"is_enabled": True},
        headers={"Authorization": f"Bearer {super_token}"}
    )
    assert flag_update.status_code == 403
    assert flag_update.json()["detail"]["code"] == "FEATURE_DISABLED"
