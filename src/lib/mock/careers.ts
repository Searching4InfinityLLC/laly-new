import type { CareersContent, Role } from '@/lib/types'

// Fallback for the Pages 'careers' doc and the Roles collection — same contract as the other mocks:
// src/lib/cms.ts falls back to these a block at a time, so an unreachable database still renders.
// Roles fall back only when the query FAILS; an empty collection is respected (it means every role
// is closed).
//
// Free of image imports so scripts/seed-careers.ts can import it — one copy of the job description
// rather than two that drift. Copy is the client's (careers brief), verbatim where it was given.
export const careers: CareersContent = {
  hero: {
    label: 'We’re Hiring',
    heading: 'Build brands with us.',
    pills: ['South Florida', 'Remote-Friendly', 'People-First', 'Growing Fast'],
    description: {
      before:
        'Laly Agency is a South Florida creative and brand management agency—three years in, growing fast, and looking for people who ',
      emphasis: 'think in strategy, not just tasks',
      after: '.',
    },
    // Scrolls to the role list on this page (client note: no careers-home link for now).
    button: { label: 'SEE OPEN ROLES', href: '#roles' },
  },
  about: {
    label: 'About Laly Agency',
    heading: 'One team,\nevery touchpoint.',
    body: 'Laly Agency is a small, hands-on marketing agency based in South Florida. We build thoughtful, strategic marketing that connects the full customer experience instead of treating each channel as its own initiative. Every campaign we run functions as an ecosystem: brand, audience, creative, media, technology, and events, all working toward the same objective.\n\nWe’re a creative, people-first team where the environment is casual, open, and real, but casual doesn’t mean low standards. We hold ourselves to a high bar on quality, communication, and follow-through because the work we do for our clients depends on it.',
    services: [
      {
        title: 'Advertising',
        body: 'Google Ads, Microsoft Ads, TikTok Ads and Meta Ads campaign management.',
      },
      {
        title: 'Branding & Marketing',
        body: 'Social, SEO, out-of-home advertising and activations, campaign strategy.',
      },
      {
        title: 'Technology',
        body: 'UX/UI, 3D design, CRM systems, applications and digital experiences.',
      },
    ],
  },
  openRoles: {
    label: 'Open Roles',
    heading: 'Current opportunities',
    empty: 'More roles will appear here as they open.',
  },
}

export const roles: Role[] = [
  {
    slug: 'brand-strategist',
    title: 'Brand Strategist',
    summary:
      'Shape how our clients show up across every channel—from paid media to product launches.',
    pay: '$40–$50/hour',
    tags: ['Remote', '1099 Contractor', '20–25 hrs/week'],
    about:
      'We are seeking an energetic and innovative Brand Strategist to elevate our brand presence and craft compelling stories that resonate across diverse audiences. You will develop and execute comprehensive branding strategies that align with business goals, harness industry trends, and drive market engagement. Your expertise in digital marketing, storytelling, and cross-functional collaboration will be instrumental in shaping our brand’s voice and visual identity.\n\nThis is a strategy-first position. You will be responsible for looking at a brand as a whole, understanding where the brand is today, determining where it needs to go, and developing the strategic framework for how the brand should show up across its entire marketing ecosystem. You will work closely with our internal team across advertising, creative, social, SEO, technology, and other disciplines to ensure that individual projects are not being developed in isolation.',
    responsibilities: [
      'Develop comprehensive brand strategies for each client that define positioning, messaging, audience targeting, and how the brand should show up across every channel, including paid ads, social media, SEO, out of home activations, events, ecommerce, and digital experiences.',
      'Lead the development of activation strategies and concepts across the full activation spectrum: experiential events, guerrilla OOH, sponsorship activations, street-level campaigns, digital-physical hybrids, surprise and delight programs, culture-jacks, and community initiatives.',
      'Define KPIs and measurement frameworks for every campaign and activation before launch. Determine how success will be measured, whether through post-event surveys, aided and unaided brand recall tests, lead capture volume, QR code redemptions, UGC tracking, cost per lead analysis, or other methods appropriate to the objective.',
      'Conduct audience research and market analysis to inform strategic recommendations. Understand the competitive landscape, cultural trends, and the specific communities each client is trying to reach.',
      'Collaborate with the Social Media Manager on content strategy and amplification plans, with the Creative Director on visual direction and brand identity, with the Paid Ads Manager on how paid campaigns support broader brand goals, and with the development team on digital experiences.',
      'Collaborate with product management, sales teams, and creative departments to align branding efforts with business objectives.',
      'Participate in client strategy sessions alongside the CEO and contribute to shaping how Laly Agency approaches strategy, both for our clients and for our own brand.',
      'Ensure that every strategy recommendation is realistic within client budgets and timelines.',
    ],
    requirements: [
      'Bachelor’s degree in Marketing, Communications, Business, or a related field with a minimum of 2 years of experience in a brand strategy role, or, without a bachelor’s degree, a minimum of 4 years of direct brand strategy experience.',
      'Experience managing brand strategy across multiple clients or brands simultaneously, with the ability to context-switch between industries and audiences without losing strategic depth.',
      'Ability to work independently in a remote, self-directed environment. This is a contractor role with flexible hours, and we need someone who manages their own time, meets deadlines, and drives work forward without oversight.',
      'Proven experience in branding, marketing strategy development, or related roles with a strong portfolio of successful campaigns.',
      'Expertise in social media management, digital marketing, out of home advertising, and multichannel marketing platforms.',
      'Experience developing activation strategies, whether experiential events, guerrilla marketing, sponsorships, community activations, or other formats that bring a brand to life beyond digital channels.',
      'Knowledge of how to define and measure KPIs for campaigns and activations using real-world measurement methods: post-event and post-campaign surveys, aided and unaided brand recall studies, lead capture and conversion tracking, UGC monitoring, cost per lead and cost per acquisition analysis, social amplification metrics, earned media value assessment, and tools like Google Trends for brand search uplift analysis.',
      'Strong storytelling ability with the skill to craft brand narratives, positioning frameworks, and activation concepts that connect with diverse audiences and translate across formats.',
      'Excellent cross-functional collaboration skills. You will work alongside a creative director, social media manager, paid ads manager, videographer, copywriter, and OOH coordinator, and you need to bring all of those perspectives into a unified strategy.',
      'Knowledge of industry trends across multiple verticals, including B2B services, ecommerce, service & lead based industries, legal, and community-driven brands.',
      'Understanding of market research techniques, competitive analysis, and how to translate data into strategic recommendations that drive business outcomes.',
      'Ability to think in terms of repeatable, scalable formats, finding activation concepts that can be adapted across markets and clients rather than building from scratch every time.',
    ],
    details: [
      { label: 'Compensation', value: '$40–$50/hour, based on experience' },
      { label: 'Location', value: 'Fully remote' },
      { label: 'Hours', value: '20–25 hours per week, with potential for full-time after a 6-month evaluation period' },
      { label: 'Classification', value: '1099 Independent Contractor' },
      { label: 'Availability', value: 'Must be available within 9:00 AM–5:00 PM EST (Monday–Friday)' },
    ],
  },
]
