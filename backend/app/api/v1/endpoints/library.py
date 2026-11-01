import base64
import datetime
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ....security.rbac import (
    ROLE_SUPERADMIN, ROLE_ADMIN, AuthenticatedUser,
    get_current_user, require_role
)
from ....services.storage_service import validate_file_payload
from ....repositories.db_state import db_state
from .visual_3d import MODELS_CATALOG

router = APIRouter()


class UploadResourceRequest(BaseModel):
    title: str = Field(..., min_length=2)
    subject: str = "Science"
    grade: str = "Grade 10"
    filename: str
    mime_type: str
    file_content_base64: str = Field(..., description="Base64 encoded file content")


class CreateCollectionRequest(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = ""
    resource_ids: List[str] = []


class AddToCollectionRequest(BaseModel):
    resource_id: str


@router.get("", summary="Centralized Multi-Resource Learning Library")
async def browse_library(
    resource_type: Optional[str] = Query(default=None, alias="type"),
    subject: Optional[str] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "recent",
    tag: Optional[str] = None,
    favorites_only: bool = False,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Centralized personal learning catalog consolidating:
    - AI Tutor Lessons
    - AI Notes
    - Uploaded PDFs & Documents
    - Interactive 3D Simulations
    - Labeled Scientific Diagrams
    - Learning Games
    Supports keyword search, category filters, tag aggregation, and favorites.
    """
    user_favs = set(db_state.user_favorites.get(user.id, []))
    aggregated_items: List[Dict[str, Any]] = []

    # 1. AI Notes
    for n_id, n in db_state.ai_notes.items():
        if n["user_id"] == user.id or user.role in (ROLE_ADMIN, ROLE_SUPERADMIN):
            aggregated_items.append({
                "id": n_id,
                "title": n.get("title", "Study Note"),
                "description": f"AI Study Notebook • {len(n.get('flashcards_json', []))} flashcards",
                "subject": n.get("subject", "Science"),
                "grade": "Grade 10",
                "resource_type": "note",
                "topic": n.get("topic", ""),
                "tags": [n.get("subject", "Science").lower(), "notebook", "notes"],
                "created_at": n.get("created_at", datetime.datetime.now(datetime.timezone.utc).isoformat()),
                "is_favorite": n_id in user_favs,
                "content": {"noteId": n_id, "source_type": n.get("source_type", "topic")}
            })

    # 2. Uploaded Library Documents & Reference Materials
    for r_id, r in db_state.library_resources.items():
        aggregated_items.append({
            "id": r_id,
            "title": r.get("title", "Resource"),
            "description": r.get("description", "Curriculum material"),
            "subject": r.get("subject", "Science"),
            "grade": r.get("grade", "Grade 10"),
            "resource_type": r.get("resource_type", "pdf"),
            "topic": r.get("title", ""),
            "tags": r.get("tags", []),
            "file_path": r.get("file_path", ""),
            "created_at": r.get("created_at", "2026-01-01T00:00:00Z"),
            "is_favorite": r_id in user_favs,
            "content": {"file_path": r.get("file_path", "")}
        })

    # 3. 3D Science Simulations
    for m_id, m in MODELS_CATALOG.items():
        aggregated_items.append({
            "id": f"3d_{m_id}",
            "title": m["title"],
            "description": f"Interactive 3D Simulation • {len(m.get('parts', []))} inspectable anatomical parts",
            "subject": m.get("subject", "Science").capitalize(),
            "grade": "Grades 6–12",
            "resource_type": "model3d",
            "topic": m["title"],
            "tags": ["3d", "simulation", "threejs", m.get("subject", "science").lower()],
            "created_at": "2026-01-01T00:00:00Z",
            "is_favorite": f"3d_{m_id}" in user_favs,
            "content": {"modelId": m_id}
        })

    # 4. Learning Games & Arcades
    for g_id, g in db_state.games.items():
        aggregated_items.append({
            "id": f"game_{g_id}",
            "title": g["title"],
            "description": g.get("description", "Educational learning game"),
            "subject": g.get("subject", "Science"),
            "grade": f"Grades {g.get('min_grade', 6)}–{g.get('max_grade', 12)}",
            "resource_type": "game",
            "topic": g["title"],
            "tags": ["game", "arcade", "quiz", g.get("subject", "science").lower()],
            "created_at": "2026-01-01T00:00:00Z",
            "is_favorite": f"game_{g_id}" in user_favs,
            "content": {"gameType": g.get("game_type", g_id)}
        })

    # Compute resource counts by category
    counts = {
        "all": len(aggregated_items),
        "note": sum(1 for i in aggregated_items if i["resource_type"] == "note"),
        "pdf": sum(1 for i in aggregated_items if i["resource_type"] in ("pdf", "document")),
        "model3d": sum(1 for i in aggregated_items if i["resource_type"] == "model3d"),
        "game": sum(1 for i in aggregated_items if i["resource_type"] == "game"),
        "diagram": sum(1 for i in aggregated_items if i["resource_type"] == "diagram")
    }

    # Filter by resource type
    filtered = aggregated_items
    if resource_type and resource_type.lower() != "all":
        rt = resource_type.lower()
        if rt == "pdf":
            filtered = [i for i in filtered if i["resource_type"] in ("pdf", "document")]
        else:
            filtered = [i for i in filtered if i["resource_type"] == rt]

    # Filter by subject
    if subject and subject.lower() != "all":
        s_clean = subject.lower()
        filtered = [i for i in filtered if s_clean in i["subject"].lower()]

    # Filter by search query
    if q and q.strip():
        term = q.strip().lower()
        filtered = [
            i for i in filtered
            if term in i["title"].lower()
            or term in i.get("description", "").lower()
            or term in i.get("topic", "").lower()
            or any(term in t.lower() for t in i.get("tags", []))
        ]

    # Filter by tag
    if tag and tag.strip():
        t_clean = tag.strip().lower()
        filtered = [i for i in filtered if any(t_clean in t.lower() for t in i.get("tags", []))]

    # Filter by favorites
    if favorites_only:
        filtered = [i for i in filtered if i.get("is_favorite", False)]

    # Sorting
    if sort == "title_asc":
        filtered.sort(key=lambda x: x["title"].lower())
    else:
        # Default: recent
        filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)

    return {
        "counts": counts,
        "total": len(filtered),
        "items": filtered
    }


@router.post("/{resource_id}/favorite", summary="Toggle Favorite State")
async def toggle_favorite(resource_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    if user.id not in db_state.user_favorites:
        db_state.user_favorites[user.id] = []

    fav_list = db_state.user_favorites[user.id]
    if resource_id in fav_list:
        fav_list.remove(resource_id)
        is_fav = False
    else:
        fav_list.append(resource_id)
        is_fav = True

    return {"status": "success", "resource_id": resource_id, "is_favorite": is_fav}


@router.get("/recent", summary="List Recently Accessed Learning Resources")
async def get_recently_accessed(user: AuthenticatedUser = Depends(get_current_user)):
    recent = db_state.recently_accessed.get(user.id, [])
    return recent[:10]


@router.get("/collections", summary="List User Collections / Playlists")
async def list_collections(user: AuthenticatedUser = Depends(get_current_user)):
    user_cols = [c for c in db_state.library_collections.values() if c.get("user_id") == user.id]
    return user_cols


@router.post("/collections", status_code=status.HTTP_201_CREATED, summary="Create a Learning Collection")
async def create_collection(req: CreateCollectionRequest, user: AuthenticatedUser = Depends(get_current_user)):
    col_id = f"col_{uuid.uuid4().hex[:8]}"
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record = {
        "id": col_id,
        "user_id": user.id,
        "title": req.title,
        "description": req.description or "",
        "resource_ids": req.resource_ids,
        "created_at": now_iso
    }
    db_state.library_collections[col_id] = record
    return record


@router.post("/collections/{collection_id}/items", summary="Add Item to Collection")
async def add_item_to_collection(
    collection_id: str,
    req: AddToCollectionRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    col = db_state.library_collections.get(collection_id)
    if not col:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    if col.get("user_id") != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    if req.resource_id not in col["resource_ids"]:
        col["resource_ids"].append(req.resource_id)

    return {"status": "success", "collection": col}


@router.post("/upload", status_code=status.HTTP_201_CREATED, summary="Secure Document Upload")
async def upload_library_resource(
    req: UploadResourceRequest,
    user: AuthenticatedUser = Depends(require_role([ROLE_ADMIN, ROLE_SUPERADMIN]))
):
    """
    Upload reference materials with strict server-side validation:
    - Maximum 10MB file limit
    - Whitelisted MIME types
    - Binary magic byte validation
    """
    try:
        content_bytes = base64.b64decode(req.file_content_base64)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "Bad Request", "message": "Invalid base64 encoding", "code": "INVALID_BASE64"}
        )
        
    content, validated_mime = validate_file_payload(content_bytes, req.mime_type)
    
    new_id = f"res_{uuid.uuid4().hex[:8]}"
    virtual_path = f"/storage/library/{new_id}_{req.filename}"
    
    record = {
        "id": new_id,
        "tenant_id": user.tenant_id or "a0000000-0000-0000-0000-000000000001",
        "title": req.title,
        "description": f"Uploaded by {user.full_name}",
        "subject": req.subject,
        "grade": req.grade,
        "resource_type": "pdf" if "pdf" in validated_mime else "image",
        "file_path": virtual_path,
        "file_size_bytes": len(content),
        "mime_type": validated_mime,
        "tags": [req.subject.lower(), req.grade.lower()],
        "uploaded_by": user.id,
        "is_public": True,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    db_state.library_resources[new_id] = record
    return record


@router.delete("/{resource_id}")
async def delete_library_resource(resource_id: str, user: AuthenticatedUser = Depends(get_current_user)):
    res = db_state.library_resources.get(resource_id)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
        
    if res.get("uploaded_by") != user.id and user.role not in (ROLE_ADMIN, ROLE_SUPERADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete resource")
        
    del db_state.library_resources[resource_id]
    return {"status": "success", "message": "Resource deleted from Library"}
