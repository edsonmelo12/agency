# Container auto-setup helper

`auto-setup.sh` lives here. It keeps watching for a Docker container whose name matches a configurable pattern and runs the `node dist/index.js setup` command (or any command you pass) as soon as that container becomes healthy.

## Quick start

1. From the VPS host, run:
   ```
   scripts/container-setup/auto-setup.sh --service burzo --command "node dist/index.js setup"
   ```
   Adjust `--service` if your container’s name differs. Use the `--run-once` flag if you want the script to exit after the first successful setup run.
2. Make sure the host user has permission to run Docker commands.
3. Keep the process running (or supervise it with `systemd`/`supervisor`) so it can react every time the container restarts.

## Configuration

| Environment variable | Default | Description |
| -------------------- | ------- | ----------- |
| `SERVICE_PATTERN` | `burzo` | Docker container name or substring to match. |
| `SETUP_CMD`       | `node dist/index.js setup` | Command executed inside the container. |
| `CHECK_INTERVAL`  | `1` | Polling interval in seconds between container checks. |
| `TIMEOUT`         | `0` | How long (seconds) to wait for the first container before exiting. `0` = wait forever. |
| `RUN_ONCE`        | `false` | Set to `true` to exit after the setup command succeeds once. |

## Example via environment variables

```
SERVICE_PATTERN=moltbot-frontend SETUP_CMD="npm run start" RUN_ONCE=true \
  scripts/container-setup/auto-setup.sh
```

## Notes

- The script stores the last container ID it updated in `.last-setup-container` inside this folder so it can re-run the setup if the container restarts.
- It prints the last 20 lines of container logs before executing the setup command to help you see why the container is crashing.
- You can extend this script by wrapping it in a `systemd` service/unit or by exporting the environment variables that make sense for your deployment.
