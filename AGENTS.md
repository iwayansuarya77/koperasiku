# Project Guidance

## User Preferences

- Aplikasi koperasi lengkap dengan database
- Responsive di HP
- Fokus pada fungsi inti tanpa validasi rumit

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- The seeded default admin is admin/admin123 and the seeded Kas account code is "100"; other seeded COA codes are 200/300/400/500.
- Savings deposits/withdrawals and loan installments post balanced journals using the seeded COA codes.
- Layout NAV_ITEMS must include every intended route, including /users (admin) and /change-password (all roles).
- The frontend test setup must be included in tsconfig so jest-dom matchers typecheck.
- Motoko has no triple-quoted text literals; author multi-line text with escaped newlines.
