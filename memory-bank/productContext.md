# Product Context

*This file describes the "why" behind the project, the problems it aims to solve, and the desired user experience.*

## Problem Statement

- Lack of a centralized, professional online presence to showcase skills, experience, and projects.
- Difficulty for potential employers, clients, or collaborators to easily find relevant information (resume, portfolio, technical writings).
- Need for a platform to share technical knowledge and establish thought leadership.

## Proposed Solution

A modern, performant personal website (coffey.codes) built with Next.js that serves as:
- A digital resume and portfolio showcasing work history, skills, and projects.
- A blog for publishing technical articles and insights.
- A point of contact for inquiries.
- (Note: Currently does not include explicit links to social profiles like GitHub/LinkedIn in the footer).
The core value is providing a comprehensive and professional overview of Anthony Coffey's capabilities and experience.

## User Experience Goals

*(Describe the desired experience for the end-users. How should they feel when interacting with the product?)*
- **Professional & Polished:** The site should reflect a high standard of quality and attention to detail.
- **Informative:** Users should easily find the information they seek (portfolio, blog posts, contact info).
- **Engaging:** Content (especially blog posts and potentially interactive elements like the Three.js scene) should capture interest.
- **Fast & Responsive:** The site should load quickly and adapt seamlessly to different screen sizes.
- **Accessible:** Adhere to web accessibility standards.
- **Easy Navigation:** Users should be able to move between sections (Home, Articles, Portfolio, Contact) intuitively.

## Key User Flows / Use Cases

*(Outline the primary ways users will interact with the product.)*
1.  **Recruiter/Client Views Portfolio:**
    - Lands on Homepage.
    - Navigates to Portfolio or Case Studies section.
    - Browses project descriptions and visuals.
    - Potentially navigates to Contact page.
2.  **Developer Reads Blog Post:**
    - Arrives via search engine or direct link to an article.
    - Reads the article content.
    - May browse related articles by category or tag.
    - May navigate to the main Articles page or search for other topics.
    - May explore other sections like Portfolio or About (if exists).
3.  **User Searches for Content:**
    - Navigates to the Articles section.
    - Uses the search bar (`components/SearchBox.tsx`, `app/articles/search/page.tsx`) to find articles on a specific topic.
    - Clicks through search results to relevant articles.
4.  **User Makes Contact:**
    - Navigates to the Contact page (`app/contact/page.tsx`).
    - Fills out and submits the contact form (`components/ContactForm.tsx`).
