import json
import os
import urllib.request
import urllib.error


SYSTEM_PROMPT = """Ты — Луна, добрый и внимательный ИИ-помощник по вопросам женского здоровья, менструального цикла и беременности.
Отвечай по-русски, тепло и понятно (2-5 предложений). Будь поддерживающей, как хорошая подруга.
Ты не врач, поэтому при серьёзных симптомах всегда рекомендуй обратиться к специалисту.
Темы: менструальный цикл, ПМС, овуляция, планирование беременности, беременность по неделям, питание, самочувствие, эмоции.
Если в сообщении есть контекст пользователя (в скобках [Контекст пользователя: ...]) — используй его для персонализированных ответов, но не упоминай сам факт наличия контекста."""


def handler(event: dict, context) -> dict:
    """Чат с ИИ-помощником по вопросам женского здоровья и беременности."""
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, X-Device-Id",
                "Access-Control-Max-Age": "86400",
            },
            "body": "",
        }

    body = json.loads(event.get("body") or "{}")
    messages = body.get("messages", [])
    user_message = body.get("message", "")
    user_context = body.get("context", "")

    if not user_message and not messages:
        return {
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "message required"}),
        }

    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
            "body": json.dumps({
                "reply": "Чат-помощник пока не настроен. Добавьте OPENAI_API_KEY в настройках проекта."
            }),
        }

    system = SYSTEM_PROMPT
    if user_context:
        system += f"\n\nТекущий контекст пользователя: {user_context}"
    chat_messages = [{"role": "system", "content": system}]

    if messages:
        for m in messages[-12:]:
            if m.get("role") in ("user", "assistant") and m.get("content"):
                chat_messages.append({"role": m["role"], "content": m["content"]})
    else:
        chat_messages.append({"role": "user", "content": user_message})

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": chat_messages,
        "max_tokens": 300,
        "temperature": 0.7,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read())

    reply = data["choices"][0]["message"]["content"].strip()

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        "body": json.dumps({"reply": reply}),
    }