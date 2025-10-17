# Contributing Guide

## Getting Started
1. **Fork & Clone**: Fork the repository and clone your fork locally.
2. **Create a branch**: Use a descriptive branch name (e.g., `feature/add-history-export` or `fix/backend-response-format`).
3. **Install tooling**:
   - Backend: Python 3.10, virtual environment, `pip install -r MLbackend/requirements.txt`.
   - Frontend: Node.js 18+, `npm install` inside `Frontend/`.
4. **Model assets**: Ensure `MLbackend/model2.h5` and `MLbackend/best.pt` exist before running the API.

## Development Workflow
1. **Sync upstream**: `git fetch upstream` and `git rebase upstream/main` to stay current.
2. **Backend changes**:
   - Keep FastAPI endpoints under `MLbackend/main.py` modular.
   - Follow existing preprocessing/postprocessing functions for new pipelines.
   - Avoid committing model binaries larger than necessary; prefer download scripts if distribution is required.
3. **Frontend changes**:
   - Follow existing functional component patterns and Tailwind utility classes.
   - Keep Firebase interactions centralized in `src/firebase.js` and guard secret usage with environment variables (`import.meta.env`).
4. **Documentation**:
   - Update `README.md` and relevant sections when behavior, setup, or architecture changes.
   - Include screenshots or diagrams only if stored in version control friendly formats.

## Coding Standards
- **Python**: Adhere to PEP 8 spacing, use explicit imports, and avoid global mutable state where possible.
- **JavaScript/React**: Prefer functional components, hooks, and consistent ESLint formatting (run `npm run lint`).
- **Error handling**: Surface meaningful messages rather than generic `Exception` types; log sensitive data responsibly.
- **Secrets**: Never hard-code Firebase keys, JWT secrets, or credentials—use environment variables.

## Testing & Validation
1. **Frontend**: Run `npm run lint` before committing.
2. **Backend**: Manually hit endpoints (e.g., `curl` or Postman) to validate responses; add automated tests when frameworks are introduced.
3. **Integration**: Ensure the frontend and backend contracts align (payload schema, response type). Update both sides or document deviations.

## Commit & PR Guidelines
1. **Commits**: Keep commits focused; use imperative subject lines (e.g., `Align backend response with frontend expectations`).
2. **PR checklist**:
   - Describe the problem and solution succinctly.
   - Reference related issues or tickets.
   - Attach screenshots or API samples when UI/API changes occur.
   - Confirm linting/tests were executed.
3. **Reviews**: Address reviewer feedback promptly; prefer follow-up commits over force-push once reviews begin unless requested.

## Reporting Issues
1. Search existing issues before opening a new one.
2. Include:
   - **Environment**: OS, Python/Node versions, hardware notes (especially for GPU-related issues).
   - **Steps to reproduce**.
   - **Expected vs actual behavior**.
   - Logs, stack traces, or screenshots as applicable.

## Community Conduct
- Be respectful and constructive in discussions and code reviews.
- Collaborate transparently, document significant decisions, and seek consensus on architectural shifts.

Thank you for contributing to OceanSight!