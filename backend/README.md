# backend

At start to run the backend server, make sure you have [bun](https://bun.sh/) installed. You can install bun using the following command:

```bash
curl -fsSL https://bun.sh/install | bash
```

To check if bun is installed correctly, run:

```bash
bun --version
```


To install dependencies:

```bash
bun install
```

To set up the database, run the following commands:

```bash
bun run db:generate
````

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
