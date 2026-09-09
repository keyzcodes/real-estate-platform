# ADR-009 — Frontend Visual Design System

## Status

Accepted

## Date

2 September 2026

## Decision Owner

Sunday Jime

## Context

Sprint 3 introduces the first public-facing property catalogue interface.

The frontend requires a consistent visual system that communicates:

- Professionalism
- Trust
- Transparency
- Security
- Maturity
- Clear information hierarchy
- Accessibility
- Responsive behaviour

The interface should achieve the usability standard of established discovery platforms such as Yelp without copying their branding, layouts or product identity.

Kudu must retain its own focus on verified rental properties, transparent pricing and protected locations.

## Decision

The Kudu frontend will use:

1. Tailwind CSS v4 as the primary styling system.
2. A limited amount of normal CSS for global and complex rules.
3. Motion for React for purposeful state and layout animations.
4. Two primary brand colours.
5. Functional neutral colours for text, borders and surfaces.
6. A mobile-first responsive approach.
7. Accessible contrast, focus and reduced-motion behaviour.
8. An information-first visual hierarchy.

## Styling Architecture

### Tailwind CSS

Tailwind CSS will handle:

- Responsive layouts
- Flexbox and grid
- Component spacing
- Component typography
- Width and height
- Borders and radius
- Hover states
- Focus states
- Disabled states
- Simple transitions
- Responsive visibility

Tailwind is appropriate because:

- The developer already understands it.
- It supports rapid mobile-first development.
- It encourages consistent spacing and breakpoints.
- It integrates directly with Vite.
- It avoids the generic appearance of a pre-designed component framework.
- It generates only the styles detected in application source files.

### Normal CSS

Normal CSS will be limited to:

- Tailwind imports
- Kudu design tokens
- Global body defaults
- Font configuration
- Browser-level base rules
- Accessibility defaults
- Rare complex behaviours that Tailwind cannot express clearly

Normal CSS and Tailwind must not define competing versions of the same component style.

### Motion for React

Motion will handle:

- Page transitions
- Property-card entrance and removal
- Filter-result transitions
- Expanding and collapsing information
- Layout changes
- Loading, empty and error-state transitions

Ordinary Tailwind or CSS transitions will remain the preferred option for:

- Colour changes
- Simple button feedback
- Border changes
- Small hover effects
- Focus states

## Brand Colours

Kudu will use two brand colours.

### Deep forest green

```text
#173F35
```

Purpose:

- Primary actions
- Navigation emphasis
- Links
- Verified states
- Selected controls
- Filled review stars
- Important pricing emphasis

The colour communicates:

- Trust
- Stability
- Land
- Growth
- Security
- Professional maturity

### Warm ivory

```text
#F4F1E8
```

Purpose:

- Main application background
- Quiet content sections
- Subtle visual separation

The colour communicates:

- Warmth
- Approachability
- Calmness
- Housing and physical space

## Functional Neutrals

Black, white and grey may be used as functional neutrals.

They are not additional brand colours.

Their purposes include:

- Main text
- Secondary text
- Card surfaces
- Borders
- Disabled controls
- Empty review stars
- Shadows
- Form-field backgrounds

Bright decorative colours must not be introduced without a documented semantic requirement.

## Contrast

The selected palette provides strong contrast:

| Combination | Contrast ratio |
| ----------- | -------------- |
| Forest green on warm ivory | `10.34:1` |
| White on forest green | `11.67:1` |
| Charcoal text on warm ivory | `14.75:1` |

Text and interactive controls must meet WCAG contrast requirements.

Colour must never be the only method used to communicate meaning.

## Review Stars

When genuine customer reviews are introduced:

- Filled stars will use deep forest green.
- Empty stars will use neutral grey.
- The numeric rating will be displayed.
- The review count will be displayed.
- Screen-reader text will describe the rating completely.

Example:

```text
★★★★☆ 4.2 (38 reviews)
```

Accessible meaning:

```text
Rated 4.2 out of 5 from 38 reviews
```

The platform must not display invented ratings as if they were genuine customer reviews.

## Animation Principles

Animation must communicate state or improve spatial understanding.

Appropriate uses include:

- Showing new search results
- Moving between catalogue pages
- Opening property details
- Expanding fee information
- Displaying loading progress
- Introducing empty or error states
- Confirming an interaction

Animation must not:

- Delay access to information
- Run continuously without purpose
- Cause property cards to bounce
- Use excessive zooming
- Distract from rental information
- Prevent keyboard interaction
- ignore reduced-motion preferences

Most interface transitions should last approximately `150–250ms`.

Animations should primarily use opacity and small position changes.

The interface must support:

```text
motion-safe
motion-reduce
useReducedMotion()
```

## Responsive Design

The frontend will follow a mobile-first approach.

Base styles will target smaller screens first. Larger layouts will be introduced through Tailwind breakpoints.

The interface must support:

- Mobile phones
- Tablets
- Laptop screens
- Desktop screens

Responsive design must consider more than element width. It must also address:

- Navigation behaviour
- Filter layout
- Touch-target size
- Property-card arrangement
- Typography
- Content order
- Image proportions
- Pagination
- Error and empty states

## Information Hierarchy

Property information is more important than decorative styling.

A property card should prioritize:

1. Property image or intentional placeholder
2. Verification state
3. Property title
4. General location
5. Starting prices
6. Available-unit count
7. Action to view details

The interface must not hide important rental information behind unnecessary animation or interaction.

## Quality Benchmark

Yelp is used as a product-quality benchmark for:

- Search-first discovery
- Scannable information
- Consistent cards
- Useful filters
- Trust indicators
- Responsive layouts
- Accessibility
- Clear decision support

Kudu will not copy:

- Yelp’s logo
- Yelp’s red brand identity
- Yelp’s page layouts
- Yelp’s component styling
- Yelp’s written content
- Yelp’s proprietary behaviour

Kudu’s goal is to meet or exceed the usability standard while maintaining an independent product identity and rental-specific purpose.

## Alternatives Considered

### Plain CSS only

This approach would provide complete control and avoid a styling dependency.

It was not selected as the primary approach because the developer already understands Tailwind and can use it to build responsive layouts efficiently.

Plain CSS remains available for global and complex rules.

### Bootstrap

Bootstrap would provide ready-made components and responsive utilities.

It was rejected because:

- Its default visual language can appear generic.
- Considerable overriding may be required.
- Kudu does not currently need its full component system.
- It could compete with Kudu’s visual identity.

### Material UI

Material UI would provide a large React component system.

It was rejected because:

- It introduces a strong external design language.
- Kudu requires a distinct marketplace identity.
- The current feature does not need a complete component framework.
- Customisation could add unnecessary complexity.

### Tailwind CSS only

Using Tailwind for every rule was considered.

It was rejected as an absolute rule because global styles, theme declarations and rare complex behaviours are sometimes clearer in normal CSS.

### Normal CSS and Tailwind without boundaries

This was rejected because duplicated and competing styles would make the interface harder to maintain.

### Motion for every interaction

This was rejected because simple hover and colour transitions are lighter and clearer in CSS.

Motion will be reserved for state, layout, entrance and exit behaviour.

### Multiple bright brand colours

A larger palette including terracotta, yellow or purple was considered.

It was rejected because:

- Too many colours could make the interface feel immature.
- Decorative colour could compete with important information.
- A restrained system communicates professionalism more effectively.
- Semantic meanings would become harder to maintain consistently.

## Consequences

### Positive

- Responsive development will be faster.
- The interface will retain a consistent visual identity.
- Brand colours will remain restrained.
- Components will share spacing and layout conventions.
- Animations can respond naturally to React state.
- Accessibility requirements are part of the design system.
- The frontend will not resemble a generic Bootstrap template.
- Styling decisions will be easier to review.

### Negative

- Tailwind utility lists can become long.
- Developers must avoid duplicating utilities across components.
- Tailwind and normal CSS require a clearly maintained boundary.
- Motion introduces an additional dependency.
- Animation behaviour requires testing.
- Design tokens must be maintained deliberately.
- A two-colour identity demands stronger typography and spacing because decorative colour cannot hide weak layout decisions.

## Implementation Rules

Frontend contributors must:

- Use Tailwind as the primary component-styling system.
- Keep normal CSS focused on global or complex rules.
- Centralize Kudu design tokens.
- Avoid arbitrary colours that bypass the design system.
- Avoid copying the same long utility combinations repeatedly.
- Extract reusable React components when patterns repeat.
- Use semantic HTML.
- Maintain visible keyboard focus.
- Support reduced-motion preferences.
- Use Motion only when it improves understanding.
- Test layouts at mobile, tablet and desktop sizes.
- Keep pricing and verification information visually prominent.
- Avoid displaying private fields even if unexpected data reaches a component.

## Future Review

This decision should be reviewed when:

- A formal Kudu brand identity is commissioned.
- User research reveals accessibility or usability problems.
- The component library becomes difficult to maintain.
- Dark mode is introduced.
- Additional semantic colours become necessary.
- A design team joins the project.
- The application expands beyond the public catalogue.