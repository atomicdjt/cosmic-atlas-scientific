#!/usr/bin/env python3
"""Shared helpers for Cosmic Atlas catalog ingestion.

Uses only the Python standard library so it can run in minimal CI/Codex/Work
containers without a dependency bootstrap.
"""
from __future__ import annotations

import json, math, re, urllib.request
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = "cosmic-atlas.catalog.v1"
LY_PER_PC = 3.261563777
MPC_TO_LY = 3.261563777e6
C_KM_S = 299792.458
H0 = 67.4
OMEGA_M = 0.315
OMEGA_R = 9.2e-5
OMEGA_L = 1.0 - OMEGA_M - OMEGA_R


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def fetch_bytes(url: str, *, timeout: int = 90, headers: dict | None = None) -> bytes:
    h = {"User-Agent": "CosmicAtlasDataPipeline/4.0 (+scientific visualization)"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def write_payload(path: str | Path, records: list[dict], source: dict, **metadata) -> None:
    payload = {
        "schema": SCHEMA,
        "generated_at": now_iso(),
        "source": source,
        "record_count": len(records),
        "records": records,
        **metadata,
    }
    Path(path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_hms_ra(value: str) -> float:
    """Parse 'HH:MM:SS', 'HHh MMm SSs', or decimal degrees into degrees."""
    s = str(value).strip()
    try:
        x = float(s)
        return x % 360.0
    except ValueError:
        pass
    nums = [float(x) for x in re.findall(r"[-+]?\d+(?:\.\d+)?", s)]
    if not nums:
        raise ValueError(f"Bad RA: {value!r}")
    h, m, sec = (nums + [0.0, 0.0])[:3]
    return (15.0 * (h + m / 60.0 + sec / 3600.0)) % 360.0


def parse_dms_dec(value: str) -> float:
    """Parse signed D:M:S / degree-prime-second strings into degrees."""
    s = str(value).strip().replace("−", "-")
    try:
        return float(s)
    except ValueError:
        pass
    sign = -1.0 if s.startswith("-") else 1.0
    nums = [float(x) for x in re.findall(r"\d+(?:\.\d+)?", s)]
    if not nums:
        raise ValueError(f"Bad Dec: {value!r}")
    d, m, sec = (nums + [0.0, 0.0])[:3]
    out = sign * (d + m / 60.0 + sec / 3600.0)
    if not -90 <= out <= 90:
        raise ValueError(f"Declination out of range: {out}")
    return out


def inverse_parallax_distance_ly(parallax_mas: float) -> float | None:
    p = float(parallax_mas)
    return (1000.0 / p) * LY_PER_PC if p > 0 and math.isfinite(p) else None


def E(z: float) -> float:
    zp1 = 1.0 + z
    return math.sqrt(OMEGA_R * zp1**4 + OMEGA_M * zp1**3 + OMEGA_L)


def comoving_distance_ly(z: float, steps: int | None = None) -> float:
    """Flat LCDM line-of-sight comoving distance using Simpson integration."""
    z = float(z)
    if z <= 0:
        return 0.0
    n = steps or max(512, int(256 * z))
    n = min(max(n, 512), 20000)
    if n % 2:
        n += 1
    h = z / n
    total = 1.0 / E(0.0) + 1.0 / E(z)
    for i in range(1, n):
        total += (4.0 if i % 2 else 2.0) / E(i * h)
    integral = total * h / 3.0
    return (C_KM_S / H0) * integral * MPC_TO_LY


def safe_float(v):
    if v is None or v == "":
        return None
    try:
        x = float(v)
        return x if math.isfinite(x) else None
    except (TypeError, ValueError):
        return None


def validate_record(r: dict) -> list[str]:
    problems = []
    if not str(r.get("id", "")).strip(): problems.append("missing id")
    ra, dec = safe_float(r.get("ra_deg")), safe_float(r.get("dec_deg"))
    if ra is None or not 0 <= ra < 360: problems.append("ra_deg must be [0,360)")
    if dec is None or not -90 <= dec <= 90: problems.append("dec_deg must be [-90,90]")
    d = safe_float(r.get("distance_ly"))
    angular = bool(r.get("angular_only", False))
    if d is None and not angular: problems.append("provide distance_ly or angular_only=true")
    if d is not None and d <= 0: problems.append("distance_ly must be >0 when supplied")
    return problems
