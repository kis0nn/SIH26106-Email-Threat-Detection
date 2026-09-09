"""
Attachment Danger Analysis — Tier 3
Enumerates email attachments and flags dangerous file types.
Never stores raw binary payload — only metadata.
"""

import re
import logging

logger = logging.getLogger(__name__)

EXECUTABLE_EXTENSIONS = {
    '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.vbs', '.vbe',
    '.js', '.jse', '.wsf', '.wsh', '.msi', '.ps1', '.reg',
}

MACRO_EXTENSIONS = {
    '.docm', '.xlsm', '.pptm', '.dotm', '.xltm', '.potm',
}

ARCHIVE_EXTENSIONS = {
    '.zip', '.rar', '.7z', '.tar', '.gz',
}


def _has_double_extension(filename: str) -> bool:
    """Check for double extension patterns like invoice.pdf.exe"""
    parts = filename.rsplit('.', 2)
    if len(parts) >= 3:
        # Has at least two dots, so two extensions
        final_ext = '.' + parts[-1].lower()
        if final_ext in EXECUTABLE_EXTENSIONS:
            return True
    return False


def _get_extension(filename: str) -> str:
    """Get the final file extension (lowercase, with dot)."""
    if '.' in filename:
        return '.' + filename.rsplit('.', 1)[-1].lower()
    return ''


def analyze_attachments(msg) -> list[dict]:
    """
    Analyze attachments from a parsed email.message.Message object.
    Returns a list of attachment analysis dicts.
    Never stores raw binary payload.
    """
    attachments = []

    try:
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" not in content_disposition.lower():
                continue

            filename = part.get_filename()
            if not filename:
                continue

            # Get size without storing content
            payload = part.get_payload(decode=True)
            size = len(payload) if payload else 0

            mime_type = part.get_content_type() or "application/octet-stream"
            ext = _get_extension(filename)

            risk = "safe"
            detail = f"Attachment: {filename} ({mime_type}, {size} bytes)"

            # Check double extension (highest priority)
            if _has_double_extension(filename):
                risk = "dangerous"
                detail = f"Double extension executable detected: '{filename}' — disguised as a document but is actually an executable."

            # Check executable extension
            elif ext in EXECUTABLE_EXTENSIONS:
                risk = "dangerous"
                detail = f"Executable file detected: '{filename}' — can run arbitrary code on the target system."

            # Check macro-enabled documents
            elif ext in MACRO_EXTENSIONS:
                risk = "dangerous"
                detail = f"Macro-enabled document detected: '{filename}' — may contain malicious VBA macros that execute on open."

            # Check archives (suspicious but not always dangerous)
            elif ext in ARCHIVE_EXTENSIONS:
                risk = "suspicious"
                detail = f"Archive file detected: '{filename}' — may contain hidden executables or malware."

            attachments.append({
                "filename": filename,
                "mime_type": mime_type,
                "size": size,
                "risk": risk,
                "detail": detail,
            })

    except Exception as e:
        logger.warning("Attachment analysis failed: %s", e)

    return attachments
