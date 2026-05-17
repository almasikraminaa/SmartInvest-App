# Requirements Document

## Introduction

This feature overhauls the SmartInvest application layout and navigation system. The global Header component is removed, and all navigation and user interface elements are consolidated into the Sidebar. Additionally, a Floating AI Button is introduced as a global trigger for running portfolio analysis from any page, appearing only after the user completes their first analysis.

## Glossary

- **Sidebar**: The primary navigation component (`Sidebar.jsx`) that serves as the central hub for all navigation, user profile, and notification controls.
- **Header**: The top-bar layout component (`Header.jsx`) that is being removed from the application layout.
- **Floating_AI_Button**: A fixed-position button displaying the AI chip logo that appears globally after the first analysis is completed.
- **Analysis_Modal**: A popup overlay with configuration form (Method, Index, Period, Capital) that allows users to run a new analysis from any page.
- **NotificationMenu**: The notification icon component (`NotificationMenu.jsx`) relocated from the Header to the Sidebar bottom section.
- **ProfileMenu**: The user profile/login element relocated from the Header to the very bottom of the Sidebar.
- **App_State**: The global application state managed in `App.jsx` that tracks whether the user has completed their first analysis.
- **Mini_Sidebar**: The collapsed icon-only navigation bar (16px width) shown when the Sidebar is closed.

## Requirements

### Requirement 1: Remove Global Header

**User Story:** As a user, I want a cleaner layout without a top header bar, so that more vertical screen space is available for content.

#### Acceptance Criteria

1. THE Sidebar SHALL serve as the sole navigation and utility hub for the application, containing all navigation links and any user-facing controls (notifications, user profile) previously hosted in the Header component.
2. WHEN the application renders, THE App component SHALL NOT include the Header component or its fixed-position wrapper element in the layout DOM tree.
3. WHEN the Header is removed, THE main content area SHALL start with uniform padding on all sides (no additional top offset beyond the standard content padding of the layout), so that the top padding previously reserved for the fixed Header (96px offset) is eliminated.
4. IF the Header component is removed, THEN THE application SHALL render no elements with a fixed top-positioned bar spanning the content area above the main content region.

### Requirement 2: Relocate User Interface Elements to Sidebar

**User Story:** As a user, I want to access my profile and notifications from the Sidebar, so that all controls are centralized in one navigation area.

#### Acceptance Criteria

1. THE Sidebar SHALL display the ProfileMenu at the very bottom of the sidebar panel.
2. THE Sidebar SHALL display the NotificationMenu icon directly above the ProfileMenu element.
3. WHILE the user is logged in, THE Sidebar SHALL display the user avatar and name in the ProfileMenu position.
4. WHILE the user is not logged in, THE Sidebar SHALL display a Login button in the ProfileMenu position.
5. WHEN the Sidebar is collapsed into Mini_Sidebar mode, THE Mini_Sidebar SHALL display the notification icon above the profile avatar icon, both positioned below the navigation menu icons in the bottom section.
6. THE Sidebar SHALL separate the navigation menu section from the bottom user interface section with a minimum of 24px of vertical spacing.
7. WHEN the user clicks the NotificationMenu icon in the Sidebar or Mini_Sidebar, THE Sidebar SHALL display the notification panel as an overlay or dropdown adjacent to the icon.
8. WHEN the user clicks the ProfileMenu in the Sidebar or Mini_Sidebar, THE Sidebar SHALL display the profile actions menu as an overlay or dropdown adjacent to the element.

### Requirement 3: Floating AI Button Appearance Logic

**User Story:** As a user, I want the AI analysis button to appear globally after my first analysis, so that I can quickly run new analyses from any page.

#### Acceptance Criteria

1. THE App_State SHALL maintain a boolean flag indicating whether the user has completed at least one analysis session, initialized to false on application load.
2. WHILE the analysis-completed flag is false, THE Floating_AI_Button SHALL NOT be rendered on any page other than the Analysis page.
3. WHILE the analysis-completed flag is false, THE AnalysisPage SHALL display the AI chip logo as a static in-page button (minimum tap target of 44×44 CSS pixels) to initiate the configuration modal.
4. WHEN the analysis backend returns a successful response (HTTP 2xx with valid result data), THE App_State SHALL set the analysis-completed flag to true.
5. IF the analysis backend returns an error or the request times out within 30 seconds, THEN THE App_State SHALL keep the analysis-completed flag unchanged and THE AnalysisPage SHALL display an error message indicating the analysis failed.
6. WHEN the analysis-completed flag becomes true, THE Floating_AI_Button SHALL appear at the top-right corner of the viewport with a fixed position, rendered above all page content, with a minimum tap target of 44×44 CSS pixels.
7. WHEN the user clicks the Floating_AI_Button, THE system SHALL open the analysis configuration modal, pre-filled with default parameter values.
8. THE Floating_AI_Button SHALL persist across page navigation without re-mounting, as long as the analysis-completed flag remains true.
9. WHEN the browser tab is refreshed, THE App_State SHALL reset the analysis-completed flag to false, hiding the Floating_AI_Button until a new analysis completes successfully.

### Requirement 4: Floating AI Button Anywhere Analysis Function

**User Story:** As a user, I want to run a new analysis from any page by clicking the floating AI button, so that I do not need to navigate away from my current page.

#### Acceptance Criteria

1. WHEN the user clicks the Floating_AI_Button, THE Application SHALL display the Analysis_Modal as a centered overlay on the current page with a semi-transparent backdrop obscuring the background content.
2. THE Analysis_Modal SHALL contain the following required configuration fields: Method (selection from available methods), Target Index (selection from available indices), Period (start date and end date), and Capital Allocation (numeric input in Rp with a minimum value of 1 and a maximum value of 999,999,999,999).
3. IF the user submits the Analysis_Modal form with any required field left empty or with an invalid value (end date before start date, or Capital Allocation outside the allowed range), THEN THE Application SHALL prevent submission and display an error indication next to each invalid field.
4. WHEN the user submits the Analysis_Modal form with all fields valid, THE Application SHALL display a loading indicator within the modal, execute the analysis, close the modal within 2 seconds of receiving the analysis result, and navigate the user to the Analysis results view.
5. IF the analysis execution fails after form submission, THEN THE Application SHALL close the loading indicator, keep the Analysis_Modal open with the user's entered values preserved, and display an error message indicating the failure reason.
6. WHEN the user clicks the Cancel button or the backdrop area, THE Analysis_Modal SHALL close without executing any analysis and without modifying any previously entered data on the current page.
7. WHILE the Analysis_Modal is open, THE Application SHALL remain on the current page route without navigating away.
8. THE Floating_AI_Button SHALL be visible on every page of the Application in a fixed position at the top-right corner of the viewport, remaining accessible regardless of scroll position.

### Requirement 5: Visual Feedback and UX Enhancements

**User Story:** As a user, I want clear visual cues that the AI button is floating and the modal is focused, so that the interface feels polished and intuitive.

#### Acceptance Criteria

1. THE Floating_AI_Button SHALL display the existing AI chip logo with a box-shadow effect and a z-index that positions it visually above all page content.
2. THE Floating_AI_Button SHALL use a fixed CSS position at the top-right corner of the viewport with a margin of 16px to 24px from the top and right edges.
3. WHEN the Analysis_Modal is open, THE Application SHALL apply a backdrop-blur effect with a blur radius between 4px and 8px to the content behind the modal overlay.
4. WHEN the user hovers over the Floating_AI_Button, THE Floating_AI_Button SHALL increase its scale by a factor between 1.05 and 1.1 with a transition duration between 150ms and 200ms.
5. THE Analysis_Modal SHALL animate its appearance with a fade-in transition lasting between 200ms and 300ms.
