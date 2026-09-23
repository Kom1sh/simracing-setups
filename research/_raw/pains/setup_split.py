"""Split r/* 'setup' help questions into car tuning vs rig hardware (title heuristics)."""
import csv
import re
import sys
from collections import defaultdict

QUESTION = re.compile(r"\?|^how |^why |help|advice|tips|struggl|can.t |cannot|stuck|any idea|need ")
TUNE = re.compile(r"tyre|tire|brake bias|understeer|oversteer|camber|pressure|wing|aero|suspension|\barb\b|\btoe\b|damper|bump|rebound|ride height|gearing|setup for|setups for|baseline|fixed|open setup|paid setup|setup shop|coach dave|\bvrs\b|\.sto|telemetry|lap ?time|faster|grip|loose|snap")
RIG = re.compile(r"\brig|cockpit|wheel|pedal|monitor|triple|\bvr\b|desk|chair|\bpc\b|gpu|seat|mount|shifter|handbrake|button box|fanatec|moza|simagic|thrustmaster|logitech|display|screen")

path = sys.argv[1]
seen = set()
n = defaultdict(int)
c = defaultdict(int)
examples = []
with open(path, newline="") as f:
    for row in csv.DictReader(f, delimiter="\t"):
        if row["id"] in seen or row["query"] != "setup":
            continue
        seen.add(row["id"])
        t = row["title"].lower()
        if not QUESTION.search(t):
            continue
        tune, rig = bool(TUNE.search(t)), bool(RIG.search(t))
        cls = "tune" if tune and not rig else "rig" if rig and not tune else "both" if tune else "unclear"
        key = (row["subreddit"], cls)
        n[key] += 1
        c[key] += int(row["num_comments"] or 0)
        if cls == "tune":
            examples.append((int(row["num_comments"] or 0), row["score"], row["subreddit"], row["title"][:110]))

totals = defaultdict(int)
for (sub, cls), v in sorted(n.items()):
    totals[cls] += v
    print(f"{sub:<20} {cls:<8} {v:>4} тредов, {c[(sub, cls)] / v:>4.0f} комм. в среднем")
print("итого:", dict(totals))
print("--- вопросы про настройку машины, по комментариям:")
for e in sorted(examples, reverse=True)[:15]:
    print(*e, sep="\t")
