import datetime
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("studyai_audit")

# In-memory audit log repository for live recording & queries
AUDIT_LOG_BUFFER = []


def record_audit_log(
    actor_id: Optional[str],
    actor_role: str,
    action: str,
    target_resource: str,
    target_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Records an audit event with timestamps and structured telemetry."""
    entry = {
        "id": f"audit_{datetime.datetime.now(datetime.timezone.utc).timestamp()}",
        "actor_id": actor_id or "anonymous",
        "actor_role": actor_role,
        "action": action,
        "target_resource": target_resource,
        "target_id": target_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "details": details or {},
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    AUDIT_LOG_BUFFER.append(entry)
    # Keep buffer bounded to last 10,000 entries
    if len(AUDIT_LOG_BUFFER) > 10000:
        AUDIT_LOG_BUFFER.pop(0)
        
    logger.info(f"[AUDIT] {actor_role}:{actor_id} performed {action} on {target_resource}:{target_id}")
    return entry


def get_audit_logs(limit: int = 50, offset: int = 0):
    """Retrieve audit logs with pagination."""
    sorted_logs = sorted(AUDIT_LOG_BUFFER, key=lambda x: x["created_at"], reverse=True)
    return sorted_logs[offset:offset + limit]
