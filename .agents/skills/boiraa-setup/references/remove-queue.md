# Removing the queue & email

Ask about this only when the user **kept** a database. If the database is gone,
the queue must go too — `QueueJob` is a Prisma model, so the queue has nothing
to write its audit rows to.

**Confirm before executing.**

## Files to delete

```
src/lib/queue-config.ts         (QUEUE_ENABLED switch)
src/lib/queue-recovery.ts       (stuck-job poller)
src/lib/worker-init.ts          (worker bootstrap)
src/lib/redis.ts                (BullMQ connection config)
src/lib/redis-kv.ts             (KV helpers)
src/server/workers/             (email worker + index)
src/server/services/queue/      (QueueService)
src/server/services/email/      (EmailService + templates)
src/server/repositories/queue/  (QueueRepository)
src/instrumentation.ts          (only boots workers — nothing else uses it)
```

## Files to edit

| File | Change |
| --- | --- |
| `src/server/services/index.ts` | Drop the `QueueService` and `EmailService` exports |
| `next.config.ts` | Remove `serverExternalPackages: ["bullmq", "ioredis", "nodemailer"]` |
| `.env.example` | Remove `QUEUE_ENABLED`, `REDIS_URL`, and the whole `SMTP_*` block |
| `prisma/schema.prisma` | Remove the `QueueJob` model, then run `npm run db:migrate` to generate the drop migration |
| `AGENTS.md` | Remove the Background Jobs section and the queue/email mentions in the stack list |
| `README.md` | Remove the Background jobs section and the BullMQ/Redis/Nodemailer rows |
| `.agents/rules/backend-architecture.md` | Remove the Background Jobs section |

## Dependencies to uninstall

```bash
npm uninstall bullmq ioredis nodemailer
npm uninstall @types/nodemailer   # only if present
```

## If the user keeps the queue

Nothing to do — `QUEUE_ENABLED=false` is already the default and opens no Redis
connection. Mention that they can turn it on later by setting the variable,
and that no infrastructure is required until then.

## Verify

```bash
grep -rn "bullmq\|ioredis\|nodemailer\|QueueService\|EmailService" \
  --include="*.ts" --include="*.tsx" src/
```

Should return nothing. Then `npm run build`, `npm test`, `npm run lint`.

## Note on `instrumentation.ts`

It exists **only** to boot the workers. If you delete the queue, delete it too —
an empty `register()` that does nothing is worse than no file, because it
suggests infrastructure that is not there.
