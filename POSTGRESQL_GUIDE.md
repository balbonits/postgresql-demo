# PostgreSQL Interview Reference

## The 5 core statements

```sql
SELECT * FROM videos;
INSERT INTO plays (video_id, user_agent) VALUES (1, 'Mozilla');
UPDATE videos SET view_count = view_count + 1 WHERE id = 1;
DELETE FROM videos WHERE id = 1;
-- DDL (schema changes, not covered here)
```

---

## SELECT

```sql
-- All columns
SELECT * FROM videos;

-- Specific columns
SELECT id, title, view_count FROM videos;

-- With filter
SELECT * FROM videos WHERE category = 'education';

-- With sort
SELECT * FROM videos ORDER BY created_at DESC;

-- With limit
SELECT * FROM videos ORDER BY view_count DESC LIMIT 10;

-- Multiple conditions
SELECT * FROM videos WHERE category = 'education' AND view_count > 100;
```

---

## INSERT

```sql
-- Basic insert
INSERT INTO plays (video_id, user_agent) VALUES (1, 'Mozilla');

-- Insert and return the new row
INSERT INTO plays (video_id, user_agent)
VALUES (1, 'Mozilla')
RETURNING *;

-- Insert and return just the new id
INSERT INTO plays (video_id) VALUES (1) RETURNING id;
```

`RETURNING` is PostgreSQL-specific. MySQL doesn't have it. Important for interviews.

---

## UPDATE

```sql
-- Basic update
UPDATE videos SET title = 'New Title' WHERE id = 1;

-- Increment a counter (most common pattern)
UPDATE videos SET view_count = view_count + 1 WHERE id = 1;

-- Update multiple columns
UPDATE videos SET title = 'New Title', updated_at = NOW() WHERE id = 1;

-- Update and return the changed row
UPDATE videos SET view_count = view_count + 1 WHERE id = 1 RETURNING view_count;
```

**Always use WHERE on UPDATE.** Without it, every row gets updated.

---

## Aggregations

```sql
-- Count rows
SELECT COUNT(*) FROM plays;

-- Count per group
SELECT video_id, COUNT(*) AS plays FROM plays GROUP BY video_id;

-- Sum
SELECT SUM(view_count) FROM videos;

-- Filter groups (HAVING = WHERE for aggregated results)
SELECT video_id, COUNT(*) AS plays
FROM plays
GROUP BY video_id
HAVING COUNT(*) > 10;
```

---

## JOINs

```sql
-- INNER JOIN: only rows that match in both tables
SELECT v.title, COUNT(p.id) AS plays
FROM videos v
INNER JOIN plays p ON p.video_id = v.id
GROUP BY v.id, v.title;

-- LEFT JOIN: all rows from left table, nulls for non-matching right rows
-- Use this when you want videos with 0 plays included
SELECT v.title, COUNT(p.id) AS plays
FROM videos v
LEFT JOIN plays p ON p.video_id = v.id
GROUP BY v.id, v.title
ORDER BY plays DESC;
```

Rule of thumb: **use LEFT JOIN when zero should still appear in results.**

### Query anatomy — line by line

```sql
SELECT v.title, COUNT(p.id) AS plays   -- what columns to return; AS renames the output column
FROM videos v                           -- primary table; "v" is an alias (shorthand)
LEFT JOIN plays p ON p.video_id = v.id -- bring in plays table (alias "p"); ON = how to link rows
GROUP BY v.id, v.title                 -- required when using COUNT — one result row per video
ORDER BY plays DESC;                   -- sort by the renamed column, highest first
```

**Aliases** (`videos v`, `plays p`) are just shorthand. Without them you'd write `videos.title` everywhere.

**`ON` clause** — the join condition. Tells PostgreSQL which column in one table matches which column in the other.

**`GROUP BY` rule** — every column in SELECT that is NOT an aggregate (`COUNT`, `SUM`, etc.) must appear in GROUP BY. If you select `v.id, v.title, COUNT(...)`, then GROUP BY needs `v.id, v.title`.

---

## Dates and time (PostgreSQL-specific)

```sql
-- Current timestamp
SELECT NOW();

-- Truncate to day (group plays by day)
SELECT date_trunc('day', played_at) AS day, COUNT(*) AS plays
FROM plays
GROUP BY date_trunc('day', played_at)
ORDER BY day DESC;

-- Filter to last 30 days
SELECT * FROM plays WHERE played_at >= NOW() - INTERVAL '30 days';
```

`date_trunc` and `INTERVAL` are PostgreSQL-specific. Know these for analytics queries.

---

## Event log vs denormalized counter

Two ways to track how many times a video was played:

**Event log** (`plays` table — append-only):
```sql
-- Record every play as a new row
INSERT INTO plays (video_id) VALUES (1);

-- Count plays later
SELECT COUNT(*) FROM plays WHERE video_id = 1;
```
- Expensive in storage, powerful in analysis
- Can answer "how many plays on Tuesday?" or "detect abuse patterns" after the fact
- Gets slower as the table grows

**Denormalized counter** (`view_count` on `videos`):
```sql
-- Increment on every play
UPDATE videos SET view_count = view_count + 1 WHERE id = 1;

-- Read instantly
SELECT view_count FROM videos WHERE id = 1;
```
- Always fast — one column read
- Can drift if a transaction fails
- Can't reconstruct historical data

**This app uses both** — `plays` for analytics accuracy, `view_count` for fast display. The two are kept in sync via a transaction so they don't drift.

---

## Transactions

```sql
BEGIN;

INSERT INTO plays (video_id) VALUES (1);
UPDATE videos SET view_count = view_count + 1 WHERE id = 1;

COMMIT;   -- save both changes
-- or
ROLLBACK; -- undo both changes if something went wrong
```

A transaction makes multiple statements **atomic** — either all succeed or none do.

With `postgres.js`:
```ts
await sql.begin(async (sql) => {
  await sql`INSERT INTO plays (video_id) VALUES (${videoId})`;
  await sql`UPDATE videos SET view_count = view_count + 1 WHERE id = ${videoId}`;
});
```

---

### Why wrap INSERT + UPDATE in a transaction?

If the INSERT succeeds but the UPDATE fails (crash, timeout, anything), you get a play recorded but `view_count` not incremented — the database is now inconsistent. A transaction makes both succeed or both roll back. No partial state.

---

## App queries vs stored procedures

| | App queries | Stored procedures |
|---|---|---|
| Where logic lives | Your codebase (TypeScript) | Inside the database |
| Version control | Git | Harder to track |
| Testability | Easy | Harder |
| Performance | Good | Slightly faster (pre-compiled) |
| Used at | Most product apps, startups | Banks, legacy enterprise, high-volume systems |

**Default to app queries.** Stored procedures make sense when multiple apps share one database and need shared logic, or when you need maximum DB performance. For a product app (like an Apple interview project), app queries is the right answer.

`sql\`...\`` in postgres.js is **not** a stored procedure — it's a parameterized query sent from your app at runtime.

---

## Parameterized queries

Never concatenate user input into SQL. Always use parameters.

```ts
// postgres.js uses tagged template literals — safe by default
const videoId = 1;
await sql`SELECT * FROM videos WHERE id = ${videoId}`;
//                                    ^^^ this is a parameter, not string interpolation
```

The `sql` tag intercepts the template literal and sends the value as a separate parameter to PostgreSQL. SQL injection is impossible this way.

---

## Common patterns

### Top N by count
```sql
SELECT v.id, v.title, v.thumbnail_url, COUNT(p.id) AS plays
FROM videos v
LEFT JOIN plays p ON p.video_id = v.id
GROUP BY v.id, v.title, v.thumbnail_url
ORDER BY plays DESC
LIMIT 10;
```

### Daily stats for last 30 days
```sql
SELECT date_trunc('day', played_at) AS day, COUNT(*) AS plays
FROM plays
WHERE played_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

### Increment a counter safely
```sql
UPDATE videos SET view_count = view_count + 1 WHERE id = $1;
-- Not: SET view_count = (SELECT view_count FROM videos WHERE id = $1) + 1
-- The direct increment is atomic — safe under concurrent requests
```

---

## PostgreSQL vs SQL

| Feature | Standard SQL | PostgreSQL-specific |
|---|---|---|
| `date_trunc()` | No | Yes |
| `RETURNING` | No | Yes |
| `INTERVAL` | Partial | Full support |
| Arrays (`text[]`) | No | Yes |
| `NOW()` | No (`CURRENT_TIMESTAMP`) | Yes |
| Tagged template safety | N/A | via `postgres.js` |

---

## Connection pooling (for system design questions)

- A **connection pool** keeps N database connections open and reuses them
- Without it: every request opens a new connection (slow, resource-heavy)
- `max: 10` — max 10 simultaneous connections
- `idle_timeout: 20` — close connections idle for 20 seconds

PostgreSQL default max connections: 100. A pool of 10 is safe for most apps.

---

## Promises

A Promise is a box that starts empty and gets filled in the future. `await` opens the box when it's ready.

```ts
const videos = await fetchVideos(); // opens the box — gives you the array
const videos = fetchVideos();       // no await — gives you the Promise box itself
videos.map(...);                    // TypeError: videos.map is not a function
```

Forgetting `await` is a common bug — the error message won't say "you forgot await," it'll just say the method doesn't exist.

### Sequential vs parallel

```ts
// Sequential — total time = A + B (use when second call depends on first)
const video = await fetch(`/api/videos/1`).then(r => r.json());
const plays = await fetch(`/api/plays?video_id=${video.id}`).then(r => r.json());

// Parallel — total time = max(A, B) (use when calls are independent)
const [top, daily] = await Promise.all([
  fetch('/api/analytics/top').then(r => r.json()),
  fetch('/api/analytics/daily').then(r => r.json()),
]);
```

### Promise methods

| Method | Behavior |
|---|---|
| `Promise.all` | Wait for all, fail if any fails |
| `Promise.allSettled` | Wait for all, never fails — each result has `status: 'fulfilled'` or `'rejected'` |
| `Promise.race` | Resolves/rejects as soon as the first one settles |

Use `Promise.allSettled` when failures should be independent — one broken chart shouldn't take down another.

---

## async/await

```ts
// async function always returns a Promise
const fetchVideos = async () => {
  const res = await fetch('/api/videos');
  return await res.json();
};
```

| Context | Can be async? |
|---|---|
| Regular/arrow function | Yes |
| `useEffect` callback | No — wrap inside |
| Event handler | Yes |
| API route handler | Yes |

`useEffect` can't be async because React expects it to return either nothing or a cleanup function. An async function always returns a Promise.

```ts
// CORRECT pattern
useEffect(() => {
  async function load() {
    const data = await fetch('/api/videos').then(r => r.json());
    setVideos(data);
  }
  load();
}, []);
```

---

## useEffect + Promises — common issues

### 1. Race condition
Two fetches start, the slower one finishes last and overwrites the correct result.

```ts
useEffect(() => {
  let cancelled = false;

  async function load() {
    const data = await fetch(`/api/videos/${videoId}`).then(r => r.json());
    if (!cancelled) setVideo(data);
  }
  load();

  return () => { cancelled = true; }; // cleanup when videoId changes
}, [videoId]);
```

### 2. Infinite loop
Missing dependency array causes the effect to re-run after every render.

```ts
useEffect(() => { fetchVideos(); });    // runs every render — infinite loop
useEffect(() => { fetchVideos(); }, []); // runs once on mount — correct
```

### 3. Stale closure
Effect captures a variable at creation time. If the variable changes but isn't in the dependency array, the effect sees the old value.

```ts
// BUG — page is always 1 inside the effect
useEffect(() => {
  fetch(`/api/videos?page=${page}`);
}, []);

// CORRECT — re-runs when page changes
useEffect(() => {
  fetch(`/api/videos?page=${page}`);
}, [page]);
```

### 4. Unhandled rejection
Always wrap async work in `try/catch` inside `useEffect`.

---

## Closure and the cleanup flag

The `cancelled` flag works because of closure — `load` holds a **live reference** to the variable in its parent scope, not a copy.

```ts
useEffect(() => {
  let cancelled = false;       // parent scope

  async function load() {
    const data = await fetch(...);
    if (!cancelled) setVideo(data); // same variable — live reference
  }
  load();

  return () => { cancelled = true; }; // mutates the same variable
}, [videoId]);
```

When `videoId` changes:
1. React runs the cleanup — sets `cancelled = true` on the old scope
2. Creates a new scope with `cancelled = false`
3. Starts a new `load()`

The old `load()` still in flight sees `cancelled = true` through its closure and skips `setState`.

Same mechanism as stale closures — a function holds a reference to its parent scope. The difference is intent: stale closures are accidental, the cleanup flag is deliberate.
