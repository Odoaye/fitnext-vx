---
name: Tailwind CSS texture safety
description: A build-compatibility note for subtle grain/noise treatments in Tailwind v4 CSS.
---

When adding subtle grain or noise treatments to a Tailwind v4 stylesheet, prefer CSS-only gradients or a separate static asset over inline SVG data URIs inside `@layer` rules.

**Why:** Tailwind v4's CSS parser can reject certain quoted data-URI declarations as unterminated strings, which prevents the entire stylesheet from compiling and leaves the app blank.

**How to apply:** Keep decorative texture declarations simple and parser-safe; validate the app through the managed preview after any theme change.