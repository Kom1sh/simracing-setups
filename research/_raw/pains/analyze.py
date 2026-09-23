#!/usr/bin/env python3
import json, sys, csv

def load(files):
    merged = {}
    for fn in files:
        with open(fn) as f:
            d = json.load(f)
        for k, v in d.items():
            merged[k] = v
    return merged

def main():
    files = sys.argv[1:-1]
    out_prefix = sys.argv[-1]
    merged = load(files)

    # Flatten all posts with metadata, dedupe by id
    seen = {}
    for key, posts in merged.items():
        sub, mode, kw = key.split("|", 2)
        for p in posts:
            pid = p.get("id")
            if not pid:
                continue
            if pid not in seen:
                seen[pid] = {
                    "id": pid,
                    "subreddit": sub,
                    "title": p.get("title", ""),
                    "score": p.get("score", 0) or 0,
                    "num_comments": p.get("num_comments", 0) or 0,
                    "created_utc": p.get("created_utc", 0),
                    "keywords": set(),
                }
            seen[pid]["keywords"].add(f"{sub}:{kw}")

    all_posts = list(seen.values())
    all_posts.sort(key=lambda x: -x["score"])

    # write full TSV sorted by score
    with open(f"{out_prefix}_all_by_score.tsv", "w", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["title", "score", "num_comments", "created_utc", "subreddit", "id", "url", "keywords"])
        for p in all_posts:
            url = f"https://www.reddit.com/r/{p['subreddit']}/comments/{p['id']}/"
            w.writerow([p["title"], p["score"], p["num_comments"], p["created_utc"], p["subreddit"], p["id"], url, ";".join(sorted(p["keywords"]))])

    # per-subreddit counts of matched threads per keyword (volume signal)
    kw_counts = {}
    for key, posts in merged.items():
        sub, mode, kw = key.split("|", 2)
        kw_counts.setdefault((sub, kw), 0)
        kw_counts[(sub, kw)] = len(posts)

    with open(f"{out_prefix}_keyword_volume.tsv", "w", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["subreddit", "keyword", "num_threads_returned"])
        for (sub, kw), n in sorted(kw_counts.items(), key=lambda x: -x[1]):
            w.writerow([sub, kw, n])

    print(f"Total unique posts: {len(all_posts)}", file=sys.stderr)
    print(f"Top 20 by score:", file=sys.stderr)
    for p in all_posts[:20]:
        print(f"  {p['score']:>6} pts / {p['num_comments']:>4} cmt  r/{p['subreddit']}  {p['title'][:80]}", file=sys.stderr)

if __name__ == "__main__":
    main()
