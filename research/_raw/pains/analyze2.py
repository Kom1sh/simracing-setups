#!/usr/bin/env python3
"""Aggregate posts.tsv: dedupe by id, sort by score, per-subreddit/keyword volume."""
import csv, sys, os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TSV_PATH = os.path.join(HERE, "posts.tsv")

def main():
    posts = {}  # id -> row dict
    queries_by_id = defaultdict(set)
    kw_volume = defaultdict(int)  # (subreddit, query) -> count of rows (not unique)

    with open(TSV_PATH, newline="") as f:
        r = csv.DictReader(f, delimiter="\t")
        for row in r:
            pid = row["id"]
            if not pid:
                continue
            kw_volume[(row["subreddit"], row["query"])] += 1
            queries_by_id[pid].add(f"{row['subreddit']}:{row['query']}")
            if pid not in posts or int(row["score"] or 0) > int(posts[pid]["score"] or 0):
                posts[pid] = row

    all_posts = list(posts.values())
    all_posts.sort(key=lambda x: -int(x["score"] or 0))

    out_all = os.path.join(HERE, "agg_by_score.tsv")
    with open(out_all, "w", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["title", "score", "num_comments", "subreddit", "id", "permalink", "queries"])
        for p in all_posts:
            w.writerow([p["title"], p["score"], p["num_comments"], p["subreddit"], p["id"], p["permalink"],
                        ";".join(sorted(queries_by_id[p["id"]]))])

    out_vol = os.path.join(HERE, "agg_keyword_volume.tsv")
    with open(out_vol, "w", newline="") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerow(["subreddit", "query", "num_threads_returned"])
        for (sub, q), n in sorted(kw_volume.items(), key=lambda x: -x[1]):
            w.writerow([sub, q, n])

    print(f"Unique posts: {len(all_posts)}", file=sys.stderr)
    print("Top 30 by score:", file=sys.stderr)
    for p in all_posts[:30]:
        print(f"  {int(p['score'] or 0):>6} pts / {p['num_comments']:>4} cmt  r/{p['subreddit']:<20} {p['title'][:70]}", file=sys.stderr)

if __name__ == "__main__":
    main()
