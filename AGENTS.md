# Node.js Best Practices for this Project

This section outlines the recommended best practices for Node.js development within this project.

## 1. Package Manager

Use `npm` for managing dependencies. The `package-lock.json` file ensures that the dependency tree is consistent across all environments.

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Add a new dependency:**
    ```bash
    npm install <package-name>
    ```
*   **Add a new development dependency:**
    ```bash
    npm install <package-name> --save-dev
    ```

## 2. Testing

This project uses `vitest` for testing.

*   **Run tests:**
    ```bash
    npm test
    ```
*   Write tests for all new features and bug fixes.
*   Test files should be located alongside the source files with a `.test.js` extension.

## 3. Linting and Formatting

Consistent code style is crucial for readability and maintainability. This project should use `ESLint` for linting and `Prettier` for formatting.

*   **Installation:**
    ```bash
    npm install eslint prettier eslint-config-prettier eslint-plugin-prettier --save-dev
    ```
*   **Configuration:** Create `.eslintrc.cjs` and `.prettierrc.json` files.
*   **Run linting:**
    ```bash
    npx eslint .
    ```
*   **Run formatting:**
    ```bash
    npx prettier --write .
    ```

## 4. Security

Regularly check for vulnerabilities in your dependencies.

*   **Run a security audit:**
    ```bash
    npm audit
    ```
*   **Fix vulnerabilities:**
    ```bash
    npm audit fix
    ```

## 5. Development and Build

This project uses `Vite` for the development server and build process.

*   **Start the development server:**
    ```bash
    npm run dev
    ```
*   **Build for production:**
    ```bash
    npm run build
    ```

## 6. ES Modules

This project uses ES Modules (`"type": "module"` in `package.json`). Use `import` and `export` statements.