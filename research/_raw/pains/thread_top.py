"""Merge arctic-shift comment pages and dump top-level answers by score."""
import json
import sys

out_path = sys.argv[1]
seen = {}
for p in sys.argv[2:]:
    for c in json.load(open(p))["data"]:
        seen[c["id"]] = c

top = [c for c in seen.values() if c["parent_id"].startswith("t3_")]
top.sort(key=lambda c: int(c["score"] or 0), reverse=True)
with open(out_path, "w") as f:
    f.write(f"всего комментариев {len(seen)}, ответов верхнего уровня {len(top)}\n\n")
    for c in top:
        body = " ".join(c["body"].split())
        f.write(f"[{c['score']}] {c['id']}: {body[:400]}\n")
print(len(seen), len(top))
