# Implementation Plan: Layout Navigation Overhaul

## Overview

This plan implements the SmartInvest layout overhaul by removing the global Header, consolidating controls into the Sidebar, introducing a Floating AI Button, and adding an Analysis Modal. Tasks are ordered to build incrementally: structural changes first, then new components, then wiring and integration.

## Tasks

- [x] 1. Remove Header and restructure App layout
  - [x] 1.1 Remove Header component from App.jsx
    - Remove the `Header` import from `App.jsx`
    - Remove the fixed-position wrapper `<div>` containing `<Header />`
    - Change main content padding from `pt-24` to `pt-8` (uniform padding)
    - Add new state variables: `analysisCompleted` (boolean, default false), `isAnalysisModalOpen` (boolean, default false), `isLoggedIn` (boolean, default true), `user` object
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 1.2 Set up testing framework with Vitest and fast-check
    - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `fast-check` as dev dependencies
    - Add `test` script to `package.json` (`vitest --run`)
    - Configure Vitest in `vite.config.js` with jsdom environment
    - _Requirements: (infrastructure for all test tasks)_

- [x] 2. Enhance Sidebar with relocated user controls
  - [x] 2.1 Modify Sidebar to accept new props and add bottom section structure
    - Add new props: `isLoggedIn`, `user`, `onLoginClick`, `isCollapsed` (derived from `isOpen`)
    - Add a bottom section to the full sidebar using `justify-between` flex layout
    - Ensure minimum 24px gap between navigation links and bottom section (`gap-6`)
    - _Requirements: 2.1, 2.2, 2.6_

  - [x] 2.2 Integrate NotificationMenu into Sidebar bottom section
    - Import `NotificationMenu` into `Sidebar.jsx`
    - Render `NotificationMenu` above `ProfileMenu` in the bottom section
    - Pass `isCollapsed` prop to `NotificationMenu`
    - Ensure notification panel renders as overlay/dropdown adjacent to icon
    - _Requirements: 2.2, 2.5, 2.7_

  - [x] 2.3 Enhance ProfileMenu component for Sidebar integration
    - Update `ProfileMenu.jsx` to accept props: `isLoggedIn`, `user`, `onLoginClick`, `isCollapsed`
    - Render avatar + name when logged in, Login button when logged out
    - In collapsed mode: show profile avatar icon only
    - Add dropdown/overlay for profile actions on click
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.8_

  - [x] 2.4 Update Mini Sidebar with notification and profile icons
    - Add notification icon and profile avatar icon to the bottom of the Mini Sidebar section
    - Position both below navigation menu icons
    - Ensure click handlers open respective overlays
    - _Requirements: 2.5_

  - [ ]* 2.5 Write unit tests for Sidebar enhancements
    - Test correct rendering of NotificationMenu and ProfileMenu in bottom section
    - Test logged-in vs logged-out states
    - Test collapsed mode icon rendering
    - Test 24px minimum gap between sections
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Checkpoint - Ensure layout restructuring works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create validation utility and FloatingAIButton component
  - [x] 4.1 Create validateAnalysisForm utility function
    - Create `src/utils/validateAnalysisForm.js`
    - Implement validation: method required, targetIndex required, periodStart required, periodEnd required and ≥ periodStart, capitalAllocation required and in range [1, 999,999,999,999]
    - Return `{ isValid, errors }` object with field-specific error messages
    - _Requirements: 4.3_

  - [ ]* 4.2 Write property test for form validation (Property 2)
    - **Property 2: Invalid form data prevents submission**
    - Generate random invalid form states (missing fields, end date < start date, capital out of range)
    - Assert `validateAnalysisForm` returns `isValid: false` with at least one error
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 4.3**

  - [ ]* 4.3 Write property test for valid form acceptance (Property 3 - validation part)
    - **Property 3: Valid form data triggers complete submission workflow (validation portion)**
    - Generate random valid form states (valid method, index, valid date range, capital in [1, 999,999,999,999])
    - Assert `validateAnalysisForm` returns `isValid: true` with no errors
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 3.4, 4.4**

  - [x] 4.4 Create FloatingAIButton component
    - Create `src/components/ui/FloatingAIButton.jsx`
    - Fixed position: top-right, 16–24px from edges
    - Display AI chip SVG icon (reuse from AnalysisPage)
    - Minimum size: 44×44px tap target
    - Box-shadow for floating effect, z-index: 50
    - Hover: scale(1.05–1.1) with 150–200ms transition
    - Accept `onClick` prop
    - _Requirements: 3.6, 5.1, 5.2, 5.4_

  - [ ]* 4.5 Write unit tests for FloatingAIButton
    - Test visibility when `analysisCompleted` is true vs false
    - Test fixed positioning and minimum size (44×44px)
    - Test hover scale transform classes
    - Test onClick handler fires correctly
    - _Requirements: 3.6, 5.1, 5.2, 5.4_

- [x] 5. Create AnalysisModal component
  - [x] 5.1 Implement AnalysisModal UI and form
    - Create `src/components/features/analysis/AnalysisModal.jsx`
    - Accept props: `isOpen`, `onClose`, `onAnalysisComplete`
    - Centered overlay with `backdrop-blur-md` (4–8px blur)
    - Fade-in animation (200–300ms)
    - Form fields: Method (select), Target Index (select), Period (start/end date inputs), Capital Allocation (numeric input)
    - Cancel button and backdrop click close modal
    - _Requirements: 4.1, 4.2, 4.6, 5.3, 5.5_

  - [x] 5.2 Implement AnalysisModal form validation and submission logic
    - Integrate `validateAnalysisForm` utility for client-side validation
    - Show field-level error messages on invalid submission
    - On valid submit: show loading indicator, disable form, call backend API
    - On success (2xx): call `onAnalysisComplete()`, close modal
    - On error/timeout (30s): keep modal open, show error banner, preserve form values
    - Prevent double-submit via loading state
    - _Requirements: 4.3, 4.4, 4.5, 4.7_

  - [ ]* 5.3 Write unit tests for AnalysisModal
    - Test modal opens/closes correctly
    - Test all form fields are present and required
    - Test validation error display on invalid submission
    - Test loading state disables inputs
    - Test backdrop blur and fade-in animation classes
    - _Requirements: 4.1, 4.2, 4.3, 5.3, 5.5_

- [x] 6. Wire components together in App.jsx
  - [x] 6.1 Integrate FloatingAIButton and AnalysisModal into App.jsx
    - Import `FloatingAIButton` and `AnalysisModal`
    - Conditionally render `FloatingAIButton` when `analysisCompleted === true`
    - Render `AnalysisModal` controlled by `isAnalysisModalOpen` state
    - Pass `onClick` to FloatingAIButton to open modal
    - Pass `onClose` and `onAnalysisComplete` to AnalysisModal
    - On `onAnalysisComplete`: set `analysisCompleted = true`, close modal
    - Pass updated props to Sidebar: `isLoggedIn`, `user`, `onLoginClick`
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.8, 4.1_

  - [x] 6.2 Update AnalysisPage to trigger first analysis flow
    - Add in-page AI chip button on AnalysisPage (visible when `analysisCompleted === false`)
    - On click: open AnalysisModal (or trigger analysis inline)
    - On successful analysis: set `analysisCompleted = true` via prop/callback from App
    - On error: display error message, keep flag unchanged
    - _Requirements: 3.3, 3.4, 3.5, 3.9_

  - [ ]* 6.3 Write property test for error response preserving flag (Property 1)
    - **Property 1: Error responses preserve analysis-completed flag**
    - Generate random error types (HTTP 4xx, 5xx, network errors, timeouts)
    - Assert `analysisCompleted` flag remains unchanged after error
    - Use `fast-check` with minimum 100 iterations
    - **Validates: Requirements 3.5**

  - [ ]* 6.4 Write integration tests for full analysis flow
    - Test: open modal → fill valid form → mock success → verify flag set + modal closed
    - Test: open modal → fill valid form → mock failure → verify modal stays open with values
    - Test: FAB persists across route navigation without re-mounting
    - Test: browser refresh resets `analysisCompleted` to false
    - _Requirements: 3.4, 3.5, 3.8, 3.9, 4.4, 4.5_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses React 19, React Router v7, Tailwind CSS v4, and Vite 8
- `fast-check` is used for property-based testing; `vitest` + `@testing-library/react` for unit/integration tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "4.1", "4.4"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.2", "4.3", "4.5"] },
    { "id": 3, "tasks": ["2.4", "5.1"] },
    { "id": 4, "tasks": ["2.5", "5.2"] },
    { "id": 5, "tasks": ["5.3", "6.1"] },
    { "id": 6, "tasks": ["6.2"] },
    { "id": 7, "tasks": ["6.3", "6.4"] }
  ]
}
```
