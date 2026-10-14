#!/bin/sh
set -eu

PGDATA="${PGDATA:-/var/lib/postgresql/data}"
export DATABASE_URL="${DATABASE_URL:-postgresql://maketar:maketar@127.0.0.1:5432/maketar}"
export PGDATA

mkdir -p "$PGDATA" /run/postgresql
chown -R postgres:postgres "$PGDATA" /run/postgresql

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  printf '%s\n' maketar > /tmp/maketar-pgpass
  chown postgres:postgres /tmp/maketar-pgpass
  chmod 600 /tmp/maketar-pgpass
  su-exec postgres initdb -D "$PGDATA" -U maketar --pwfile=/tmp/maketar-pgpass --auth=trust
  rm -f /tmp/maketar-pgpass
fi

if ! su-exec postgres pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  su-exec postgres pg_ctl -D "$PGDATA" -w -l /tmp/maketar-postgres.log start
fi

node_pid=""
stop_services() {
  if [ -n "$node_pid" ]; then
    kill "$node_pid" 2>/dev/null || true
    wait "$node_pid" 2>/dev/null || true
    node_pid=""
  fi
  su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop || true
}
trap stop_services TERM INT

if ! npx prisma db push; then
  stop_services
  exit 1
fi

su-exec nextjs node server.js &
node_pid=$!
wait "$node_pid"
stop_services
