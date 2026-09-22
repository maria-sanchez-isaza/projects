# Content and asset sources

Source: the supplied September 22, 2026 WordPress backup. Published content is in the `wpj2_posts` / `wpj2_postmeta` tables, rather than the separate default WordPress tables in the same SQL file. No live-site content, stock imagery, or generated marketing copy was introduced.

## Brand

The original Elementor global style sheet, `htdocs/wp-content/uploads/elementor/css/post-10.css`, defines the brand's deep blue (#1D4355), green (#9CCA3B), pale green (#C4DD88), white, and light gray (#F7F7F7). The original homepage also uses #364F5B for supporting text. These values form the new palette. Local regular and medium Poppins font files were copied from the original site's Elementor Google Fonts cache; no Google Fonts connection is used.

The logo is copied from `2021/01/new-interior-solutions.png` in the uploads library. It is the image referenced by the original header template.

## Text

| Section | Original source | Treatment |
| --- | --- | --- |
| Hero | Home, post 11807 | Original headline, supporting line, Get Started label, and “Walk through your vision, virtually.” Added closing punctuation only. |
| Introduction | About, post 1549; saved original About template 11984; Services, post 1256 | Original 3D visualization heading and team description, with “committed to help” changed to “committed to helping.” Original sentence about confirming design choices before implementation. |
| Services | Services, post 1256; Videos & Animations, post 7867 | Selected original sentences, with repetitive sales language shortened. |
| Cabin | Contemporary Cabin Design, post 12480 | Original solution text. |
| Exterior | New Residential Home, post 12539 | Original solution text. |
| Animation | Animated Building of a House, post 12548 | Original solution text and original locally hosted video. |
| Virtual staging | Modern Condo in Seattle, post 12801 | Original project-gallery text. |
| Francesca | About Francesca Tosolini, post 7390 | Original opening two paragraphs and “There you go. This is me.” Preserves her Fiat, pizza, Italian condo, and spatial problem-solving story. |
| Experience | About, post 1549; original About template 11984 | Condensed original 2006/2019 journey, team expertise, project review, and Italian design language. Conflicting degree dates between old and current About pages were omitted. |
| Testimonials | Home, post 11807 | Exact, contiguous excerpts attributed to Fabrizia T., Chris T., and Rick M., with their original locations. No testimonial wording changed. |
| Contact | Contact, post 1486; About Francesca, post 7390 | Original email and phone, original “I’m looking forward to working with you!” sentence, and Seattle location as requested. |

Section numbers, navigational labels, image descriptions for accessibility, and carousel controls are new interface text. No new business claims were added.

## Images and video

All paths below are relative to the original `htdocs/wp-content/uploads/` library. Files are copied without visual edits.

- Hero carousel: the ten images recorded in Home post 11807: `2025/02/Sudstrasse_7_vFinal_1-3-terracex-1-scaled.jpg`, `c-scaled.jpg`, `e-scaled.jpg`, `Letitia_Housing_4227_Exterior_Final_1x-scaled.jpg`, `Bookcase-scaled.jpg`, `b-scaled.jpg`, `Lisbon_School_vFinal_1x-1-scaled.jpg`, `PLN_160497420_1-copy-Untitled-4-20220227-151431-copyx-1.jpg`, `a-scaled.jpg`, and `d-scaled.jpg` (all under `2025/02/`). These correspond to `assets/hero-01.jpg` through `hero-10.jpg`; hero-03 opens the new carousel.
- Cabin: `2025/02/Snoqualmie_Interior_2_vFinal_1-scaled.jpg`
- Residential exterior: `2025/02/164th_Place_NE_vFinal_03-close-up-1-scaled.jpg`
- Seattle condo: `2025/02/Living_DiningPS2-scaled.jpg`
- Animation: `2025/02/Final-no-logo-1.mp4`
- Animation poster: the original project image `2025/02/Screenshot-2025-02-07-at-7.44.02 PM.png`
- Francesca's portrait: `2021/02/francesca-profile.jpeg`
- Francesca's Fiat: `2021/10/IMG_2355-scaled.jpeg`

The page omits the blog, newsletter, shop, FAQ, client portals, plugins, administrative features, analytics, and the full archive. There is no web submission form or remote video embed.
