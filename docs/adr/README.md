# Architecture decision records

Short notes on decisions that shape the codebase: the context, the choice and its cost.

| #                                        | Decision                                                    |
| ---------------------------------------- | ----------------------------------------------------------- |
| [0001](0001-fetch-client-over-axios.md)  | A small fetch-based HTTP client instead of axios            |
| [0002](0002-memory-only-access-token.md) | Access token in memory, refresh token in an httpOnly cookie |
| [0003](0003-mock-service-worker.md)      | Mock Service Worker for the demo backend and for tests      |
| [0004](0004-javascript-with-jsdoc.md)    | JavaScript with JSDoc, type-checked by vue-tsc              |
| [0005](0005-css-first-design-tokens.md)  | CSS-first design tokens with Tailwind CSS 4                 |
| [0006](0006-native-dialog-element.md)    | Native `<dialog>` for modal surfaces                        |
| [0007](0007-standard-schema-forms.md)    | `useForm` accepts any Standard Schema validator             |
| [0008](0008-error-codes-not-messages.md) | The UI branches on error codes, never on server messages    |
