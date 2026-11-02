# Contributing to STUDYAI

Thank you for your interest in contributing to **STUDYAI — Complete AI-Powered Learning Ecosystem**! We welcome contributions from developers, educators, researchers, and designers around the world.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors, regardless of experience level, gender identity and expression, sexual orientation, disability, personal appearance, race, ethnicity, age, religion, or nationality.

- Treat everyone with respect and empathy.
- Focus on what is best for learners and the educational community.
- Gracefully accept constructive criticism.

---

## How Can You Contribute?

1. **Reporting Bugs**: Check the [GitHub Issues](https://github.com/aitutor5566-maker/STUDYAI/issues) page to see if your issue has already been reported. If not, open a new issue with detailed reproduction steps, system details, and screenshots/logs.
2. **Suggesting Enhancements**: Propose new 3D models, educational simulations, or curriculum topic blueprints through GitHub Issues.
3. **Submitting Pull Requests**: Submit fixes, improvements, or new features following our development workflow.
4. **Improving Documentation**: Fix typos, add explanations, or contribute translation support.

---

## Development Setup

### Prerequisites
- **Node.js**: v20+ (v22+ recommended)
- **Python**: v3.11+
- **Flutter**: v3.24+ (for mobile & desktop builds)

### 1. Clone the Repository
```bash
git clone https://github.com/aitutor5566-maker/STUDYAI.git
cd STUDYAI
```

### 2. Install Dependencies
```bash
# Node dependencies
npm install

# Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # or install fastapi uvicorn pydantic
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Never commit your `.env` file or sensitive API keys.

### 4. Running the Development Stack
```bash
npm run dev
```
This concurrently starts:
- **FastAPI Backend**: `http://localhost:8000`
- **Node API Gateway**: `http://localhost:3001`
- **Vite React Web App**: `http://localhost:5173`

---

## Testing & Quality Assurance

Before submitting a Pull Request, verify that all tests pass:

```bash
# Run Node.js unit tests
npm test

# Run full system integration test battery
node tests/verify_master_prompt_3_full_integration.mjs

# Run Visual AI Tutor acceptance tests
node tests/verify_visual_tutor_acceptance.mjs
```

---

## Pull Request Guidelines

1. **Create a Topic Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Changes**: Use clear, conventional commit messages:
   - `feat: add new Three.js plant cell simulation`
   - `fix: resolve timer synchronization in examination modal`
   - `docs: update setup guide for Linux environments`
3. **Keep PRs Focused**: Avoid giant pull requests mixing multiple unrelated features.
4. **Verify Clean Builds**: Ensure `npx tsc --noEmit` and `npm run build` succeed with zero errors.
5. **Open a Pull Request**: Submit your PR against the `main` branch with a clear summary of changes.

---

## License

By contributing to STUDYAI, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
