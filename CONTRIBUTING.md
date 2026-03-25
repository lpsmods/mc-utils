# Contributing

This project welcomes contributions and suggestions!

## Coding Style

- Use ESLint to lint.
- Use Prettier to style.

## Publishing Packages

This monorepo uses [Changesets](https://github.com/changesets/changesets) to manage package versions and publishing.

- When making changes to a package under `libraries/*`, create a changeset to track the update:

  ```sh
  npx changeset
  ```

- This ensures the version is bumped and only changed packages are published.
