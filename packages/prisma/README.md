# Prisma Package

This package provides a Prisma client for database access throughout the application.

## Setup

1. Make sure you have the proper PostgreSQL connection string in your `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

2. Generate the Prisma client:

```bash
cd packages/prisma
bun prisma generate
```

3. Push schema changes to the database:

```bash
cd packages/prisma
bun prisma db push
```

## Usage

Import the Prisma client in your code:

```typescript
import { prisma } from '@repo/prisma';

// Example: Create a new feedback entry
async function createFeedback(userId: string, userEmail: string, feedback: string) {
    return await prisma.feedback.create({
        data: {
            userId,
            userEmail,
            feedback,
        },
    });
}

// Example: Get all feedback entries
async function getAllFeedback() {
    return await prisma.feedback.findMany();
}
```

## Schema Changes

When you modify the schema.prisma file, you need to:

1. Generate the client again:

```bash
bun prisma generate
```

2. Push the changes to the database:

```bash
bun prisma db push
```

Or, for migrations in production environments:

```bash
bun prisma migrate dev --name description_of_changes
```
