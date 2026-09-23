#!/usr/bin/env python3
"""Incremental Reddit post fetcher via arctic-shift (Pushshift mirror).
Writes each task's rows to posts.tsv immediately and logs completed
(subreddit, query) pairs to done.log so a restart skips finished work.
"""
import json, time, urllib.request, urllib.parse, urllib.error, sys, os, csv, random

BASE = "https://arctic-shift.photon-reddit.com/api/posts/search"
UA = "research-bot/1.0 (student project, contact: egor.p@leto.link)"
HERE = os.path.dirname(os.path.abspath(__file__))
TSV_PATH = os.path.join(HERE, "posts.tsv")
DONE_PATH = os.path.join(HERE, "done.log")
PAUSE_MIN, PAUSE_MAX = 8.0, 10.0

def load_done():
    done = set()
    if os.path.exists(DONE_PATH):
        with open(DONE_PATH) as f:
            for line in f:
                parts = line.rstrip("\n").split("\t")
                if len(parts) >= 2:
                    done.add((parts[0], parts[1]))
    return done

def ensure_tsv_header():
    if not os.path.exists(TSV_PATH):
        with open(TSV_PATH, "w", newline="") as f:
            w = csv.writer(f, delimiter="\t")
            w.writerow(["id", "subreddit", "query", "title", "score", "num_comments", "created_utc", "permalink"])

def append_posts(subreddit, query, posts):
    with open(TSV_PATH, "a", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        for p in posts:
            pid = p.get("id", "")
            permalink = f"https://www.reddit.com/r/{subreddit}/comments/{pid}/"
            w.writerow([pid, subreddit, query, p.get("title", ""), p.get("score", 0),
                        p.get("num_comments", 0), p.get("created_utc", ""), permalink])

def mark_done(subreddit, query, status, count):
    with open(DONE_PATH, "a") as f:
        f.write(f"{subreddit}\t{query}\t{status}\t{count}\t{int(time.time())}\n")

def fetch_once(subreddit, title, timeout=30):
    params = {"subreddit": subreddit, "limit": "100", "title": title,
              "fields": "title,score,num_comments,id,created_utc"}
    url = BASE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def fetch_with_backoff(subreddit, title, max_attempts=3):
    """Fewer retries, longer pause between attempts (per instruction: grow pause, not retry count)."""
    backoff = 10
    for attempt in range(max_attempts):
        try:
            data = fetch_once(subreddit, title)
            err = data.get("error")
            if err:
                print(f"  ERR ({attempt+1}/{max_attempts}) r/{subreddit} '{title}': {err}", file=sys.stderr)
                time.sleep(backoff)
                backoff += 12
                continue
            return data.get("data", [])
        except urllib.error.HTTPError as e:
            print(f"  HTTP ({attempt+1}/{max_attempts}) r/{subreddit} '{title}': {e}", file=sys.stderr)
            time.sleep(backoff)
            backoff += 12
        except Exception as e:
            print(f"  EXC ({attempt+1}/{max_attempts}) r/{subreddit} '{title}': {e}", file=sys.stderr)
            time.sleep(backoff)
            backoff += 12
    return None  # signal total failure

def main():
    tasks_file = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "tasks2.json")
    with open(tasks_file) as f:
        tasks = json.load(f)

    ensure_tsv_header()
    done = load_done()
    print(f"{len(done)} tasks already done, {len(tasks)} total in plan", file=sys.stderr)

    for t in tasks:
        sub, q = t["subreddit"], t["title"]
        key = (sub, q)
        if key in done:
            print(f"skip (already done): r/{sub} '{q}'", file=sys.stderr)
            continue
        print(f"fetching r/{sub} title='{q}' ...", file=sys.stderr)
        posts = fetch_with_backoff(sub, q)
        if posts is None:
            print(f"  -> FAILED after retries, marking failed and moving on", file=sys.stderr)
            mark_done(sub, q, "FAILED", 0)
        else:
            append_posts(sub, q, posts)
            mark_done(sub, q, "OK", len(posts))
            print(f"  -> {len(posts)} posts written", file=sys.stderr)
        time.sleep(random.uniform(PAUSE_MIN, PAUSE_MAX))
    print("ALL_DONE", file=sys.stderr)

if __name__ == "__main__":
    main()
