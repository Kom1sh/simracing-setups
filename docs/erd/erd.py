"""ERD базы simracing (SQLite) по backend/app/models.py → docs/erd/erd.svg.
python3 docs/erd/erd.py; PNG — node docs/erd/render.mjs"""

from pathlib import Path
from xml.sax.saxutils import escape

OY = 70  # место под заголовок
ROW, HEAD = 30, 40
W_NAME, W_TYPE, W_KEY = 200, 210, 60
W = W_NAME + W_TYPE + W_KEY

# поле, тип, ключ; первое поле с PK — подчёркнуто
TABLES = {
    "auth_sessions": (60, 80, [
        ("id", "INTEGER", "PK"),
        ("user_id", "INTEGER", "FK"),
        ("token_hash", "VARCHAR(64)", "UQ"),
        ("created_at", "DATETIME", ""),
        ("expires_at", "DATETIME", ""),
    ]),
    "users": (60, 520, [
        ("id", "INTEGER", "PK"),
        ("email", "VARCHAR(254)", "UQ"),
        ("name", "VARCHAR(60)", ""),
        ("password_hash", "VARCHAR(255)", ""),
        ("created_at", "DATETIME", ""),
    ]),
    "setups": (710, 80, [
        ("id", "VARCHAR(36)", "PK"),
        ("user_id", "INTEGER", "FK"),
        ("name", "VARCHAR(120)", ""),
        ("car_id", "VARCHAR(80)", ""),
        ("track_id", "VARCHAR(80)", ""),
        ("data", "JSON", ""),
        ("created_at", "DATETIME", ""),
        ("updated_at", "DATETIME", ""),
    ]),
    "advice": (710, 497, [
        ("id", "VARCHAR(36)", "PK"),
        ("user_id", "INTEGER, NULL", "FK"),
        ("setup_id", "VARCHAR(36), NULL", ""),
        ("car_id", "VARCHAR(80)", ""),
        ("track_id", "VARCHAR(80)", ""),
        ("class_id", "VARCHAR(20)", ""),
        ("status", "VARCHAR(20)", ""),
        ("mode", "VARCHAR(20)", ""),
        ("model", "VARCHAR(80), NULL", ""),
        ("tokens", "INTEGER", ""),
        ("latency_ms", "INTEGER", ""),
        ("input", "JSON", ""),
        ("result", "JSON", ""),
        ("created_at", "DATETIME", ""),
    ]),
    "feedback": (1360, 467, [
        ("id", "INTEGER", "PK"),
        ("advice_id", "VARCHAR(36)", "FK, UQ"),
        ("user_id", "INTEGER, NULL", "FK"),
        ("result", "VARCHAR(10)", ""),
        ("applied", "BOOLEAN", ""),
        ("lap_before", "FLOAT, NULL", ""),
        ("lap_after", "FLOAT, NULL", ""),
        ("comment", "TEXT", ""),
        ("created_at", "DATETIME", ""),
    ]),
    "knowledge_chunks": (1360, 80, [
        ("id", "INTEGER", "PK"),
        ("manual_id", "VARCHAR(60)", ""),
        ("class_id", "VARCHAR(20)", ""),
        ("heading", "VARCHAR(120)", ""),
        ("text", "TEXT", ""),
        ("params", "JSON", ""),
    ]),
    "knowledge_fts": (2010, 80, [
        ("rowid", "INTEGER", "PK"),
        ("heading", "TEXT", ""),
        ("text", "TEXT", ""),
    ]),
    "parameters": (60, 1130, [
        ("id", "INTEGER", "PK"),
        ("name", "VARCHAR(80)", ""),
        ("unit", "VARCHAR(20)", ""),
        ("description", "TEXT", ""),
        ("limits", "TEXT", ""),
    ]),
    "rules": (710, 1130, [
        ("id", "INTEGER", "PK"),
        ("rule_id", "VARCHAR(40)", "UQ"),
        ("symptom_type", "VARCHAR(20)", ""),
        ("corner_phase", "VARCHAR(10)", ""),
        ("stint_moment", "VARCHAR(20), NULL", ""),
        ("parameter_id", "INTEGER", "FK"),
        ("direction", "VARCHAR(10)", ""),
        ("change_description", "TEXT", ""),
        ("expected_effect", "TEXT", ""),
        ("limitations", "TEXT", ""),
        ("applicability", "JSON", ""),
        ("verification_status", "VARCHAR(20)", ""),
        ("basis", "TEXT", ""),
    ]),
    "request": (1360, 1130, [
        ("request_id", "VARCHAR(36)", "PK"),
        ("car", "VARCHAR(120)", ""),
        ("track", "VARCHAR(120)", ""),
        ("symptom_type", "VARCHAR(20)", ""),
        ("corner_phase", "VARCHAR(10)", ""),
        ("stint_moment", "VARCHAR(20), NULL", ""),
        ("comment", "TEXT", ""),
        ("status", "VARCHAR(10)", ""),
        ("rule_ids", "JSON", ""),
        ("created_at", "DATETIME", ""),
    ]),
}

CAPTIONS = {
    "knowledge_fts": "виртуальная таблица FTS5",
}


def box(name):
    x, y, fields = TABLES[name]
    return x, y + OY, W, HEAD + ROW * len(fields)


def row_y(name, field):
    x, y, fields = TABLES[name]
    i = [f[0] for f in fields].index(field)
    return y + OY + HEAD + ROW * i + ROW / 2


def table_svg(name):
    x, y, w, h = box(name)
    fields = TABLES[name][2]
    out = [f'<g class="table">']
    out.append(f'<rect x="{x + 3}" y="{y + 4}" width="{w}" height="{h}" rx="6" class="shadow"/>')
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" class="body"/>')
    out.append(f'<path d="M{x} {y + HEAD} V{y + 6} a6 6 0 0 1 6 -6 H{x + w - 6} a6 6 0 0 1 6 6 V{y + HEAD} Z" class="head"/>')
    out.append(f'<text x="{x + 14}" y="{y + 26}" class="title">{escape(name)}</text>')
    if name in CAPTIONS:
        out.append(f'<text x="{x + w - 12}" y="{y + 25}" class="caption" text-anchor="end">{escape(CAPTIONS[name])}</text>')
    out.append(f'<line x1="{x}" y1="{y + HEAD}" x2="{x + w}" y2="{y + HEAD}" class="sep"/>')
    out.append(f'<line x1="{x + W_NAME}" y1="{y + HEAD}" x2="{x + W_NAME}" y2="{y + h}" class="col"/>')
    out.append(f'<line x1="{x + W_NAME + W_TYPE}" y1="{y + HEAD}" x2="{x + W_NAME + W_TYPE}" y2="{y + h}" class="col"/>')
    for i, (f, t, k) in enumerate(fields):
        ty = y + HEAD + ROW * i + 20
        if i:
            out.append(f'<line x1="{x}" y1="{y + HEAD + ROW * i}" x2="{x + w}" y2="{y + HEAD + ROW * i}" class="rowsep"/>')
        cls = "field pk" if "PK" in k else "field fk" if "FK" in k else "field"
        out.append(f'<text x="{x + 14}" y="{ty}" class="{cls}">{escape(f)}</text>')
        out.append(f'<text x="{x + W_NAME + 12}" y="{ty}" class="type">{escape(t)}</text>')
        if k:
            out.append(f'<text x="{x + W - W_KEY / 2}" y="{ty}" class="key" text-anchor="middle">{escape(k)}</text>')
    out.append("</g>")
    return "\n".join(out)


# Маркеры «вороньей лапки» на конце линии: точка конца, направление «наружу из таблицы» (вектор внутрь линии)
def end_marker(px, py, dx, dy, kind):
    """kind: one (||), zero_one (o|), many (o<, ноль или много), one_many (|<)."""
    # локальная система: u — вдоль линии от таблицы, v — поперёк
    def pt(u, v):
        return px + dx * u - dy * v, py + dy * u + dx * v

    parts = []

    def line(u1, v1, u2, v2):
        (x1, y1), (x2, y2) = pt(u1, v1), pt(u2, v2)
        parts.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="mark"/>')

    def circle(u):
        cx, cy = pt(u, 0)
        parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="7" class="markc"/>')

    if kind in ("many", "one_many"):
        line(0, -10, 16, 0)
        line(0, 10, 16, 0)
        line(0, 0, 16, 0)
        if kind == "many":
            circle(24)
        else:
            line(22, -10, 22, 10)
    elif kind == "one":
        line(10, -10, 10, 10)
        line(18, -10, 18, 10)
    elif kind == "zero_one":
        line(10, -10, 10, 10)
        circle(25)
    return "\n".join(parts)


def connector(points, start_kind, end_kind, label, label_at, dashed=False, anchor="middle"):
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in points)
    out = [f'<path d="{d}" class="rel{" dashed" if dashed else ""}"/>']

    def unit(a, b):
        (x1, y1), (x2, y2) = a, b
        L = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
        return (x2 - x1) / L, (y2 - y1) / L

    sx, sy = unit(points[0], points[1])
    out.append(end_marker(*points[0], sx, sy, start_kind))
    ex, ey = unit(points[-1], points[-2])
    out.append(end_marker(*points[-1], ex, ey, end_kind))
    lx, ly = label_at
    out.append(f'<text x="{lx}" y="{ly}" class="label" text-anchor="{anchor}">{escape(label)}</text>')
    return "\n".join(out)


def right(name):
    x, y, w, h = box(name)
    return x + w


def left(name):
    return box(name)[0]


def top(name):
    return box(name)[1]


def bottom(name):
    x, y, w, h = box(name)
    return y + h


rels = []
# users → auth_sessions
rels.append(connector([(265, top("users")), (265, bottom("auth_sessions"))], "one", "many", "открывает сессии", (277, (top("users") + bottom("auth_sessions")) / 2 + 5), anchor="start"))
# users → setups
uy = row_y("users", "id")
hy = top("users") + 20
rels.append(connector([(right("users"), hy), (620, hy), (620, row_y("setups", "user_id")), (left("setups"), row_y("setups", "user_id"))], "one", "many", "хранит", (620, (hy + row_y("setups", "user_id")) / 2 + 5)))
# users → advice (user_id может быть NULL)
rels.append(connector([(right("users"), row_y("advice", "user_id")), (left("advice"), row_y("advice", "user_id"))], "zero_one", "many", "запрашивает", (620, row_y("advice", "user_id") + 26)))
# advice → feedback (1 : 0..1)
ay = row_y("advice", "id")
rels.append(connector([(right("advice"), ay), (left("feedback"), ay)], "one", "zero_one", "получает отзыв", ((right("advice") + left("feedback")) / 2, ay - 12)))
# users → feedback
fy = row_y("feedback", "user_id")
yb = bottom("advice") + 45
rels.append(connector([(480, bottom("users")), (480, yb), (1270, yb), (1270, fy), (left("feedback"), fy)], "zero_one", "many", "оставляет отзывы", ((left("advice") + right("advice")) / 2, yb - 10)))
# setups → advice: логическая связь, без внешнего ключа
sx = 945
rels.append(connector([(sx, bottom("setups")), (sx, top("advice"))], "zero_one", "many", "по сетапу (setup_id, без FK)", (sx + 12, (bottom("setups") + top("advice")) / 2 + 5), dashed=True, anchor="start"))
# knowledge_chunks → knowledge_fts (rowid = id)
ky = row_y("knowledge_chunks", "id")
rels.append(connector([(right("knowledge_chunks"), ky), (left("knowledge_fts"), ky)], "one", "one", "индексируется", ((right("knowledge_chunks") + left("knowledge_fts")) / 2, ky - 12)))
# parameters → rules
py = row_y("parameters", "id")
ry = row_y("rules", "parameter_id")
rels.append(connector([(right("parameters"), py), (620, py), (620, ry), (left("rules"), ry)], "one", "many", "используется в", (620, (py + ry) / 2 + 5)))
# request → rules: логическая связь через JSON-список
qy = row_y("request", "rule_ids")
rels.append(connector([(left("request"), qy), (right("rules"), qy)], "many", "many", "rule_ids (JSON, без FK)", ((right("rules") + left("request")) / 2, qy - 12), dashed=True))

WIDTH, HEIGHT = 2540, 1700

# Легенда
LX, LY = 2010, 1200 + OY
legend = [f'<rect x="{LX}" y="{LY}" width="470" height="300" rx="6" class="body"/>',
          f'<text x="{LX + 16}" y="{LY + 30}" class="title">Обозначения</text>']
items = [("one", "ровно одна запись"), ("zero_one", "ноль или одна"), ("many", "ноль или много")]
for i, (k, t) in enumerate(items):
    yy = LY + 64 + i * 40
    legend.append(f'<line x1="{LX + 20}" y1="{yy}" x2="{LX + 110}" y2="{yy}" class="rel"/>')
    legend.append(end_marker(LX + 110, yy, -1, 0, k))
    legend.append(f'<text x="{LX + 130}" y="{yy + 5}" class="legend">{t}</text>')
yy = LY + 64 + 3 * 40
legend.append(f'<line x1="{LX + 20}" y1="{yy}" x2="{LX + 110}" y2="{yy}" class="rel dashed"/>')
legend.append(f'<text x="{LX + 130}" y="{yy + 5}" class="legend">связь без внешнего ключа</text>')
legend.append(f'<text x="{LX + 20}" y="{yy + 44}" class="legend"><tspan class="pkl">PK</tspan> первичный ключ, <tspan class="fkl">FK</tspan> внешний ключ,</text>')
legend.append(f'<text x="{LX + 20}" y="{yy + 70}" class="legend">UQ уникальное, NULL необязательное</text>')

GROUPS = [
    (40, 30 + OY, 2500 - 40, 1050, "Аккаунты, сетапы, ИИ-ассистент и база знаний"),
    (40, 1090 + OY, 1870 - 40, 500, "Экспертные правила"),
]

STYLE = """
.bg { fill: #ffffff; }
.grid { stroke: #eef0f3; stroke-width: 1; }
.h1 { font: 700 30px 'Helvetica Neue', Arial, sans-serif; fill: #111; }
.sub { font: 400 17px 'Helvetica Neue', Arial, sans-serif; fill: #5e5e5e; }
.group { fill: none; stroke: #c9ced6; stroke-width: 1.5; stroke-dasharray: 8 6; }
.groupt { font: 600 15px 'Helvetica Neue', Arial, sans-serif; fill: #7a808a; letter-spacing: .02em; }
.shadow { fill: #000; opacity: .06; }
.body { fill: #fff; stroke: #4a4f57; stroke-width: 1.4; }
.head { fill: #d9dde3; stroke: #4a4f57; stroke-width: 1.4; }
.title { font: italic 600 19px 'Helvetica Neue', Arial, sans-serif; fill: #1b1d21; }
.caption { font: 400 13px 'Helvetica Neue', Arial, sans-serif; fill: #5e5e5e; }
.sep { stroke: #4a4f57; stroke-width: 1.4; }
.col { stroke: #9aa0a8; stroke-width: 1; }
.rowsep { stroke: #e3e6ea; stroke-width: 1; }
.field { font: 400 16px 'Helvetica Neue', Arial, sans-serif; fill: #24272c; }
.pk { font-weight: 700; text-decoration: underline; }
.fk { font-style: italic; fill: #1f5fa8; }
.type { font: 400 15px 'SF Mono', Menlo, Consolas, monospace; fill: #4d535b; }
.key { font: 700 13px 'Helvetica Neue', Arial, sans-serif; fill: #6b7079; }
.rel { fill: none; stroke: #3b3f46; stroke-width: 1.6; }
.dashed { stroke-dasharray: 7 5; stroke: #6b7079; }
.mark { stroke: #3b3f46; stroke-width: 1.6; }
.markc { fill: #fff; stroke: #3b3f46; stroke-width: 1.6; }
.label { font: 400 15px 'Helvetica Neue', Arial, sans-serif; fill: #24272c; paint-order: stroke; stroke: #fff; stroke-width: 5px; stroke-linejoin: round; }
.legend { font: 400 15px 'Helvetica Neue', Arial, sans-serif; fill: #24272c; }
.pkl { font-weight: 700; text-decoration: underline; }
.fkl { font-style: italic; fill: #1f5fa8; }
"""

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" font-family="Helvetica Neue, Arial, sans-serif">',
       f"<style>{STYLE}</style>",
       f'<rect width="{WIDTH}" height="{HEIGHT}" class="bg"/>']
for gx in range(0, WIDTH, 20):
    svg.append(f'<line x1="{gx}" y1="0" x2="{gx}" y2="{HEIGHT}" class="grid"/>')
for gy in range(0, HEIGHT, 20):
    svg.append(f'<line x1="0" y1="{gy}" x2="{WIDTH}" y2="{gy}" class="grid"/>')
svg.append('<text x="40" y="52" class="h1">ER-диаграмма базы данных Simracing Setups</text>')
svg.append('<text x="40" y="82" class="sub">SQLite, схема из миграций Alembic · 9 таблиц и полнотекстовый индекс FTS5</text>')
for gx, gy, gw, gh, gt in GROUPS:
    svg.append(f'<rect x="{gx}" y="{gy}" width="{gw}" height="{gh}" rx="10" class="group"/>')
    svg.append(f'<text x="{gx + 16}" y="{gy + 22}" class="groupt">{escape(gt.upper())}</text>')
svg += rels
svg += [table_svg(n) for n in TABLES]
svg += legend
svg.append("</svg>")
out = Path(__file__).with_name("erd.svg")
out.write_text("\n".join(svg), encoding="utf-8")
print(out)
