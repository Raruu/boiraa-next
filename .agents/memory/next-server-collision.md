# Next-server collision on a shared machine

- **Decision:** Never kill Next processes by name. Target this project's dev
  server via `.next/dev/lock` (Next 16 writes `{pid, port, hostname, appUrl}`
  there), or by the port it actually listens on.
- **Why:** Two `next-server` processes can share one machine — an unrelated app
  on port 20128 and this project's dev server on port 3000. `pkill -f next` /
  `pkill -f next-server` matches both, so a routine dev-server restart silently
  takes down the unrelated app. Observed live: two concurrent `next-server`
  processes, v16.3.3 on :20128 and v16.3.8 on :3000.
- **Impact:** Read `.next/dev/lock` → `pid` for this project. If a kill is
  needed, kill that PID or the process listening on this project's port. Never
  a name pattern. Leave the app on :20128 alone.
  These commands assume Linux (`pkill`, `ss`). On macOS use
  `lsof -nP -iTCP:<port> -sTCP:LISTEN`; on Windows use
  `netstat -ano | findstr :<port>` and `taskkill /PID <pid> /F`.
  `.next/dev/lock` itself is portable across all three.
