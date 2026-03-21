# Portal Interface Notes

- **Login reference:** still-7a2da171531f25a079b87b3221cbb26b.webp shows the Employer Medical Portal style we matched: split light/dark hero with feature list, rounded form, trust badges, gradient background. The login page now mirrors that structure while keeping the API endpoint, state handling, and form logic untouched.
- **Client portal reference:** original-517399d3fa10c919297de03b253d3678.webp inspired the new expandable workspace. The left column now holds actionable navigation, future feature placeholders, and a gradient shell; the right column focuses on billing cards, history, and savings metrics while remaining mobile-friendly via responsive grids.
- **Savings messaging:** we continue deriving cumulative savings via Stripe pricing (monthly discount times paid invoices) and surface both the total-to-date badge plus a 12-month projection in the sticky header for founder perception.
- **Mobile adjustments:** both login and billing layouts collapse into single-column flows below 1080px (login) or 980px (portal), hiding decorative nav links and reflowing nav/history sections for phones.
- **Future work:** add more cards to the left feature column and real data to the right dashboard panel; keep updating `portal-interface-notes.md` as new references arrive.
