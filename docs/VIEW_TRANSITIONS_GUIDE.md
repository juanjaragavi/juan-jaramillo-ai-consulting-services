# Astro View Transitions Implementation Guide

## Overview

This project now has Astro View Transitions enabled globally, providing smooth page transitions throughout the site.

## What Was Implemented

### 1. Global View Transitions (Base.astro)

The `ClientRouter` component has been added to `src/layouts/Base.astro`:

```astro
---
import { ClientRouter } from "astro:transitions";
---

<!doctype html>
<html lang="en">
  <head>
    <ClientRouter />
    <!-- other head elements -->
  </head>
  <!-- body content -->
</html>
```

### 2. Persistent Elements

The following elements have been configured to persist across page navigations:

- **Header**: `transition:name="site-header"` with `transition:animate="none"`
- **Footer**: `transition:name="site-footer"` with `transition:animate="none"`

These elements will remain in place during page transitions, preventing them from re-rendering and maintaining state.

## How to Use View Transitions

### Basic Usage

With the global setup complete, all internal links will automatically use view transitions. No additional code is needed for basic page-to-page transitions.

### Advanced Transition Directives

#### 1. Persist Elements Across Navigations

Use `transition:persist` to keep an element's state across page changes:

```astro
<video transition:persist>
  <source src="video.mp4" type="video/mp4" />
</video>
```

#### 2. Custom Animation

Import and use custom animations:

```astro
---
import { fade, slide } from "astro:transitions";
---

<div transition:animate={fade({ duration: "0.5s" })}>
  Content with custom fade animation
</div>

<section transition:animate={slide({ duration: "0.3s" })}>
  Content with slide animation
</section>
```

#### 3. Matching Elements Across Pages

Use `transition:name` to create smooth morphing between elements on different pages:

```astro
<!-- On page A -->
<div transition:name="hero-image">
  <img src="/hero-a.jpg" alt="Hero" />
</div>

<!-- On page B -->
<div transition:name="hero-image">
  <img src="/hero-b.jpg" alt="Hero" />
</div>
```

The element will smoothly morph from its position on page A to page B.

#### 4. Disable Transitions for Specific Links

To disable view transitions for a specific link:

```astro
<a href="/external-site" data-astro-reload>External Link</a>
```

#### 5. Control Animation Direction

```astro
<div transition:animate="slide" data-astro-transition="forward">
  <!-- Content -->
</div>
```

## Available Animation Presets

Astro provides several built-in animations:

- `fade` - Simple opacity transition
- `slide` - Slide in/out effect
- `none` - No animation (instant swap)

You can also create custom animations using CSS:

```astro
---
// Define custom animation
const customAnimation = {
  old: {
    name: "customOut",
    duration: "0.3s",
    easing: "ease-in",
  },
  new: {
    name: "customIn",
    duration: "0.3s",
    easing: "ease-out",
  },
};
---

<div transition:animate={customAnimation}>Content</div>

<style>
  @keyframes customOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }

  @keyframes customIn {
    from {
      opacity: 0;
      transform: scale(1.05);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
```

## JavaScript Events

View Transitions emit several events you can listen to:

```javascript
document.addEventListener("astro:before-preparation", () => {
  // Fired before transition preparation
});

document.addEventListener("astro:after-preparation", () => {
  // Fired after transition preparation
});

document.addEventListener("astro:before-swap", () => {
  // Fired before the old page is swapped out
});

document.addEventListener("astro:after-swap", () => {
  // Fired after the new page is swapped in
});

document.addEventListener("astro:page-load", () => {
  // Fired when the new page is fully loaded (replaces DOMContentLoaded)
});
```

**Note**: The header already uses `astro:page-load` for its sticky scroll behavior.

## Best Practices

1. **Use `transition:persist` sparingly**: Only persist elements that truly need to maintain state (videos, audio, complex interactive widgets).

2. **Match element structure**: When using `transition:name`, ensure the elements have similar DOM structure for smooth morphing.

3. **Keep animations short**: Aim for 200-400ms transitions for better UX.

4. **Test accessibility**: Ensure transitions don't interfere with screen readers or keyboard navigation.

5. **Handle loading states**: Use the transition events to show loading indicators for slower pages.

6. **Avoid persisting changing content**: Don't persist elements whose content changes significantly between pages.

## Troubleshooting

### Transitions not working?

1. Check that all internal links use relative paths (not `window.location`)
2. Ensure you're not using `target="_blank"` on internal links
3. Verify no JavaScript is preventing default link behavior

### Flash of content?

This can happen if:

- Elements have significantly different sizes between pages
- CSS hasn't loaded yet
- Images are still loading

Solutions:

- Use `transition:name` to morph between similar elements
- Preload critical CSS
- Use aspect-ratio CSS or fixed dimensions for images

### State not persisting?

- Ensure you're using `transition:persist` on the element
- Check that the element has the same `transition:persist` value on both pages
- Verify the element's position in the DOM tree is consistent

## Resources

- [Astro View Transitions Guide](https://docs.astro.build/en/guides/view-transitions/)
- [Transition Directives Reference](https://docs.astro.build/en/reference/directives-reference/#view-transitions-directives)
- [View Transitions API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)

## Examples in This Project

Check these files for implementation examples:

- `src/layouts/Base.astro` - Global setup
- `src/layouts/partials/Header.astro` - Persistent header with no animation
- `src/layouts/partials/Footer.astro` - Persistent footer with no animation
