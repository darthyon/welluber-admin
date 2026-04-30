# WellUber Admin Console

Precision infrastructure for corporate wellness management. Built with Next.js, shadcn/ui, and Framer Motion.

## 🎨 Design System

This project follows a **"Precision Infrastructure"** aesthetic — inspired by Linear and Vercel. 

- **Primary Source of Truth**: [`AGENTS.md`](AGENTS.md)
- **Design Detail**: [`docs/design.md`](docs/design.md)
- **Typography**: Geist Variable (Strict no-bold policy, use Semibold 600)
- **Color**: OKLCH-based theme with deep indigo brand accent (`#4338CA`)
- **Radius**: Pill-shaped triggers (`rounded-4xl`), card-shaped surfaces (`rounded-lg`)

## 🛠 Adding Components

To add shadcn components:
```bash
npx shadcn@latest add [component]
```

## 🧩 Shared Patterns

We use several custom shared patterns for consistency:
- **Quiet Success**: `SuccessModal` for administrative feedback.
- **Form Layouts**: `TwoColumnDetailLayout` + `FloatingAnchorNav` for multi-section forms.
- **Controls**: `PhoneInput` (International), `LocationPicker`, `ServiceToggleCard`.

Refer to [docs/design.md](docs/design.md) for detailed usage guidelines and semantic conventions.
