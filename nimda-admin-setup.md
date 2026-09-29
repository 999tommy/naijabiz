# Qriblo admin setup

`/nimda` uses the two approved admin email addresses in server code. It does not use Supabase account passwords. The shared admin password is read only from the server environment and must never be added to source files or a `NEXT_PUBLIC_` variable.

## Required server environment

Set these in local `.env.local` and in the production host’s encrypted environment settings:

- `NIMDA_ADMIN_PASSWORD` — the shared password supplied by the owner (minimum 8 characters).
- `NIMDA_SESSION_SECRET` — a random secret of at least 32 characters (generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`).

Restart/redeploy after setting them. Without both values, access fails closed. The password is checked only on the server.

## Durable lockout storage

Run `nimda-admin-access.sql` once in the Supabase SQL Editor for the connected project. It creates a private-to-the-app lockout table with RLS enabled, no browser-role permissions, and an atomic server-only function. Three failed puzzle or password attempts lock the IP plus browser fingerprint for 24 hours.

The session cookie is HTTP-only, signed, same-site strict, and expires after 8 hours.
