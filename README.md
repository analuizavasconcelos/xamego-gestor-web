# Xamego Gestor — Web

Frontend of **Xamego Gestor**, a management system developed for **Xamego Artesanal**, an artisanal frozen pizza brand. A responsive web interface used in the business's daily operations.

> API of this project: [xamego-gestor-api](https://github.com/analuizavasconcelos/xamego-gestor-api)

## About the project

The interface was designed for a non-technical user: short flows, plain-language copy instead of system jargon, immediate visual feedback for every action, and a distinct visual identity (earthy palette inspired by the brand) instead of a generic admin dashboard template.

## Features

- **Login, registration and password recovery**
- **Dashboard** with a clean, Apple-inspired summary of the day (revenue, profit, low stock, upcoming appointments)
- **Inventory**: product registration with photo, stock restocking, visual alert when an item is running low
- **Sales**: cart-style flow — add several different products to the same order, choose pickup or delivery (with automatic fee calculation by neighborhood) and payment method
- **Appointments**: calendar and list views to schedule future orders, with a detail panel that opens when a day is clicked, without affecting stock until fulfilled
- **Courier settlement**: daily closing of deliveries, fees and cash collected
- **Reports**: profit by period, best-selling products, order history with delete option

## Tech stack

- **React 18 + TypeScript**
- **Vite**
- **Tailwind CSS v4** (custom theme with the brand's color palette)
- **React Router** for navigation
- **Axios** for API communication, with an authentication token interceptor
- **Lucide React** for iconography
- Deployed via **Vercel**

## Design decisions

- **Brand palette instead of a generic theme**: colors extracted from Xamego Artesanal's visual identity (cream, brown, terracotta, sage green), applied through Tailwind design tokens (`@theme`) to keep every screen consistent.
- **A layout that truly adapts, not just resizes**: a fixed sidebar on desktop, a bottom navigation bar on mobile — two separate navigation components designed for each context, instead of a single bar that shrinks.
- **Sales flow optimized for repetition**: since placing an order is the most frequent daily action, the cart prioritizes minimal taps (visual product selection, quantity +/-, total always visible).
- **Clean, Apple-inspired dashboard cards**: large numbers as the focal point, subtle icons, generous whitespaces.

## Screenshots

<!-- Add screenshots here, e.g.:
![Dashboard](docs/screenshots/dashboard.png)
![Sales flow](docs/screenshots/sales.png)
![Appointments calendar](docs/screenshots/agendamentos.png)
-->

## Running locally

```bash
npm install
```

Create a `.env` file in the root:
```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

## Author

Built by [Ana Luiza Vasconcelos](https://github.com/analuizavasconcelos).