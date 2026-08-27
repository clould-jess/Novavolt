# Deployment

## Recommended order

1. Create a private PostgreSQL database with backups and point-in-time recovery.
2. Create a limited application user for NovaVolt.
3. Set secrets and variables from `.env.example` in your secret manager.
4. Build the backend with the Node scripts in this repository and publish the immutable artifact.
5. Run `npm run prisma:deploy` as the single migration step.
6. Deploy the API behind TLS and use `/api/v1/health/ready` as the readiness probe.
7. Test signup, notifications, file uploads, malware checks, and a Stripe test payment.

Generate `NOTIFICATION_PAYLOAD_ENCRYPTION_KEY` with `openssl rand -hex 32`.

Do not run multiple migration tasks at the same time. Keep at least one verified backup before any future destructive migration.

## Database

The initial migration enables the required PostgreSQL constraints for the rental workflow. The migration user must be allowed to create the required extension. The runtime user does not need schema-creation privileges.

Audit logs are protected by a trigger that blocks updates and deletes. Plan a retention policy before the table grows large.

## Private storage

- use a private, encrypted, versioned bucket;
- prefer workload IAM credentials over static keys;
- restrict access to the configured bucket and prefix;
- configure storage CORS only for the required web origin;
- call the malware-scan webhook after each upload;
- document retention and deletion policies.

## Stripe

Configure the webhook on:

```text
POST https://<api>/api/v1/payments/webhooks/stripe
```

Supported events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`, and `charge.refunded`.

## Shutdown and rollback

The application handles `SIGTERM` with Nest shutdown hooks. If you roll back, only use an older release when its schema is still compatible with the already-applied migration. Fix a published migration with a new migration; do not edit a migration file that has already run in production.

## Minimum observability

- centralize structured HTTP logs;
- alert on `/health/ready` failures, 5xx responses, and webhook errors;
- monitor `FAILED` notifications, `ERROR` documents, `OVERDUE` invoices, and `OVERDUE` rentals;
- never log JWTs, secrets, full Stripe payloads, or presigned URLs.
