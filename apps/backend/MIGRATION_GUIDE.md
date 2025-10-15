# Migration Guide

### Quick Commands

**Generate a new migration after changing entities:**

```bash
pnpm migration:generate -- src/database/migrations/YourMigrationName

cd apps/backend
pnpm run migration:generate -- src/database/migrations/YourMigrationName

cd apps/backend
pnpm build
pnpm exec typeorm migration:generate src/database/migrations/YourMigrationName -d dist/migration.config.js
```

**Run pending migrations:**

```bash
# From repo root
pnpm migration:run

# From backend directory
pnpm run migration:run

# Direct TypeORM command
pnpm exec typeorm migration:run -d dist/migration.config.js
```

**Revert last migration:**

```bash
pnpm migration:revert
# or
pnpm exec typeorm migration:revert -d dist/migration.config.js
```

**Show migration status:**

```bash
pnpm exec typeorm migration:show -d dist/migration.config.js
```

**Create empty migration (for manual SQL):**

```bash
pnpm exec typeorm migration:create src/database/migrations/YourManualMigration
```
