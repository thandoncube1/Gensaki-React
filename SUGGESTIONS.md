# Landing Page Improvement Suggestions
Date: 2026-06-29

---

## 1. HeroDiagram and StatsBandSection are defined but never rendered
Both are built and exported — `HeroDiagram` (the animated bank → engine → investor
visualization) and `StatsBandSection` (182 bps CET1, 38 days, $7.4B, 25+ investors)
— but neither appears in the `sections` array. The hero is purely text right now.
Adding the diagram below the headline and the stats band right after would dramatically
improve the first impression.

## 2. Hero CTAs are dead
Both `CTAButton` instances in `TopWashSection` and `BottomWashSection` have no `onClick`
— clicking "Request Free Demo" or "Talk to the team" does nothing. `onSelectItem` is
never passed down to those sections so they can't navigate to `/demo`.

## 3. Product card icons are emoji/unicode
`'⚙', '📄', '👥', '↺', '✓', '▦'` render inconsistently across platforms and look cheap
against otherwise polished cards. The codebase already has a `// TODO: replace with
lucide-react` comment. Swapping in actual SVG icons would meaningfully lift the products
section.

## 4. Scroll snap is `mandatory` — should be `proximity`
`scrollSnapType: 'y mandatory'` forces every scroll gesture to lock to a full section,
which is jarring on trackpads and on sections taller than the viewport. Changing to
`y proximity` gives you the snapping hint without hijacking natural scroll momentum.

## 5. Section order buries the proof
Current flow: Hero → Who It's For → Solutions → Products → Workflow → CTA.
The credibility evidence (Stats, Workflow) comes after the product pitch. Reordering to
Hero → Stats → Products → Workflow → Solutions → Who It's For → CTA would let the
numbers do the selling before you ask for a demo.

## 6. Marquee component is unused
A `Marquee` is implemented and ready. Using it for a social proof band (investor logos,
partner institutions, or regulatory standards like "Basel III · CRR Article 245 · NCUA ·
CCAR") between the hero and stats section would reinforce credibility immediately.
