import json
import os
import uuid
import random
import string
import psycopg2
from datetime import datetime, date

SCHEMA = "t_p81781078_menstrual_cycle_trac"

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """API для приложения Луна: пользователи, цикл, беременность, календарь, партнёр"""

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Device-Id",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    params = event.get("queryStringParameters") or {}
    device_id = event.get("headers", {}).get("X-Device-Id") or params.get("device_id")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            body = {}

    # маршрутизация по action (GET param или body)
    action = params.get("action") or body.get("action", "")

    def resp(data, status=200):
        return {"statusCode": status, "headers": headers, "body": json.dumps(data, default=str)}

    def err(msg, status=400):
        return {"statusCode": status, "headers": headers, "body": json.dumps({"error": msg})}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # ── ПОЛЬЗОВАТЕЛЬ ──────────────────────────────────────────────────────
        if action == "user_save" and method == "POST":
            if not device_id:
                return err("device_id required")
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (device_id, name) VALUES (%s, %s) "
                "ON CONFLICT (device_id) DO UPDATE SET name = EXCLUDED.name "
                "RETURNING id, device_id, name, created_at",
                (device_id, body.get("name"))
            )
            row = cur.fetchone()
            user_id = str(row[0])
            # создаём настройки если нет
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_settings (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
                (user_id,)
            )
            conn.commit()
            return resp({"id": user_id, "device_id": row[1], "name": row[2]})

        if action == "user_get" and method == "GET":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id, device_id, name FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return resp({"exists": False})
            user_id = str(row[0])
            cur.execute(f"SELECT theme_id, mode FROM {SCHEMA}.user_settings WHERE user_id = %s", (user_id,))
            s = cur.fetchone()
            settings = {"theme_id": s[0], "mode": s[1]} if s else {"theme_id": "rose", "mode": "cycle"}
            return resp({"exists": True, "id": user_id, "name": row[2], "settings": settings})

        # ── НАСТРОЙКИ ─────────────────────────────────────────────────────────
        if action == "settings_save" and method == "POST":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return err("user not found", 404)
            user_id = str(row[0])
            theme_id = body.get("theme_id", "rose")
            mode = body.get("mode", "cycle")
            cur.execute(
                f"INSERT INTO {SCHEMA}.user_settings (user_id, theme_id, mode) VALUES (%s, %s, %s) "
                "ON CONFLICT (user_id) DO UPDATE SET theme_id = EXCLUDED.theme_id, mode = EXCLUDED.mode, updated_at = NOW()",
                (user_id, theme_id, mode)
            )
            conn.commit()
            return resp({"ok": True})

        # ── ЦИКЛ ──────────────────────────────────────────────────────────────
        if action == "cycle_get" and method == "GET":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return resp({"exists": False})
            user_id = str(row[0])
            cur.execute(
                f"SELECT cycle_start, cycle_end, symptoms, note FROM {SCHEMA}.cycle_data "
                "WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1",
                (user_id,)
            )
            r = cur.fetchone()
            if not r:
                return resp({"exists": False})
            return resp({
                "exists": True,
                "cycle_start": str(r[0]) if r[0] else None,
                "cycle_end": str(r[1]) if r[1] else None,
                "symptoms": r[2] or [],
                "note": r[3] or ""
            })

        if action == "cycle_save" and method == "POST":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return err("user not found", 404)
            user_id = str(row[0])
            cs = body.get("cycle_start") or None
            ce = body.get("cycle_end") or None
            symptoms = body.get("symptoms", [])
            note = body.get("note", "")
            cur.execute(
                f"SELECT id FROM {SCHEMA}.cycle_data WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    f"UPDATE {SCHEMA}.cycle_data SET cycle_start=%s, cycle_end=%s, symptoms=%s, note=%s, updated_at=NOW() WHERE id=%s",
                    (cs, ce, symptoms, note, existing[0])
                )
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.cycle_data (user_id, cycle_start, cycle_end, symptoms, note) VALUES (%s,%s,%s,%s,%s)",
                    (user_id, cs, ce, symptoms, note)
                )
            conn.commit()
            return resp({"ok": True})

        # ── БЕРЕМЕННОСТЬ ──────────────────────────────────────────────────────
        if action == "pregnancy_get" and method == "GET":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return resp({"exists": False})
            user_id = str(row[0])
            cur.execute(
                f"SELECT last_period, due_date, symptoms, note FROM {SCHEMA}.pregnancy_data "
                "WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1",
                (user_id,)
            )
            r = cur.fetchone()
            if not r:
                return resp({"exists": False})
            return resp({
                "exists": True,
                "last_period": str(r[0]) if r[0] else None,
                "due_date": str(r[1]) if r[1] else None,
                "symptoms": r[2] or [],
                "note": r[3] or ""
            })

        if action == "pregnancy_save" and method == "POST":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return err("user not found", 404)
            user_id = str(row[0])
            lp = body.get("last_period") or None
            dd = body.get("due_date") or None
            symptoms = body.get("symptoms", [])
            note = body.get("note", "")
            cur.execute(
                f"SELECT id FROM {SCHEMA}.pregnancy_data WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    f"UPDATE {SCHEMA}.pregnancy_data SET last_period=%s, due_date=%s, symptoms=%s, note=%s, updated_at=NOW() WHERE id=%s",
                    (lp, dd, symptoms, note, existing[0])
                )
            else:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.pregnancy_data (user_id, last_period, due_date, symptoms, note) VALUES (%s,%s,%s,%s,%s)",
                    (user_id, lp, dd, symptoms, note)
                )
            conn.commit()
            return resp({"ok": True})

        # ── СОБЫТИЯ КАЛЕНДАРЯ ─────────────────────────────────────────────────
        if action == "events_get" and method == "GET":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return resp({"events": []})
            user_id = str(row[0])
            cur.execute(
                f"SELECT id, event_date, title FROM {SCHEMA}.calendar_events WHERE user_id = %s ORDER BY event_date",
                (user_id,)
            )
            events = [{"id": str(r[0]), "date": str(r[1]), "title": r[2]} for r in cur.fetchall()]
            return resp({"events": events})

        if action == "event_add" and method == "POST":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return err("user not found", 404)
            user_id = str(row[0])
            event_date = body.get("date")
            title = body.get("title", "").strip()
            if not event_date or not title:
                return err("date and title required")
            cur.execute(
                f"INSERT INTO {SCHEMA}.calendar_events (user_id, event_date, title) VALUES (%s,%s,%s) RETURNING id",
                (user_id, event_date, title)
            )
            new_id = str(cur.fetchone()[0])
            conn.commit()
            return resp({"ok": True, "id": new_id})

        if action == "event_update" and method == "POST":
            if not device_id:
                return err("device_id required")
            event_id = body.get("id")
            if not event_id:
                return err("id required")
            cur.execute(f"UPDATE {SCHEMA}.calendar_events SET title=%s WHERE id=%s", (body.get("title",""), event_id))
            conn.commit()
            return resp({"ok": True})

        # ── ПАРТНЁРСКАЯ ПРОГРАММА ─────────────────────────────────────────────
        if action == "partner_invite" and method == "POST":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return err("user not found", 404)
            user_id = str(row[0])
            # создаём код приглашения
            invite_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
            # удаляем старые pending приглашения этого юзера
            cur.execute(
                f"UPDATE {SCHEMA}.partner_links SET status='expired' "
                "WHERE owner_user_id=%s AND status='pending'",
                (user_id,)
            )
            cur.execute(
                f"INSERT INTO {SCHEMA}.partner_links (invite_code, owner_user_id) VALUES (%s,%s) RETURNING id",
                (invite_code, user_id)
            )
            conn.commit()
            return resp({"invite_code": invite_code})

        if action == "partner_join" and method == "POST":
            if not device_id:
                return err("device_id required")
            invite_code = body.get("invite_code", "").strip().upper()
            if not invite_code:
                return err("invite_code required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return err("user not found", 404)
            user_id = str(row[0])
            cur.execute(
                f"SELECT id, owner_user_id, status FROM {SCHEMA}.partner_links WHERE invite_code=%s",
                (invite_code,)
            )
            link = cur.fetchone()
            if not link:
                return err("Код не найден", 404)
            if link[2] != "pending":
                return err("Код уже использован или истёк")
            if str(link[1]) == user_id:
                return err("Нельзя присоединиться к своему же коду")
            cur.execute(
                f"UPDATE {SCHEMA}.partner_links SET partner_user_id=%s, status='active', accepted_at=NOW() WHERE id=%s",
                (user_id, link[0])
            )
            conn.commit()
            return resp({"ok": True, "partner_id": str(link[1])})

        if action == "partner_status" and method == "GET":
            if not device_id:
                return err("device_id required")
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE device_id = %s", (device_id,))
            row = cur.fetchone()
            if not row:
                return resp({"has_partner": False})
            user_id = str(row[0])
            cur.execute(
                f"SELECT pl.status, pl.invite_code, u.name, u.device_id "
                f"FROM {SCHEMA}.partner_links pl "
                f"LEFT JOIN {SCHEMA}.users u ON (u.id = pl.partner_user_id OR u.id = pl.owner_user_id) AND u.id != %s "
                "WHERE (pl.owner_user_id=%s OR pl.partner_user_id=%s) "
                "ORDER BY pl.created_at DESC LIMIT 1",
                (user_id, user_id, user_id)
            )
            pl = cur.fetchone()
            if not pl:
                return resp({"has_partner": False})
            if pl[0] == "active":
                return resp({"has_partner": True, "status": "active", "partner_name": pl[2]})
            if pl[0] == "pending":
                return resp({"has_partner": False, "status": "pending", "invite_code": pl[1]})
            return resp({"has_partner": False})

        return resp({"status": "ok", "message": "Луна API"})


    finally:
        cur.close()
        conn.close()