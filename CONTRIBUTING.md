# Contributing

1. Use Node 22.12+ (`nvm use`) and pnpm 10, then run `pnpm install`. Git hooks are installed
   automatically.
2. Create a branch, make your change and add tests next to the code (`<Name>.spec.js`).
3. Run `pnpm check` (types, lint, formatting, tests). It also runs on `git push`.
4. For changes to `packages/ui`, run `pnpm changeset` and describe the change for the changelog.
5. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)
   (`feat:`, `fix:`, `docs:` …); commitlint checks them.

## Component checklist

- [ ] `<script setup>` with JSDoc-typed props, emits and slots
- [ ] Only semantic token utilities from `theme.css` (no hex colors, no `dark:` variants)
- [ ] Keyboard support and ARIA roles follow the [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) pattern
- [ ] Visible focus via `focus-ring`; touch targets of at least 44 × 44 px
- [ ] Spec queries by role and label, covers keyboard use and calls `expectNoA11yViolations`
- [ ] Documented on the Components page (a test fails if a prop is missing from the docs)
