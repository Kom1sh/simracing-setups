#!/usr/bin/env python3
import json, time, urllib.request, urllib.parse, sys

BASE = "https://arctic-shift.photon-reddit.com/api/comments/search"
UA = "research-bot/1.0 (student project, contact: egor.p@leto.link)"

IDS = [
    ("1mdewbt", "Hey racers, what's been frustrating you most about your iRacing progress?"),
    ("1n0hnpo", "I'm so tired of these weeks... economic system makes me want to quit the game"),
    ("1q4nm3y", "Sim Racing burnout - should I wait any longer?"),
    ("1qhe53w", "Genuine question. What makes wheels like this... so expensive?"),
    ("wqvr7d", "How can my 70y dad improve his lap times? Safety rating is over 9000..."),
    ("1vjzggm", "The Frustrating Reality of Being a Mid-Pack Top Split Driver"),
    ("1q9hnis", "[LMU] I'm tired of ruining my safety rating and I need help"),
]

def fetch(post_id, limit=40):
    params = {"link_id": f"t3_{post_id}", "limit": str(limit), "fields": "body,score,author"}
    url = BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode())
        return data.get("data", [])
    except Exception as e:
        print(f"ERR {post_id}: {e}", file=sys.stderr)
        return []

def main():
    out = {}
    for pid, title in IDS:
        print(f"fetching comments for {pid} ({title[:50]})...", file=sys.stderr)
        comments = fetch(pid)
        comments = [c for c in comments if c.get("body") and c["body"] not in ("[deleted]", "[removed]")]
        comments.sort(key=lambda c: -(c.get("score") or 0))
        out[pid] = {"title": title, "top_comments": comments[:6]}
        print(f"  -> {len(comments)} usable comments", file=sys.stderr)
        time.sleep(12)
    with open("comments.json", "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("DONE_COMMENTS", file=sys.stderr)

if __name__ == "__main__":
    main()
