#!/usr/bin/env python3
import json, time, urllib.request, urllib.parse, sys, os

BASE = "https://arctic-shift.photon-reddit.com/api/posts/search"
UA = "research-bot/1.0 (student project, contact: egor.p@leto.link)"

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

def fetch(subreddit, title=None, selftext=None, limit=100, after=None, retries=4):
    params = {"subreddit": subreddit, "limit": str(limit),
              "fields": "title,score,num_comments,id,created_utc,author,link_flair_text,selftext"}
    if title:
        params["title"] = title
    if selftext:
        params["selftext"] = selftext
    if after:
        params["after"] = after
    url = BASE + "?" + urllib.parse.urlencode(params)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode())
            if data.get("error"):
                if "Timeout" in str(data.get("error")) or "slow down" in str(data.get("error")):
                    time.sleep(3 + attempt * 2)
                    continue
                else:
                    print(f"  ERR {subreddit} title={title} selftext={selftext}: {data['error']}", file=sys.stderr)
                    return []
            return data.get("data", [])
        except Exception as e:
            print(f"  EXC {subreddit} {title}/{selftext}: {e}", file=sys.stderr)
            time.sleep(3 + attempt * 2)
    return []

def main():
    tasks_file = sys.argv[1]
    out_file = sys.argv[2]
    with open(tasks_file) as f:
        tasks = json.load(f)
    all_results = {}
    for t in tasks:
        sub = t["subreddit"]
        key = t.get("title") or t.get("selftext")
        mode = "title" if "title" in t else "selftext"
        print(f"fetching r/{sub} {mode}={key} ...", file=sys.stderr)
        res = fetch(sub, title=t.get("title"), selftext=t.get("selftext"))
        all_results[f"{sub}|{mode}|{key}"] = res
        print(f"  -> {len(res)} posts", file=sys.stderr)
        time.sleep(1.8)
    with open(out_file, "w") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=1)
    print("DONE", file=sys.stderr)

if __name__ == "__main__":
    main()
