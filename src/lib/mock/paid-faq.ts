// /paid-advertising FAQ copy. Its own module, free of .webp imports, so the bun scripts can import
// it (seed-paid.ts, update-paid-faq.ts) as well as the mock — one copy instead of three.
// Paragraphs are joined with a blank line; Accordion splits on it.
const answer = (...paragraphs: string[]) => paragraphs.join('\n\n')

export const PAID_FAQ: { question: string; answer: string }[] = [
  {
    question: 'What is PPC advertising?',
    answer: answer(
      'PPC, which stands for “pay-per-click,” is a specific form of targeted advertising that can allow marketers to reach interested consumers. Simply put, you only spend when a user clicks on your ad. When done right, PPC can increase discoverability and web traffic, making it one of the best ways to promote your business online.',
      'There are multiple paid ads platforms that allow you to set up PPC campaigns, but Google Ads is one of the most significant. Marketers design ads to appeal to potential clients, linking back to their own website, which can then be shown in Google Search results. That advertiser then pays a certain amount to Google for every time a search user clicks on that ad—hence the name, “pay per click.”',
    ),
  },
  {
    question: 'What’s the difference between Google Ads vs. Meta Ads?',
    answer: answer(
      'Google Ads and Meta Ads are frequently compared because they are among the most popular and most effective PPC advertising platforms. The most significant difference between the two is self-explanatory: Google Ads show up in Google platforms like Google Search and YouTube, while Meta Ads show up on Meta platforms like Facebook and Instagram.',
      'Google Ads are primarily text-based. When building a Google Ads campaign, you can choose to target based on certain keywords as well as demographic characteristics, so, for example, if someone in a certain area searches “I just got in a car accident,” they might see ads for accident attorneys in their area. This can be useful for various types of businesses, and the focus on short, readable text can be ideal if your potential customers need to make a quick decision and want a rundown of your offerings.',
      'When using Meta Ads, you can still target based on demographics and interest profiles, but a key difference here is that Meta Ads tend to be centered around a visual asset, like a photo or video. This can be great for reaching consumers who want to see the product for themselves before they buy in. If visuals are an important part of your clients’ decision to choose you, Meta Ads is likely to be an important part of your PPC strategy.',
      'The right fit for you will depend on your industry, your budget, and other factors, but it’s important to note that you shouldn’t necessarily rely on just one. Many businesses run successful ad campaigns on both platforms, taking advantage of the differences between them to reach more online users.',
    ),
  },
  {
    question: 'What paid ads platforms does Laly handle?',
    answer: answer(
      'Laly primarily works through four different paid ads platforms: Google Ads, Meta Ads, TikTok Ads and Microsoft Advertising.',
      'Google Ads and Microsoft Advertising are search-based platforms, primarily reaching audiences on major search engines (Google and Bing, respectively). Meanwhile, Meta and TikTok Ads reach users on social media. Each platform has its own advantages, as well as potential shortcomings if used in the wrong way.',
      'We work closely with each of these platforms, but we don’t use them all equally. Every project is different, so we always scale our ad strategy responsively based on the client’s needs.',
    ),
  },
  {
    question: 'Why aren’t my paid ads working?',
    answer: answer(
      'Every business’ story is different. If you’re failing to generate leads through PPC ads, there could be a variety of explanations, but some of the most common are issues with your targeting strategy. You could be targeting the wrong people, not tracking the most important interactions, or using a platform that doesn’t suit your needs.',
      'If the issue isn’t with your targeting, it could also be more of a technical issue. These platforms come with a variety of settings to allow you to market based on your needs, but these settings can also be confusing for unfamiliar users. Applying the wrong settings could mean wasting a lot of your budget.',
      'Many PPC platforms will offer default or recommended settings, which can be misleading. It’s important to remember that these platforms don’t have an innate understanding of your business’ needs, and more importantly, there is little incentive for them to help you maximize your spend—the money you waste on a mismanaged ad campaign goes into their pockets either way.',
      'That’s why it’s important to work with a marketing team that understands your business model and will put in the extra mile to maximize your results. When we take on a new project at Laly, we always start with a full audit of your current processes to help identify the weak points that lead to poor returns from ad spend.',
    ),
  },
  {
    question: 'How do I make sure the right people see my paid ads?',
    answer: answer(
      'Get more niche. Paid ads platforms allow you to target a variety of different demographic categories, such as age, income, gender, and even users’ search patterns and interests. It’s important to understand your audience so you can aim your ads towards them—and to understand how to use the settings available on paid ads platforms to reach these demographics.',
      'Another important factor is to stay on the ball. PPC platforms, especially Meta Ads, tend to evolve quickly. This means the most effective recommendation from a year ago may not be helpful now. Good PPC advertising is not a one-time investment, but an ongoing process.',
    ),
  },
  {
    question: 'How much should I expect to spend on PPC ads?',
    answer: answer(
      'It depends on your industry and the competition you face. For example, injury attorneys have to deal with a highly competitive market, saturated with other practicing attorneys trying to fill the same demand. In order to see results in such a saturated market, we would generally recommend a budget of $10,000 at minimum.',
    ),
  },
  {
    question: 'How long before I see results from PPC ads?',
    answer: answer(
      'It depends on your budget and your history. PPC ad campaigns typically start running within a day or two of campaign launch, but that doesn’t translate to more business right away. If you’re working with the absolute minimum budget and a brand new account, it can easily take up to 6 months before you start seeing an influx of clients. However, businesses that already have historical ad data and a healthy budget may be able to see an impact within the first month.',
    ),
  },
  {
    question: 'What’s the difference between PPC & SEO?',
    answer: answer(
      'Pay-per-click advertising (PPC) involves paying the search engine directly to show up in search results. By contrast, search engine optimization (SEO) is about strategically building and managing web content to show up on the search engine organically. Both marketing strategies share the goal of putting your business in front of more potential clients, but the methods used to get there differ significantly, and they can lead to slightly different outcomes.',
      'PPC allows for precise targeting, allowing you to funnel the most interested users towards taking a specific action, like placing a call or visiting your website. They generally have a more active role in generating new leads, at the cost of having to pay for each interaction.',
      'SEO, on the other hand, acts as a way to make your business more visible across any relevant search categories. Good SEO not only helps you build more brand awareness, but allows you to generate more organic leads without an assigned cost per click.',
    ),
  },
]
