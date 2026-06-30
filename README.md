<p align="center">
  <img src="https://skalfa.sejedigital.com/images/logo-skalfa.png" alt="Skalfa Logo" width="300" />
</p>

# @skalfa/skalfa-component

> Core reusable UI component library for Skalfa Next.js applications.

---

## About this Package

This package is part of the **Skalfa Framework**, a premium development ecosystem designed to build high-performance, modular web applications and APIs.

It ships a complete set of production-ready React components — inputs, tables, modals, navigation, typography, and more — all designed to integrate seamlessly with the Skalfa App template.

### Usage Scope & Standalone Status
> 🔒 **Skalfa Ecosystem Integration:** This package is designed to run **integrated within the Skalfa ecosystem** (such as Skalfa App). It relies on the global service registry and core framework abstractions (`@skalfa/skalfa-app-core`) to operate.

---

## Documentation

See the usage documentation at [Documentation](https://skalfa.sejedigital.com).

---

## Installation

You can install this package using your preferred package manager:

```bash
# Using npm
npm install @skalfa/skalfa-component

# Using bun
bun add @skalfa/skalfa-component
```

---

## Picking & Customizing Components

The Skalfa CLI allows you to eject any component into your local project for full customization:

```bash
# Copy a component (overrides the core version)
skalfa pick Button

# Copy and rename a component (creates a new custom variant)
skalfa pick Button MyCustomButton
```

This will copy the component source into your `components/` directory and register the local override automatically in `components/index.ts`.

---

## Pre-installed Dependencies

The following key dependencies are packaged and managed within this project:

| Dependency | Scope | Version |
| :--- | :--- | :--- |
| `@skalfa/skalfa-app-core` | peer / runtime | `^1.0.0` |
| `next` | peer / runtime | `^15.0.0` |
| `react` | peer / runtime | `^19.0.0` |
| `react-dom` | peer / runtime | `^19.0.0` |
| `@fortawesome/react-fontawesome` | peer / runtime | `^0.2.2` |
| `@react-google-maps/api` | development | `^2.20.7` |
| `@types/node` | development | `^20.0.0` |
| `@types/react` | development | `^19.0.0` |
| `@types/react-dom` | development | `^19.0.0` |
| `typescript` | development | `^6.0.3` |

---

## License

This package is licensed under the **MIT License**. For full license text, see the [LICENSE](LICENSE) file.
