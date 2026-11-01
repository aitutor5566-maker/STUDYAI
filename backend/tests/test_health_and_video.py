from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_health():
    """Verify root health check returns 200 and reports video strictly disabled."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["video_generation"]["status"] == "strictly_disabled"
    assert data["video_generation"]["enabled"] is False


def test_api_v1_health():
    """Verify API V1 health check contract."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["video_generation"]["status"] == "strictly_disabled"
    assert "ai_providers" in data


def test_video_generation_strictly_rejected():
    """Verify Section 7: POST /api/v1/media/video must return 403 Forbidden with FEATURE_DISABLED."""
    response = client.post("/api/v1/media/video", json={"topic": "Solar System", "duration": 40})
    assert response.status_code == 403
    data = response.json()
    detail = data.get("detail", data)
    assert detail["code"] == "FEATURE_DISABLED"
    assert detail["disabled"] is True


def test_visual_plan_endpoint():
    """Verify visual plan decomposition for Human Heart."""
    response = client.get("/api/v1/visual/plan?topic=Human+Heart&grade_level=Grade+10")
    assert response.status_code == 200
    data = response.json()
    assert data["topic"] == "Human Heart"
    assert len(data["subtopics"]) >= 3
    assert data["subtopics"][0]["has_3d_support"] is True


def test_tutor_ask_with_component_selection():
    """Verify Section H: Tutor processes targeted visual component selection."""
    payload = {
        "topic": "Human Heart",
        "question": "What is the role of this part?",
        "mode": "detailed",
        "grade": 10,
        "selected_visual_component": {
            "id": "left_ventricle",
            "label": "Left Ventricle",
            "role": "Pumps oxygenated blood to systemic aorta"
        }
    }
    response = client.post("/api/v1/tutor/ask", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Left Ventricle" in data["introduction"]
    assert data["selectedVisualComponent"]["id"] == "left_ventricle"
