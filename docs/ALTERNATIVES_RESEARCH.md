# Open Source Scheduling Alternatives to Google Calendar Appointments

## Research Summary

After comprehensive analysis, **Cal.com** is the optimal open-source alternative to Google Calendar Appointments and Calendly.

### Why Cal.com?

1. **Direct Calendly Replacement**: Cal.com is explicitly designed as an open-source successor to Calendly, with identical core functionality: calendar syncing, time slot selection, and automated scheduling.

2. **Free Tier**: Offers a generous free plan with no feature restrictions beyond user limits (unlike Calendly's free tier which limits event types and integrations).

3. **Embeddable**: Provides official iframe embedding code that works seamlessly with any web framework, including Astro.js.

4. **Self-Hostable**: Can be self-hosted for complete data control, or used via their hosted service (cal.com) with free tier.

5. **Modern Integration**: Supports both iframe embedding and JavaScript SDK for advanced customization.

6. **Active Development**: Backed by venture funding ($34M raised) with active community and frequent updates.

### Implementation Plan

1. **Replace Google Calendar iframe** in `src/pages/landing-page.astro` with Cal.com's embed code.
2. **Use iframe embedding** for simplicity and compatibility with Astro.js.
3. **Update all links** pointing to `/schedule` to ensure consistency.
4. **Test functionality** across devices and browsers.

### Embed Code Example

```html
<iframe
  src="https://cal.com/your-username/your-schedule-type"
  width="100%"
  height="1170"
  style="border: 0"
  frameborder="0"
  allowfullscreen
>
</iframe>
```

### Advantages Over Alternatives

- **Easy!Appointments**: Requires self-hosting PHP/MySQL, complex setup
- **Thunderbird**: Email client, not a dedicated scheduling platform
- **Nextcloud Appointments**: Requires full Nextcloud installation
- **Fossify Calendar**: Mobile-focused, lacks web embed capabilities

Cal.com provides the closest feature parity to Calendly with the lowest implementation barrier.
