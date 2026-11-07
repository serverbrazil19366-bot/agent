"""Everything written on the portfolio lives here. Edit this file, then run
`python3 scripts/build.py`. Profile details follow Sakthi's LinkedIn profile."""

PROFILE = {
    "name": "S. Saktheeswaran",
    "first": "Saktheeswaran",
    "short": "Sakthi",
    "role": "Founder & CEO @ Astra Nexora",
    "headline": "SEO, AI automation & high-performance websites",
    "lead": ("I help businesses grow their online visibility, traffic and leads through structured, data-driven "
             "digital marketing, from SEO strategy to websites to marketing automation."),
    "location": "Tamil Nadu, India",
    "email": "saktheesw2005@gmail.com",
    "whatsapp": "918838417707",
    "resume": "https://docs.google.com/document/d/1brBd7zu546so_-IKQJtDZykJBsVI6wHi/preview",
    "social": [
        ("LinkedIn", "https://www.linkedin.com/in/saktheeswaran-digital-marketing-expert/"),
        ("Instagram", "https://www.instagram.com/itx_sakthi_77_/"),
    ],
    "agency": ("Astra Nexora", "https://astranexora.netlify.app/"),
}

# Shown as given by Sakthi: real figures from his own work.
STATS = [("2+", "Years experience"), ("18+", "Projects completed"), ("12+", "Happy clients")]
RESULTS = [("98%", "Client satisfaction"), ("200%", "Revenue growth delivered for clients")]

ABOUT = [
    "I'm S. Saktheeswaran (Sakthi), founder & CEO of Astra Nexora and a digital marketing and SEO expert based in "
    "Tamil Nadu, India. I help businesses grow their online visibility, traffic and lead generation through structured, data-driven "
    "digital marketing. As founder of Astra Nexora, I run end-to-end digital marketing across multiple brands, "
    "handling everything from SEO strategy to website development to marketing automation, personally.",
    "I don't outsource strategy, I execute it myself. That means faster iteration, tighter feedback loops and "
    "results I can personally stand behind. I'm building Astra Nexora into a full-stack digital marketing agency "
    "that delivers measurable growth for clients across industries.",
]

# "What I bring", from the LinkedIn summary
BRING = [
    ("Technical & on-page SEO", "Core Web Vitals, schema and site architecture."),
    ("Local SEO", "Google Business Profile, citations and local pack rankings for service businesses."),
    ("GA4 & Search Console", "Full-funnel tracking and reporting."),
    ("WordPress & performance", "Website development and speed optimisation."),
    ("n8n automation", "Lead workflows, booking systems and reporting pipelines."),
    ("Multi-brand management", "SEO, content and automation across several clients at once."),
    ("Google & Meta Ads", "Campaign setup and execution."),
]

TICKER = ["SEO", "Local SEO", "WordPress", "n8n Automation", "Google Ads", "Meta Ads", "GA4", "Search Console",
          "WhatsApp Automation", "Content Creation", "Lead Generation"]

SKILL_TABS = [
    ("SEO & Web", [
        ("Technical & on-page SEO", "Core Web Vitals, schema, metadata, internal links and site architecture."),
        ("Local SEO", "Google Business Profile, citations, reviews and local pack rankings."),
        ("Website development", "WordPress, Wix, Framer and Bolt websites built to load fast and convert."),
        ("CRO & optimisation", "Clearer structure, better UX and stronger calls to action."),
    ]),
    ("Automation & Data", [
        ("n8n automation", "Lead capture, booking systems and reporting pipelines."),
        ("WhatsApp & email automation", "Confirmations, notifications and follow-ups that send themselves."),
        ("GA4 & Search Console", "Full-funnel tracking, conversion set-up and clear reports."),
        ("Dashboards", "One place for bookings, cases and enquiries, with alerts for the team."),
    ]),
    ("Marketing", [
        ("Google & Meta Ads", "Campaign setup, targeting and execution."),
        ("Social media marketing", "Content calendars, campaigns and steady organic growth."),
        ("Content creation", "Videos, posters and social creatives for client brands."),
        ("Multi-brand management", "Running SEO, content and automation for several clients at once."),
    ]),
]

TOOLS = [("WordPress", "wordpress"), ("n8n", "n8n"), ("Framer", "framer"), ("Wix", "wix"), ("Figma", "figma"),
         ("Bolt", "bolt"), ("Lovable", "lovable"), ("Canva", "canva"), ("CapCut", "capcut"),
         ("Google Analytics 4", None), ("Search Console", None), ("Rank Math", None),
         ("Google Ads", None), ("Meta Ads", None)]
SOFT_SKILLS = ["Business development", "Sales", "Team training", "Client handling", "Problem solving", "Planning"]

# (dates, role, organisation, summary, bullet points)
EXPERIENCE = [
    ("May 2025 – Present", "Founder & Digital Marketing Expert", "Astra Nexora",
     "Founded and independently run Astra Nexora, managing end-to-end digital marketing and website creation for "
     "multiple client brands.",
     ["Built websites using Wix, Framer, Figma and Bolt",
      "Delivered full-funnel SEO: technical audits, on-page optimisation, local SEO and content strategy",
      "Managed GA4 and Search Console tracking, reporting and CRO improvements",
      "Created video content, posters and social media creatives for client brands",
      "Designed n8n automation workflows for lead capture, booking systems and reporting",
      "Independently managing multiple client brands, from design to development to marketing"]),
    ("Jun 2025 – Apr 2026", "Assistant Manager", "Dream Emphasis", "", []),
    ("Oct 2024 – Aug 2025", "Business Development & Training (Internships)", "Multiple organisations",
     "Short-term internships and training roles across business development, sales and digital marketing that built "
     "the foundation for founding Astra Nexora.",
     ["Digital marketing internship: SEO and campaign execution",
      "Business development & training management: sales operations, employee training",
      "Sales & customer service: consumer electronics and hardware retail"]),
    ("Dec 2024 – Jun 2025", "Digital Marketing Intern", "ASSR Emphorium",
     "Completed a 90-day internship in digital marketing.", []),
]

EDUCATION = [("Aug 2022 – May 2025", "Bachelor of Business Administration (BBA)", "Einstein College of Arts & Science, Tirunelveli")]

SERVICES = [
    ("Search Engine Optimization", "Technical, on-page and local SEO with schema, Core Web Vitals and Search Console reporting.", "seo"),
    ("Website Development", "Fast, mobile-first websites on WordPress, Wix, Framer and Bolt, built to bring enquiries.", "web"),
    ("Marketing Automation", "n8n workflows, WhatsApp and email automation, booking systems and dashboards.", "ai"),
    ("Google & Meta Ads", "Campaign setup and execution with tracking that shows what each rupee brings.", "strategy"),
    ("Social Media & Content", "Content planning, posters, reels and videos that keep brands consistent.", "social"),
    ("Analytics & Reporting", "GA4 and Search Console set-up, conversion tracking and clear monthly reports.", "content"),
]

# Projects. tag drives the filter: web, seo, auto, social.
PROJECTS = [
    {
        "slug": "astra-nexora-website",
        "title": "Astra Nexora – Agency Website",
        "tag": "web",
        "category": "Website Development",
        "summary": "A fast, SEO-ready agency website with service pages, a blog and a WhatsApp enquiry form.",
        "cover": "work/astra-1",
        "gallery": ["work/astra-2", "work/astra-m"],
        "live": "https://astranexora.netlify.app/",
        "meta": [("Year", "2026"), ("Industry", "Digital marketing agency"), ("Client", "Astra Nexora (my own agency)"), ("Role", "Founder, strategy & SEO")],
        "sections": [
            ("The challenge", "Astra Nexora needed a professional online presence that explains eight services clearly, "
             "looks premium and turns visitors into enquiries, without a slow, template-heavy site."),
            ("Strategy", "One page per service, honest concept projects instead of fake case studies, a free website "
             "audit as the main offer and WhatsApp as the main contact channel."),
            ("What I did", "Planned the structure and content, directed the design, set up a blog with SEO-focused "
             "guides, structured data, sitemap, Google Search Console and Bing submission. Built with custom HTML, CSS "
             "and JavaScript, deployed on Netlify."),
            ("Outcome", "A live, indexed agency website with 8 service pages, project pages, a blog and an enquiry form "
             "that opens WhatsApp with the visitor's details filled in."),
        ],
        "tools": ["HTML/CSS/JS", "GSAP", "Netlify", "Search Console", "Bing Webmaster"],
    },
    {
        "slug": "ankhor-case-booking-automation",
        "title": "Ankhor Dental Lab – Case Portal, Scan Booking & Automation",
        "tag": "auto",
        "category": "Portal, Dashboard & Automation",
        "summary": "An online case portal and scan booking platform with dashboards, email and WhatsApp alerts and a mobile app.",
        "cover": "work/ankhorcase-2",
        "gallery": ["blog/ankhor-send-case", "work/ankhorcase-1", "work/ankhorcase-m", "work/ankhorcase-3"],
        "live": "https://ankhorlab.com/book-scan",
        "meta": [("Year", "2026"), ("Industry", "Dental laboratory"), ("Client", "Ankhor Dental Lab"), ("Role", "Planning, build & automation")],
        "sections": [
            ("The challenge", "Clinics booked scans and sent cases through calls and scattered WhatsApp messages, so the "
             "lab team had no single place to see what was coming in, and every confirmation had to be typed by hand."),
            ("Strategy", "Move case sending and scan booking online, send every request into one dashboard and notify "
             "the team instantly by email and WhatsApp, so nobody has to chase anything."),
            ("What I did", "Built the online case portal, where clinics send case details, a shade photo and STL, OBJ or "
             "PLY scans, with a dashboard for the team. Every new case triggers an email and WhatsApp notification, and "
             "a mobile app lets the team check cases on the go. Built the scan booking platform with live slots and its "
             "own dashboard."),
            ("Outcome", "Every case and scan booking lands in one place, the team hears about new cases instantly, "
             "and taken slots show as booked straight away."),
        ],
        "tools": ["n8n", "WhatsApp", "Email automation", "Dashboard", "Mobile app"],
    },
    {
        "slug": "ankhor-referral-program",
        "title": "Ankhor Dental Lab – Diwali Referral Program",
        "tag": "auto",
        "category": "Campaign Page, Dashboard & App",
        "summary": "A Diwali Refer & Earn program for dentists: a campaign page with a live countdown, personal referral links and a dashboard and app to track referrals.",
        "cover": "blog/ankhor-refer",
        "gallery": ["blog/ankhor-refer-2", "blog/ankhor-refer-m"],
        "live": "https://ankhorlab.com/refer/",
        "meta": [("Year", "2026"), ("Industry", "Dental laboratory"), ("Client", "Ankhor Dental Lab"), ("Role", "Campaign, build & dashboard")],
        "sections": [
            ("The challenge", "Ankhor wanted more clinics to try the lab, and dentists trust recommendations from other "
             "dentists more than ads."),
            ("Strategy", "Run a time-limited Diwali referral offer with a clear reward, make sharing one tap on WhatsApp, "
             "and track every referral automatically."),
            ("What I did", "Built the Refer & Earn campaign page with the offer, a live countdown, a three-step "
             "how-it-works section and FAQs; personal referral links with one-tap WhatsApp sharing; and a dashboard and "
             "app to track referrals and rewards."),
            ("Outcome", "A complete referral campaign the lab can run without spreadsheets: dentists share their link, "
             "and the lab sees every referral and reward in one place."),
        ],
        "tools": ["Campaign page", "Dashboard", "Mobile app", "WhatsApp sharing"],
    },
    {
        "slug": "ankhor-dental-lab",
        "title": "Ankhor Dental Lab – Website & SEO",
        "tag": "seo",
        "category": "SEO & Website",
        "summary": "A new dental lab website with a full product catalogue, technology pages, SEO on every page and Send a Case everywhere.",
        "cover": "work/ankhor-1",
        "gallery": ["work/ankhor-2", "work/ankhor-m"],
        "live": "https://ankhorlab.com/",
        "meta": [("Year", "2026"), ("Industry", "Dental laboratory"), ("Client", "Ankhor Dental Lab"), ("Role", "Website & SEO")],
        "sections": [
            ("The challenge", "Dentists look for very specific restorations, so the lab needed a website that shows "
             "everything it makes, builds trust and makes sending a case easy."),
            ("Strategy", "Build the site around a product catalogue with a page for each product, explain the lab's "
             "digital workflow, do the SEO on every page and put Send a Case on every page."),
            ("What I did", "Designed and built the website: services, technology and a product catalogue with categories, "
             "search and a page for every product. Did the SEO: titles, descriptions, headings, internal links, image "
             "optimisation, sitemap and Search Console."),
            ("Outcome", "A complete dental lab website where every product can be found on its own, and every page leads "
             "to sending a case."),
        ],
        "tools": ["WordPress", "Rank Math", "Search Console", "Google Analytics"],
    },
    {
        "slug": "akeela-dental-care",
        "title": "Akeela Dental Care – Website & SEO",
        "tag": "web",
        "category": "Website Development & SEO",
        "summary": "A new dental clinic website with a page for every treatment, full SEO and WhatsApp appointment booking.",
        "cover": "work/akeela-1",
        "gallery": ["work/akeela-2", "work/akeela-m"],
        "live": "https://akeeladentalcare.com/",
        "meta": [("Year", "2026"), ("Industry", "Dental clinic"), ("Client", "Akeela Dental Care"), ("Role", "Website, SEO & booking")],
        "sections": [
            ("The challenge", "Patients needed to find the right treatment quickly and book without waiting on a phone "
             "call, and the clinic needed to show up when people nearby search for dental care."),
            ("Strategy", "Build the website around treatments, with one page for each, do the SEO properly from the "
             "start, and make booking, calls and WhatsApp easy from every page, especially on mobile."),
            ("What I did", "Designed and built the website, created a page for each treatment, and did the full SEO: "
             "titles, descriptions, headings, internal links, structured data and Search Console. Set up the appointment "
             "form that sends the request to WhatsApp, with call and WhatsApp buttons on every page."),
            ("Outcome", "A complete clinic website where each treatment has its own page, and every appointment request "
             "reaches the clinic on WhatsApp, ready to confirm."),
        ],
        "tools": ["WordPress", "Elementor", "Canva", "PageSpeed Insights"],
    },
    {
        "slug": "akeela-whatsapp-automation",
        "title": "Akeela Dental Care – WhatsApp Booking Automation",
        "tag": "auto",
        "category": "WhatsApp Automation",
        "summary": "Appointment requests that arrive in WhatsApp with the patient's details, ready for the clinic to confirm.",
        "cover": "work/akeelawa-1",
        "gallery": ["work/akeelawa-m"],
        "live": "https://akeeladentalcare.com/book-dental-appointment-chennai/",
        "meta": [("Year", "2026"), ("Industry", "Dental clinic"), ("Client", "Akeela Dental Care"), ("Role", "Automation & booking flow")],
        "sections": [
            ("The challenge", "Patients called during busy clinic hours or sent enquiries that were easy to miss, so "
             "appointment requests were slow to answer."),
            ("Strategy", "Make WhatsApp the main booking channel, because patients already use it, and remove every "
             "step between deciding to book and sending the request."),
            ("What I did", "Built the booking form (name, phone, treatment and message) that opens WhatsApp with the "
             "request filled in, set up WhatsApp automation for the clinic's booking enquiries, and added call and "
             "WhatsApp buttons that stay on screen on mobile."),
            ("Outcome", "Every booking request reaches the team on WhatsApp with the patient's name, number and "
             "treatment, so they can confirm it in one reply."),
        ],
        "tools": ["WhatsApp Business", "n8n", "Booking form"],
    },
    {
        "slug": "guggulr-instagram",
        "title": "GUGGULR – Instagram Brand Growth",
        "tag": "social",
        "category": "Social Media Marketing",
        "summary": "A consistent Instagram creative system that gave a premium gift box brand a stronger identity.",
        "cover": "work/guggulr-1",
        "gallery": [],
        # Product creatives Sakthi designed in Canva and edited for the brand's Instagram
        "creatives": [
            ("guggulr-02", "Trésor Céleste"), ("guggulr-01", "Turquoise gift box"),
            ("guggulr-03", "Édition Velaris collage"), ("guggulr-04", "Coffret Aurore Noël collage"),
            ("guggulr-05", "Édition Velaris"), ("guggulr-06", "Peacock gift box"),
            ("guggulr-07", "Coffret Aurore Noël"), ("guggulr-08", "Paon Royal"),
            ("guggulr-09", "L'édition Majestic"), ("guggulr-10", "Majestic box, three views"),
            ("guggulr-11", "Rose basket hamper"), ("guggulr-12", "Garden dry fruit tray"),
            ("guggulr-13", "Christmas greeting"),
        ],
        "live": "",
        "meta": [("Year", "2026"), ("Industry", "Premium gift boxes"), ("Client", "GUGGULR"), ("Role", "Social media & creative")],
        "sections": [
            ("The challenge", "The Instagram profile lacked consistency and product presentation varied from post to "
             "post, which weakened brand recall."),
            ("Strategy", "Plan content themes, design a recognisable creative style and run campaigns that keep the "
             "feed consistent and premium."),
            ("What I did", "Content planning, creative design, campaign concepts and post optimisation, keeping "
             "branding consistent across every post and story."),
            ("Outcome", "14 Instagram creatives, story templates, promotional posters and campaign assets, giving the "
             "brand a professional, consistent presence."),
        ],
        "tools": ["Canva", "Photoshop", "CapCut", "Meta Business Suite"],
    },
    {
        "slug": "google-business-profile",
        "title": "Google Business Profile Optimisation",
        "tag": "seo",
        "category": "Local SEO",
        "summary": "Optimising Business Profiles so local customers find accurate details and trust the business.",
        "cover": "work/gbp-1",
        "gallery": ["work/gbp-2"],
        "live": "",
        "meta": [("Year", "2026"), ("Industry", "Restaurants & local businesses"), ("Client", "Local businesses"), ("Role", "Local SEO")],
        "sections": [
            ("The challenge", "Incomplete profiles and inconsistent business details were reducing local visibility "
             "on Google Search and Maps."),
            ("Strategy", "Complete and correct every profile detail, choose the right categories, add real visuals "
             "and track performance through profile insights."),
            ("What I did", "Profile audits, category and service optimisation, image management and reporting."),
            ("Outcome", "Optimised, accurate listings and a stronger, more professional local presence."),
        ],
        "tools": ["Google Business Profile", "Google Maps", "Canva"],
    },
]

VIDEOS = [
    ("ofwdAKGqZ88", "video", "Digital Marketing Campaign", "Campaign showcase",
     "A complete campaign showing creative strategy, content planning and audience engagement."),
    ("qrnefrxULjM", "short", "Product Promotion", "Product promotion short",
     "A fast-paced short made to grab attention within seconds on YouTube Shorts and Reels."),
    ("M9cttP7peO8", "short", "Creative Advertisement", "Creative advertisement",
     "Dynamic editing and motion graphics that present the product and build recall."),
    ("ilGWN0c3_84", "short", "Brand Awareness", "Brand awareness campaign",
     "Eye-catching visuals and concise messaging to grow visibility."),
    ("Jy9CYJqDtV0", "short", "Social Media Reel", "Social media marketing reel",
     "A reel built on trending formats and marketing-focused storytelling."),
]

# Posters and print pieces Sakthi designed for clients: (image key, client, format, title)
DESIGNS = [
    ("akeela-years", "Akeela Dental Care", "Brand poster", "Three decades. One smile."),
    ("propedo-launch", "ProPedoZR", "Launch post", "Meet ProPedo ZR"),
    ("akeela-wisdom", "Akeela Dental Care", "Awareness poster", "Wisdom tooth pain? Don't ignore it."),
    ("propedo-zirconia", "ProPedoZR", "Product poster", "Why zirconia for little smiles?"),
    ("akeela-missing", "Akeela Dental Care", "Implant ad", "Missing a tooth?"),
    ("propedo-ad", "ProPedoZR", "Product ad", "The right fit for little smiles"),
    ("akeela-implant", "Akeela Dental Care", "Social poster", "Fixed teeth in just 72 hours"),
    ("propedo-strong", "ProPedoZR", "Campaign poster", "Strong foundations for bigger tomorrows"),
    ("propedo-gandhi", "ProPedoZR", "Festive post", "Gandhi Jayanti greeting"),
]
# Print pieces for one client, shown together: (client, heading, [(image key, label)])
PRINT = ("ProPedoZR", "Product flyer &amp; trifold brochure",
         [("propedo-flyer", "Product flyer"), ("propedo-brochure-1", "Brochure, outside spread"),
          ("propedo-brochure-2", "Brochure, inside spread")])

# Shared by Sakthi from real clients, with their permission. Quotes are kept word for word.
TESTIMONIALS = [
    ("Launching our startup became much easier with his digital marketing guidance. The website, branding, and "
     "marketing strategy were exactly what we needed.", "M Karthika", "Startup Founder"),
    ("His local SEO and Google Business optimization helped more customers discover our restaurant online. We noticed "
     "a steady increase in calls and walk-in customers.", "Sathish Kumar", "Restaurant Owner"),
    ("The social media strategy and content created for our brand helped us reach a wider audience. His creative "
     "approach and consistent support made a real difference.", "Revathi", "Boutique Founder"),
    ("Saktheeswaran helped us improve our online presence with effective SEO and digital marketing strategies. We "
     "started receiving more customer inquiries within a short period.", "Karthi", "Small Business Owner"),
]

# Search titles and descriptions for the case studies (the on-page title stays as above)
PROJECT_SEO = {
    "astra-nexora-website": ("Digital Marketing Agency Website – Astra Nexora Case Study",
                             "How S. Saktheeswaran planned and launched the Astra Nexora agency website: service pages, an SEO blog, structured data and a WhatsApp enquiry form."),
    "ankhor-case-booking-automation": ("Dental Lab Case Portal & Automation – Ankhor Case Study",
                                       "An online case portal, scan booking platform, dashboards, email and WhatsApp alerts and a mobile app for Ankhor Dental Lab."),
    "ankhor-dental-lab": ("Dental Lab Website & SEO – Ankhor Dental Lab Case Study",
                          "A new website for Ankhor Dental Lab with a full product catalogue, technology pages, SEO on every page and Send a Case everywhere."),
    "akeela-dental-care": ("Dental Clinic Website & SEO – Akeela Dental Care Case Study",
                           "A new website for Akeela Dental Care with a page for every treatment, full SEO and WhatsApp appointment booking."),
    "akeela-whatsapp-automation": ("WhatsApp Booking Automation for a Dental Clinic – Case Study",
                                   "A dental clinic booking flow where every appointment request arrives in WhatsApp with the patient's name, number and treatment, ready to confirm."),
    "guggulr-instagram": ("Instagram Creatives for a Gift Box Brand – Guggulr Case Study",
                          "Instagram content planning and product creatives designed in Canva for Guggulr, a premium gift box brand, keeping every post on-brand."),
    "ankhor-referral-program": ("Diwali Referral Program Page & Dashboard – Ankhor Case Study",
                                "A Diwali Refer & Earn campaign for Ankhor Dental Lab: a landing page with a countdown, personal referral links and a dashboard and app."),
    "google-business-profile": ("Google Business Profile Optimisation – Local SEO Case Study",
                                "Local SEO work: optimising Google Business Profiles so nearby customers find accurate details, photos and reviews and choose the business."),
}

# Questions people search about Sakthi; shown on the home page with FAQPage schema
FAQS = [
    ("Who is S Saktheeswaran?",
     "S. Saktheeswaran (Sakthi) is a digital marketing and SEO expert from Tamil Nadu, India, and the founder & CEO of "
     "Astra Nexora, a digital marketing agency. He works on SEO, websites, Google and Meta ads and marketing automation."),
    ("Who is the founder of Astra Nexora?",
     "Astra Nexora was founded in 2025 by S. Saktheeswaran (Sakthi). He leads strategy and delivery for every client himself."),
    ("What services does Sakthi offer?",
     "SEO and local SEO, website design and development (WordPress, Wix and custom builds), Google and Meta ads, n8n and "
     "WhatsApp automation, social media content and GA4 reporting."),
    ("Do you work with clients outside Tamil Nadu?",
     "Yes. Sakthi is based in Tamil Nadu and works with businesses across India, remotely over WhatsApp, email and calls."),
    ("Are you open to full-time roles as well as freelance projects?",
     "Yes, both. Recruiters and businesses can reach Sakthi on WhatsApp or at saktheesw2005@gmail.com."),
]

# Pages for the searches people use to find someone like Sakthi
KEYWORD_PAGES = [
    {
        "slug": "seo-expert-tamil-nadu",
        "nav": "SEO expert",
        "seo_title": "SEO Expert in Tamil Nadu | S Saktheeswaran (Sakthi)",
        "desc": ("Looking for an SEO expert in Tamil Nadu? S. Saktheeswaran, founder of Astra Nexora, does technical, "
                 "on-page and local SEO and Google Business Profile optimisation."),
        "kicker": "SEO · Tamil Nadu",
        "h1": "SEO expert in <em>Tamil Nadu</em>",
        "lead": ("I help businesses in Tamil Nadu and across India get found on Google: in search results, on Google "
                 "Maps and in AI answers. I run every audit and fix myself, so you always know who is doing the work."),
        "sections": [
            ("Why SEO matters for your business",
             "Most customers start on Google. If your website isn't on the first page, or your business doesn't show on "
             "Maps when someone nearby searches, those calls and enquiries go to a competitor. Good SEO makes sure the "
             "people already looking for what you sell find you first."),
            ("How I work",
             "First an audit of your website, your Google Business Profile and the competitors ranking above you. Then I "
             "fix what holds you back, build pages around what your customers actually search for, and set up Search "
             "Console and GA4 so we can see what's working. You get a clear monthly report in plain language."),
            ("What I won't promise",
             "No honest SEO expert can guarantee the number one spot. What I can promise is a clear plan, real fixes you "
             "can see on your site, and reporting that shows exactly what changed. SEO usually starts showing results in "
             "three to six months."),
        ],
        "list_title": "SEO services",
        "list": ["Technical SEO audit and fixes", "On-page SEO: titles, content and internal links",
                 "Local SEO and Google Business Profile optimisation", "Keyword research for your services and city",
                 "Schema / structured data", "Search Console, GA4 and monthly reporting",
                 "AI search (AEO) basics so you show up in AI answers"],
        "projects": ["ankhor-dental-lab", "google-business-profile", "astra-nexora-website"],
        "faqs": [
            ("How long does SEO take to show results?",
             "Usually three to six months, depending on your website, your competition and how much content you need. "
             "Technical fixes and Google Business Profile updates can help sooner."),
            ("Can you guarantee first page rankings?",
             "No. Nobody controls Google's rankings, and anyone who guarantees them is guessing. I focus on the work that "
             "moves rankings and show you the results every month."),
            ("Do you do local SEO for clinics and shops?",
             "Yes. Most of my SEO work is local: dental clinics, a dental lab and local businesses that need to show up "
             "on Google Maps and nearby searches."),
            ("How much does SEO cost?",
             "It depends on the size of your website and your goals. Send me your website on WhatsApp and I'll reply with "
             "what I'd fix first and a quote."),
        ],
    },
    {
        "slug": "digital-marketing-expert-tamil-nadu",
        "nav": "Digital marketing expert",
        "seo_title": "Digital Marketing Expert in Tamil Nadu | S Saktheeswaran",
        "desc": ("S. Saktheeswaran (Sakthi) is a digital marketing expert in Tamil Nadu and founder of Astra Nexora: "
                 "SEO, websites, Google and Meta ads, social media and automation."),
        "kicker": "Digital marketing · Tamil Nadu",
        "h1": "Digital marketing expert in <em>Tamil Nadu</em>",
        "lead": ("I'm Sakthi, founder of Astra Nexora. I plan and run digital marketing for businesses in Tamil Nadu and "
                 "across India: search, websites, ads, social media and the automation that ties it together."),
        "sections": [
            ("One person who sees the whole picture",
             "Many businesses hire one person for the website, another for ads and someone else for social media, and "
             "nobody connects the dots. I work across all of it, so your website, your Google presence, your ads and "
             "your WhatsApp follow-up all work towards the same goal: more enquiries."),
            ("Who I work with",
             "Dental clinics, a dental laboratory, a premium gift box brand, startups and small businesses. Each project "
             "on this site shows the problem, what I built and what changed."),
            ("How we start",
             "Send me your website or Instagram on WhatsApp. I'll look at where you're losing customers today and reply "
             "with the first three things I'd fix. No obligation."),
        ],
        "list_title": "What I do",
        "list": ["SEO and local SEO", "Website design and development (WordPress, Wix, custom)",
                 "Google Ads and Meta Ads with conversion tracking", "Social media strategy and creatives",
                 "WhatsApp and email automation with n8n", "GA4 and Search Console reporting"],
        "projects": ["akeela-dental-care", "akeela-whatsapp-automation", "guggulr-instagram"],
        "faqs": [
            ("What does a digital marketing expert do?",
             "Plans and runs the channels that bring a business customers online: search, website, ads, social media "
             "and follow-up. The job is to turn those into calls, enquiries and sales, and to measure it."),
            ("Do you work with small businesses?",
             "Yes. Most of my clients are small and growing businesses, and I keep the work practical: what brings in "
             "enquiries first."),
            ("Do you work outside Tamil Nadu?",
             "Yes, with businesses across India. Everything runs remotely over WhatsApp, email and calls."),
        ],
    },
    {
        "slug": "marketing-automation-expert",
        "nav": "Automation expert",
        "seo_title": "n8n & WhatsApp Automation Expert in India | S Saktheeswaran",
        "desc": ("n8n and WhatsApp automation for clinics and small businesses: booking flows, dashboards, email and app "
                 "notifications. Built by S. Saktheeswaran, Tamil Nadu."),
        "kicker": "Automation · n8n · WhatsApp",
        "h1": "n8n &amp; WhatsApp <em>automation expert</em>",
        "lead": ("I build automation that removes the repetitive work from your day: bookings that arrive ready to "
                 "confirm, notifications that go out on their own, and one place to see everything."),
        "sections": [
            ("Where automation helps most",
             "If your team copies details from WhatsApp into a spreadsheet, types the same confirmation again and again, "
             "or misses enquiries during busy hours, that work can be automated. Your customers keep using WhatsApp and "
             "email, the tools they already know."),
            ("What I've built",
             "A WhatsApp booking flow for a dental clinic, where every request reaches the team with the patient's name, "
             "number and treatment. And an online scan booking system for a dental lab, with a team dashboard, email and "
             "app notifications, and WhatsApp and email confirmations."),
            ("How it works",
             "I map your current process first, then remove steps instead of adding software. Most flows use n8n, "
             "WhatsApp, email and a simple dashboard. You get a timeline before we start."),
        ],
        "list_title": "Automation I build",
        "list": ["Booking forms that open WhatsApp with the details filled in", "n8n workflows connecting forms, email, sheets and CRMs",
                 "Team dashboards for incoming requests", "Email and app notifications for new bookings",
                 "Automatic confirmations and status updates", "Lead capture and follow-up sequences"],
        "projects": ["akeela-whatsapp-automation", "ankhor-case-booking-automation"],
        "faqs": [
            ("What is n8n?",
             "n8n is a workflow automation tool. It connects apps like forms, WhatsApp, email, Google Sheets and CRMs, "
             "so that when something happens in one, the next steps happen automatically."),
            ("Do I need the WhatsApp Business API?",
             "Not always. Many booking flows work by opening a pre-filled WhatsApp chat. Fully automatic replies need "
             "the WhatsApp Business API, which I can help set up."),
            ("How long does an automation project take?",
             "It depends on the flow. A booking form that sends requests to WhatsApp is quick; a dashboard with "
             "notifications takes longer. You get a timeline before we start."),
        ],
    },
]

# More depth for the keyword pages: extra sections, a step-by-step process, tools and FAQs
_KW_MORE = {
    "seo-expert-tamil-nadu": {
        "sections": [
            ("Technical SEO: fixing the foundations",
             "Google has to be able to crawl, understand and trust your website before it ranks it. I check indexing in "
             "Search Console, page speed and Core Web Vitals, broken links, duplicate or missing titles and descriptions, "
             "heading structure, mobile layout and structured data. On the websites I build, like Akeela Dental Care and "
             "Ankhor Dental Lab, these are set up from day one."),
            ("On-page SEO and content",
             "Every important service needs its own page, written around what customers actually type into Google: the "
             "service, the problem and the area. I do the keyword research, then rewrite titles, headings and content so "
             "each page clearly answers one search, and link related pages together so visitors and Google can find them."),
            ("Local SEO and Google Business Profile",
             "For clinics, labs and shops, most enquiries come from the map pack. I audit and complete your Google "
             "Business Profile: the right categories and services, accurate hours and contact details, real photos, and "
             "a steady flow of reviews. Your name, address and phone number are kept consistent everywhere they appear."),
            ("AI search (AEO)",
             "More people now ask ChatGPT, Gemini and Google's AI Overviews instead of scrolling results. Clear answers, "
             "FAQ sections, structured data and consistent information about your business across the web make it more "
             "likely those tools mention you."),
            ("Reporting you can understand",
             "I set up Google Search Console and GA4 properly, then send a monthly report in plain language: which "
             "searches you appear for, how many people clicked, which pages bring enquiries and what I'm working on next."),
        ],
        "process": [
            ("Audit", "Website, Google Business Profile, Search Console data and the competitors ranking above you."),
            ("Plan", "The keywords worth winning, the pages to create or fix, and the order to do it in."),
            ("Fix & build", "Technical fixes, on-page optimisation, new service pages and local SEO updates."),
            ("Measure", "Search Console and GA4 tracking with a clear monthly report and next steps."),
        ],
        "tools": ["Google Search Console", "Google Analytics 4", "Rank Math", "WordPress", "Google Business Profile",
                  "PageSpeed Insights", "Schema markup"],
        "faqs": [
            ("What's included in an SEO audit?",
             "Indexing and crawl checks, page speed, titles and descriptions, headings, internal links, mobile usability, "
             "structured data, your Google Business Profile and a look at the competitors ranking above you. You get a "
             "prioritised list of what to fix first."),
            ("Do I need a new website to improve SEO?",
             "Usually not. Most websites can be fixed and improved. I only recommend a rebuild when the current site is "
             "too slow or too hard to change to be worth fixing."),
            ("Do you write the content too?",
             "Yes. I write or rewrite service pages, titles, descriptions and FAQs based on the keyword research, and you "
             "approve everything before it goes live."),
        ],
    },
    "digital-marketing-expert-tamil-nadu": {
        "sections": [
            ("Search: SEO and Google Business Profile",
             "Showing up when people search for your service is usually the cheapest source of steady enquiries. I handle "
             "technical and on-page SEO, local SEO and Google Business Profile optimisation, and track it all in Search "
             "Console and GA4."),
            ("Websites that turn visitors into enquiries",
             "Your website should make it obvious what you offer and how to contact you, especially on mobile. For Akeela "
             "Dental Care I reorganised the treatments, improved readability and made booking, calls and WhatsApp easy "
             "to reach from every page. I build on WordPress, Wix, Framer and custom code, depending on what fits."),
            ("Ads: Google and Meta",
             "When you need enquiries faster, I set up Google Ads and Meta Ads campaigns with proper conversion tracking, "
             "so you can see which campaigns bring calls and messages, not just clicks."),
            ("Social media and creatives",
             "Consistent, on-brand content builds trust. I plan content and design posters, product creatives and reels; "
             "for Guggulr, a premium gift box brand, I created a series of product creatives that kept every post on-brand."),
            ("Automation that follows up for you",
             "Leads go cold when nobody replies. I connect forms, WhatsApp and email with n8n so enquiries reach your team "
             "instantly and confirmations go out on their own."),
        ],
        "process": [
            ("Understand", "Your business, your customers, where enquiries come from today and where they're lost."),
            ("Plan", "The channels worth focusing on first, with clear goals for each one."),
            ("Execute", "Website, SEO, ads, content and automation, done by me, not handed off."),
            ("Measure & improve", "GA4 and Search Console reporting, then adjust based on what brings enquiries."),
        ],
        "tools": ["Google Analytics 4", "Google Search Console", "Google Ads", "Meta Ads", "WordPress", "Wix", "Framer",
                  "Canva", "CapCut", "n8n"],
        "faqs": [
            ("Which digital marketing channel should I start with?",
             "For most local businesses: a clear website, a complete Google Business Profile and basic SEO first, because "
             "they keep working without ad spend. Ads come next when you need faster results."),
            ("Can you handle everything, or only one part?",
             "Both. Some clients hire me for one thing, like SEO or a website; others want the website, search, social "
             "and automation handled together."),
        ],
    },
    "marketing-automation-expert": {
        "sections": [
            ("Case study: WhatsApp bookings for a dental clinic",
             "Akeela Dental Care was getting calls during busy clinic hours and enquiries that were easy to miss. I built "
             "a booking form (name, phone, treatment and message) that opens WhatsApp with the request filled in, set up "
             "WhatsApp automation for booking enquiries and added call and WhatsApp buttons that stay on screen on mobile. "
             "Now every request reaches the team with the patient's details, ready to confirm in one reply."),
            ("Case study: scan and case booking for a dental lab",
             "Ankhor Dental Lab received cases and scan bookings through calls and scattered WhatsApp messages. I built "
             "an online case portal where clinics send case details and scan files, with a team dashboard, instant email "
             "and WhatsApp notifications for every new case and a mobile app to check cases. I also built a scan booking "
             "platform with live slots and its own dashboard, and a Diwali referral program page with a dashboard."),
            ("What n8n makes possible",
             "n8n connects the tools you already use. A new form entry can create a row in a sheet, send an email, notify "
             "the team, add the lead to a CRM and schedule a follow-up, all without anyone copying and pasting."),
            ("Keeping it simple to run",
             "Automation should make your day easier, not add another tool to manage. I document each flow, keep it "
             "close to how your team already works, and make sure someone gets alerted if anything fails."),
        ],
        "process": [
            ("Map", "How enquiries and bookings flow today, and where time is lost or messages get missed."),
            ("Design", "The simplest flow that removes those steps, using the tools you already have."),
            ("Build & test", "n8n workflows, forms, WhatsApp and email messages, dashboards and notifications."),
            ("Hand over", "Documentation, a walkthrough for your team and alerts if a step fails."),
        ],
        "tools": ["n8n", "WhatsApp Business", "Email automation", "Google Sheets", "Dashboards", "App notifications"],
        "faqs": [
            ("Which businesses benefit most from automation?",
             "Any business that handles bookings or enquiries every day: clinics, labs, salons, service businesses and "
             "online stores. If your team repeats the same messages or copies data by hand, there's something to automate."),
            ("Can automation work with my existing website?",
             "Yes. Forms and booking flows can be added to most websites, including WordPress and Wix, and connected to "
             "n8n without rebuilding the site."),
        ],
    },
}
for _k in KEYWORD_PAGES:
    _m = _KW_MORE[_k["slug"]]
    _k["sections"] = _k["sections"] + _m["sections"]
    _k["process"] = _m["process"]
    _k["tools"] = _m["tools"]
    _k["faqs"] = _k["faqs"] + _m["faqs"]

# Articles under /insights/: one piece of work each, written from Sakthi's own projects
ARTICLES = [
    {
        "slug": "seo-for-dental-clinics-tamil-nadu",
        "seo_title": "Dental Clinic Website & SEO: Akeela Dental Care Case Study",
        "desc": ("How I built the Akeela Dental Care website and did its SEO: a page for every treatment, on-page and "
                 "technical SEO, reviews and tracking. A practical guide for dental clinics in Tamil Nadu."),
        "h1": "Dental clinic website &amp; SEO: <em>Akeela Dental Care</em>",
        "kicker": "Website & SEO · Akeela Dental Care",
        "date": "2026-11-07",
        "read": "6 min read",
        "intro": ("When someone needs a dentist, they search \"dental implants near me\" or \"root canal treatment in T. "
                  "Nagar\", open the first few results and call. I built the Akeela Dental Care website and did its SEO "
                  "so the clinic shows up for those searches and patients find a clear answer when they land. This is "
                  "how the website was planned and what I did for SEO, so any dental clinic in Tamil Nadu can apply it."),
        "sections": [
            ("Planning the website around treatments",
             ["Patients search for treatments, not for \"services\". So the website is built around them: dental "
              "implants, root canal treatment, aligners, orthodontics, cosmetic dentistry and more, each with its own "
              "page that explains the problem, the treatment, what to expect and how to book.",
              "A single \"Services\" page with ten bullet points can't rank for ten different searches. Ten focused pages "
              "can, and each one answers the patient's question directly."]),
            ("A treatments hub that links everything",
             ["A treatments overview page links every treatment page together, and each treatment page links back. "
              "This helps patients move between related treatments and helps Google understand how the site fits "
              "together."]),
            ("On-page SEO on every page",
             ["Every page has a unique title and description written around what patients search, with the treatment "
              "and the area in it, one clear H1, readable headings, compressed images and internal links to related "
              "treatments. Structured data tells Google this is a dental clinic and where it is."]),
            ("Reviews that build trust",
             ["Reviews are what patients read before they call, and they matter for local rankings too. The site has a "
              "dedicated patient reviews page with real stories and ratings, and the clinic asks happy patients for "
              "Google reviews."]),
            ("Mobile first, with booking on every page",
             ["Most dental searches happen on a phone, so every page is designed for mobile first, with call, WhatsApp "
              "and Book Appointment buttons always within reach. Booking itself has its own system, which I've written "
              "about separately."]),
            ("Search Console and tracking",
             ["Google Search Console is set up to watch indexing and see which searches bring visitors to each page. "
              "Calls, WhatsApp clicks and appointment requests are what matter, so those are what we track and review."]),
        ],
        "checklist": ["One page per treatment", "A treatments hub linking every page",
                      "Unique title and description with the treatment and area", "One H1 and clear headings",
                      "Structured data for a dental clinic", "A real reviews page", "Search Console set up and checked"],
        "projects": ["akeela-dental-care"],
        "faqs": [
            ("How long does SEO take for a dental clinic?",
             "Usually three to six months for treatment pages to rank well, depending on competition in your area. A "
             "complete Google Business Profile and reviews can bring more calls sooner."),
            ("Do I need a separate page for each treatment?",
             "Yes, for the treatments you want patients to find you for. Each page can then rank for its own searches "
             "and answer that patient's question properly."),
        ],
    },
    {
        "slug": "whatsapp-appointment-booking-dental-clinic",
        "seo_title": "WhatsApp Appointment Booking for a Dental Clinic: Akeela Case Study",
        "desc": ("How I set up WhatsApp appointment booking for Akeela Dental Care: a short form that opens WhatsApp "
                 "with the request filled in, plus call and WhatsApp buttons on every page."),
        "h1": "WhatsApp appointment booking for <em>Akeela Dental Care</em>",
        "kicker": "Booking · Akeela Dental Care",
        "date": "2026-11-07",
        "read": "4 min read",
        "intro": ("A dental clinic is busiest exactly when patients try to call. Phones ring during treatments, "
                  "enquiries get missed and patients book somewhere else. For Akeela Dental Care I set up appointment "
                  "booking on WhatsApp, the app patients already use every day, so every request reaches the clinic "
                  "with the details it needs."),
        "sections": [
            ("The problem: missed calls and slow replies",
             ["Patients called during busy clinic hours or sent enquiries that were easy to miss, so appointment "
              "requests were slow to answer. Every missed call is a patient who might not call back."]),
            ("A short form that opens WhatsApp",
             ["The booking page asks only what the clinic needs: name, phone number, treatment and an optional message. "
              "When the patient submits it, WhatsApp opens with the request already written; they just press send.",
              "There's no app to download and no account to create, and the clinic gets every request in the same clear "
              "format."]),
            ("Call and WhatsApp buttons on every page",
             ["On mobile, Call and WhatsApp buttons stay fixed at the bottom of the screen on every page, so a patient "
              "reading about implants or root canal treatment can book the moment they decide."]),
            ("The result",
             ["Every appointment request reaches the clinic on WhatsApp with the patient's name, number and treatment, "
              "so the team can confirm it in one reply."]),
            ("What other clinics can copy",
             ["Ask for as little as possible, use the channel patients already use, and make the booking button "
              "impossible to miss on a phone. It's one of the cheapest changes a clinic can make, and one of the most "
              "effective."]),
        ],
        "checklist": ["Ask only for name, phone, treatment and message", "Open WhatsApp with the message pre-filled",
                      "Call and WhatsApp buttons fixed on mobile", "A Book Appointment button on every page",
                      "Reply to every request quickly"],
        "projects": ["akeela-whatsapp-automation"],
        "faqs": [
            ("Do I need the WhatsApp Business API for this?",
             "No. A booking form that opens a pre-filled WhatsApp chat works with any WhatsApp number. Fully automatic "
             "WhatsApp replies are what need the Business API."),
            ("Will patients really book on WhatsApp?",
             "Yes. Most patients already use WhatsApp every day, so sending a ready-made message is easier for them than "
             "filling a long form or calling during busy hours."),
        ],
    },
    {
        "slug": "dental-lab-website-seo",
        "seo_title": "Dental Lab Website & SEO: Ankhor Dental Lab Case Study",
        "desc": ("How I built the Ankhor Dental Lab website and did its SEO: services, technology and a product catalogue "
                 "with a page for every product, built so clinics can find the lab and send a case."),
        "h1": "Dental lab website &amp; SEO: <em>Ankhor Dental Lab</em>",
        "kicker": "Website & SEO · Ankhor Dental Lab",
        "date": "2026-11-07",
        "read": "5 min read",
        "intro": ("A dental lab's customers are dentists, and they look for very specific things: zirconia, implant "
                  "prostheses, dentures, digital workflows. I built the Ankhor Dental Lab website and did its SEO so "
                  "dentists can find the right product, trust the lab and send a case in a few clicks."),
        "sections": [
            ("What the website needed to do",
             ["Explain what the lab makes and how it works, show the technology behind it, and make sending a case the "
              "obvious next step from every page."]),
            ("A product catalogue with a page for every product",
             ["The products section works like a catalogue: categories such as fixed, implant, removable, digital and "
              "specialised, with search and a page for each product. Dentists can go straight to zirconia or a specific "
              "implant prosthesis instead of reading one long list."]),
            ("Technology and services pages",
             ["A technology page shows the lab's fully digital workflow, from scanning and CAD/CAM design to milling, "
              "printing and finishing, and the services pages explain what the lab offers. These pages build trust with "
              "dentists comparing labs."]),
            ("SEO for every page",
             ["Every page has its own title and description, clear headings and internal links between related "
              "products, and the site has a sitemap so Google can find all the product pages. Because each product has "
              "its own page, each one can show up for its own searches."]),
            ("Send a Case everywhere",
             ["A Send a Case button sits in the header on every page, so a dentist who finds the right product can start "
              "a case immediately. The case portal behind that button is a separate system, which I've written about on "
              "its own."]),
        ],
        "checklist": ["Product catalogue with a page per product", "Categories and search for products",
                      "Technology and services pages that build trust", "Unique titles and descriptions",
                      "Sitemap covering every product page", "Send a Case on every page"],
        "projects": ["ankhor-dental-lab"],
        "faqs": [
            ("Why does a dental lab need a page for each product?",
             "Dentists search for specific restorations. A page for each product can show up for those searches and give "
             "the dentist the details they need before sending a case."),
            ("How do dentists contact the lab from the website?",
             "Through the Send a Case button on every page, as well as call and WhatsApp links."),
        ],
    },
    {
        "slug": "dental-lab-case-portal-automation",
        "seo_title": "Dental Lab Case Portal & Dashboard: Ankhor Case Study",
        "desc": ("How I built Ankhor Dental Lab's online case portal: clinics send case details and scans, the team gets "
                 "email and WhatsApp alerts, and every case is tracked in a dashboard and a mobile app."),
        "h1": "Case portal &amp; dashboard for <em>Ankhor Dental Lab</em>",
        "kicker": "Case portal · Ankhor Dental Lab",
        "date": "2026-11-07",
        "read": "5 min read",
        "intro": ("A dental lab runs on cases. Before this system, Ankhor received them through calls and scattered "
                  "WhatsApp messages, and the team had no single place to see what had come in. I built an online case "
                  "portal with a dashboard, instant email and WhatsApp notifications, and a mobile app so the team can "
                  "check cases anywhere."),
        "sections": [
            ("The problem: cases scattered across calls and chats",
             ["Cases arrived by phone and WhatsApp, details had to be copied by hand, and nobody could see every open "
              "case in one place."]),
            ("Clinics send cases online",
             ["The Send a Case form asks for everything the lab needs in one go: doctor and clinic details, case type and "
              "material, number of units, shade, a shade photo and the scan files in STL, OBJ or PLY format. Every case "
              "arrives complete and in the same format."]),
            ("Instant email and WhatsApp notifications",
             ["The moment a clinic submits a case, the lab gets an email and a WhatsApp notification with the details. "
              "Nobody has to keep checking an inbox or scroll through chats."]),
            ("One dashboard for every case",
             ["Every case lands in a dashboard where the team can see what has arrived and track it, instead of "
              "searching through messages."]),
            ("A mobile app to check cases on the go",
             ["The team can also check cases from a mobile app, so they stay on top of new work away from the desk."]),
        ],
        "checklist": ["One online form with every case detail", "Scan upload: STL, OBJ, PLY",
                      "Shade photo upload", "Email alert for every new case", "WhatsApp alert for every new case",
                      "A dashboard for all cases", "A mobile app for the team"],
        "projects": ["ankhor-case-booking-automation"],
        "faqs": [
            ("Can clinics upload scan files through the portal?",
             "Yes. The case form accepts STL, OBJ and PLY scan files, along with a shade photo and the case details."),
            ("How does the lab know a new case has arrived?",
             "The team gets an email and a WhatsApp notification as soon as a case is submitted, and the case appears in "
             "the dashboard and the app."),
        ],
    },
    {
        "slug": "dental-scan-booking-platform",
        "seo_title": "Intraoral Scan Booking Platform & Dashboard: Ankhor Case Study",
        "desc": ("How I built Ankhor Dental Lab's scan booking platform: clinics pick a free slot online, taken slots show "
                 "as booked instantly, and the team manages every booking from a dashboard."),
        "h1": "Scan booking platform for <em>Ankhor Dental Lab</em>",
        "kicker": "Scan booking · Ankhor Dental Lab",
        "date": "2026-11-07",
        "read": "4 min read",
        "intro": ("Ankhor offers chairside intraoral scanning: clinics without a scanner book a slot, and the lab's team "
                  "comes to the clinic and scans the patient. Booking those visits by phone meant back-and-forth and "
                  "double bookings, so I built an online scan booking platform with its own dashboard."),
        "sections": [
            ("Pick a day and time",
             ["Clinics choose a free day and a free time slot on the Book a Scan page. Available and booked slots are "
              "shown clearly, so there's no guessing."]),
            ("Clinic and case details in one form",
             ["The same page collects the clinic name, doctor, phone, email, address, number of cases, case type "
              "(crown/bridge or implant), whether the scan body is ready and any notes. The team arrives knowing exactly "
              "what to expect."]),
            ("No double bookings",
             ["As soon as a slot is booked it shows as taken, so two clinics can't book the same visit."]),
            ("A dashboard for the team",
             ["Every booking goes into a dashboard where the team manages the schedule, instead of tracking visits on "
              "paper or in chats."]),
            ("A clear four-step process",
             ["The page explains the process in four steps: book a slot, the lab confirms, the team visits and scans, and "
              "the lab makes the case. It also lists what to prepare before the visit and the pricing."]),
        ],
        "checklist": ["Free and booked slots shown clearly", "Clinic and case details in the same form",
                      "Slots marked booked instantly", "A dashboard to manage visits", "Steps and preparation explained"],
        "projects": ["ankhor-case-booking-automation"],
        "faqs": [
            ("Can two clinics book the same slot?",
             "No. Once a slot is booked it shows as taken straight away."),
            ("Can clinics book on a phone?",
             "Yes. The booking page works on mobile, with the same day and time picker."),
        ],
    },
    {
        "slug": "dental-lab-referral-program",
        "seo_title": "Diwali Referral Program Page, Dashboard & App: Ankhor Case Study",
        "desc": ("How I built a Diwali Refer & Earn program for Ankhor Dental Lab: a campaign page, a referral dashboard "
                 "and app, with personal referral links shared on WhatsApp."),
        "h1": "Diwali referral program for <em>Ankhor Dental Lab</em>",
        "kicker": "Referral program · Ankhor Dental Lab",
        "date": "2026-11-07",
        "read": "4 min read",
        "intro": ("Dentists trust other dentists' recommendations more than any ad. For Diwali, Ankhor Dental Lab wanted to "
                  "turn that into new clinics, so I built a Refer & Earn program: a campaign page, a referral dashboard "
                  "and an app to track it all."),
        "sections": [
            ("The offer",
             ["Refer three doctors and earn two free premium zirconia crowns, worth ₹5,000, on cases booked before "
              "the offer ends. Referred dentists get a welcome offer on their first case, and there's a surprise reward "
              "for the first referral."]),
            ("A campaign page built to convert",
             ["The Refer & Earn page leads with the reward, shows a live countdown to the end of the offer, explains how "
              "it works in three simple steps and answers common questions. A Get My Referral Link button sits right at "
              "the top."]),
            ("Personal referral links, shared on WhatsApp",
             ["Each dentist gets a personal referral link and can share it with friends on WhatsApp in one tap, which is "
              "how dentists already talk to each other."]),
            ("A dashboard and app to track referrals",
             ["Every referral is tracked in a dashboard and app, so the lab can see who referred whom, which referred "
              "dentists have sent their first case and who has earned a reward, without spreadsheets."]),
            ("What any business can copy",
             ["Make the reward clear and worth it, add a real deadline, make sharing one tap on the channel people "
              "already use, and track every referral automatically so rewards are fair and on time."]),
        ],
        "checklist": ["A clear reward worth sharing", "A real deadline with a countdown", "Three simple steps",
                      "Personal referral links", "One-tap WhatsApp sharing", "Dashboard and app to track referrals"],
        "projects": ["ankhor-referral-program"],
        "faqs": [
            ("How do dentists share their referral link?",
             "Each dentist gets a personal link and can share it on WhatsApp in one tap from the page."),
            ("How are referrals tracked?",
             "In a referral dashboard and app, which show each referral and when the referred dentist sends their first case."),
        ],
    },
]

# Covers and in-article screenshots (from each client's own website); figures are keyed by section index
ARTICLE_MEDIA = {
    "seo-for-dental-clinics-tamil-nadu": {
        "cover": ("blog/cover-akeela-website", "Akeela Dental Care website on desktop and mobile"),
        "figs": {
            0: [("blog/akeela-implants", "The dental implants page."),
                ("blog/akeela-rct", "A separate root canal treatment page, so each treatment can rank for its own searches.")],
            1: [("blog/akeela-treatments", "The treatments overview page links every treatment page together.")],
            3: [("blog/akeela-reviews", "The patient reviews page puts real stories and ratings front and centre.")],
            4: [("work/akeela-1", "The home page on desktop."), ("work/akeela-m", "The home page on mobile, with Call and WhatsApp buttons.")],
        },
    },
    "whatsapp-appointment-booking-dental-clinic": {
        "cover": ("blog/cover-akeela-booking", "Akeela Dental Care appointment booking on desktop and mobile"),
        "figs": {
            1: [("work/akeelawa-1", "The appointment form: name, phone, treatment and message."),
                ("work/akeelawa-m", "On mobile, with Call and WhatsApp buttons fixed at the bottom.")],
            2: [("blog/akeela-book", "The booking page, with Book Appointment and WhatsApp buttons.")],
        },
    },
    "dental-lab-website-seo": {
        "cover": ("blog/cover-ankhor-website", "Ankhor Dental Lab website on desktop and mobile"),
        "figs": {
            0: [("work/ankhor-1", "The home page."), ("work/ankhor-m", "The home page on mobile.")],
            1: [("blog/ankhor-products", "The product catalogue, with categories and search."),
                ("blog/ankhor-zirconia", "A product page: metal-free zirconia restorations.")],
            2: [("blog/ankhor-technology", "The technology page: a fully digital lab under one roof.")],
        },
    },
    "dental-lab-case-portal-automation": {
        "cover": ("blog/cover-ankhor-case-portal", "Ankhor Dental Lab Send a Case portal"),
        "figs": {
            1: [("blog/ankhor-send-case", "The Send a Case form: case details, shade photo and STL, OBJ or PLY scan upload.")],
        },
    },
    "dental-scan-booking-platform": {
        "cover": ("blog/cover-ankhor-scan-booking", "Ankhor Dental Lab scan booking on desktop and mobile"),
        "figs": {
            0: [("work/ankhorcase-2", "Choose a day, choose a time, then add clinic and case details."),
                ("work/ankhorcase-m", "Slot booking on mobile, with free and booked times.")],
            4: [("work/ankhorcase-3", "Four simple steps, what to prepare and pricing."),
                ("work/ankhorcase-1", "The chairside intraoral scanning service page.")],
        },
    },
    "dental-lab-referral-program": {
        "cover": ("blog/cover-ankhor-referral", "Ankhor Dental Lab Diwali Refer & Earn page"),
        "figs": {
            1: [("blog/ankhor-refer", "The Refer & Earn page with the reward and a live countdown."),
                ("blog/ankhor-refer-m", "The campaign page on mobile.")],
            2: [("blog/ankhor-refer-2", "Rewards for the referrer and a welcome offer for referred dentists, with WhatsApp sharing.")],
        },
    },
}
for _a in ARTICLES:
    _a.update(ARTICLE_MEDIA[_a["slug"]])

# Detailed case-study story for every project: at-a-glance, challenge, approach, what was built (with screenshots),
# results, services delivered and the matching insight article
STORIES = {
    "astra-nexora-website": {
        "glance": ("A new agency needed a credible online home that explains eight services and turns visitors into enquiries.",
                   "A fast custom website with a page per service, an SEO blog, a free audit offer and WhatsApp as the contact channel.",
                   "A live, indexed agency website with 8 service pages, a blog and an enquiry form that opens WhatsApp."),
        "challenge": ["Astra Nexora is my own agency, founded in 2025. A new agency has no reputation yet, so the website has "
                      "to do the convincing: explain clearly what we do, look as professional as established agencies, and "
                      "give a visitor a simple, low-risk first step.",
                      "Template sites are slow and look like everyone else's, and fake case studies destroy trust the moment "
                      "someone checks them. The site had to be fast, original and honest."],
        "approach": ["One page for each of the eight services, so each can rank for its own searches and answer one question "
                     "well. Honest concept projects instead of invented client results. A free website audit as the main "
                     "offer, because it's easy to say yes to. And WhatsApp as the main contact channel, because that's where "
                     "Indian business owners already are.",
                     "SEO was planned from the start: structured data, a sitemap, a blog with practical guides, and both "
                     "Google Search Console and Bing Webmaster Tools set up on day one."],
        "features": [
            ("Eight service pages", "Every service (SEO, social media, ads, content, websites, branding, email and AI "
             "automation) has its own page with what's included, the process, FAQs and a clear call to action.",
             ["blog/astra-services-grid", "blog/astra-service"]),
            ("A blog that brings in search traffic", "Practical guides on local SEO, Google Business Profile, website audits, "
             "SEO vs ads and AI search, each with key takeaways, FAQs and article schema.",
             ["blog/astra-blog", "blog/astra-post"]),
            ("A founder section that builds trust", "People buy from people. The founder section introduces who runs the "
             "agency, with a short timeline and links to my portfolio and LinkedIn.",
             ["blog/astra-founder"]),
            ("Free audit + WhatsApp enquiry form", "The contact form collects the business details and opens WhatsApp with "
             "everything filled in, so the enquiry arrives in one message and nothing is stored on a server.",
             ["blog/astra-contact", "work/astra-m"]),
        ],
        "results": ["Live at astranexora.netlify.app with 8 service pages, project pages and a blog",
                    "Structured data, sitemap, Google Search Console and Bing submission in place",
                    "Every enquiry arrives on WhatsApp with the visitor's details filled in",
                    "Fast custom build with smooth scroll animations, deployed on Netlify"],
        "services": ["Strategy & content", "Website design & build", "SEO & structured data", "Blog & guides", "Deployment"],
        "insight": None,
    },
    "akeela-dental-care": {
        "glance": ("A dental clinic needed to be found by patients searching for treatments, and to make booking easy.",
                   "A new website built around treatments, with full SEO and booking, calls and WhatsApp on every page.",
                   "A complete clinic website where every treatment has its own page and every page leads to a booking."),
        "challenge": ["Akeela Dental Care has served patients since 1994 and offers a wide range of treatments, from implants "
                      "and root canals to aligners and cosmetic dentistry. Patients search for those treatments by name and "
                      "area, and they decide within seconds whether a clinic looks trustworthy.",
                      "The clinic needed a website that shows up for those searches, explains each treatment clearly and "
                      "makes it effortless to book, especially on a phone."],
        "approach": ["Build the website around treatments, with one dedicated page for each, linked together through a "
                     "treatments overview. Do the SEO properly from the start on every page. Put reviews front and centre. "
                     "And make booking, calls and WhatsApp reachable from every page, designed mobile first."],
        "features": [
            ("A page for every treatment", "Dental implants, root canal treatment, aligners, orthodontics, cosmetic "
             "dentistry and more each have their own page explaining the problem, the treatment, what to expect and how "
             "to book.", ["blog/akeela-implants", "blog/akeela-rct"]),
            ("A treatments hub", "A treatments overview links every treatment page together, helping patients and Google "
             "understand the full range of care.", ["blog/akeela-treatments"]),
            ("Full on-page SEO", "Unique titles and descriptions with the treatment and area, one clear H1, structured "
             "headings, compressed images, internal links, structured data and Google Search Console.", ["work/akeela-2"]),
            ("Reviews and trust", "A dedicated patient reviews page with real stories and ratings, alongside the clinic's "
             "history and experience.", ["blog/akeela-reviews"]),
            ("Mobile first, booking everywhere", "Call, WhatsApp and Book Appointment buttons are always within reach, "
             "with the booking flow built as its own system.", ["work/akeela-1", "work/akeela-m"]),
        ],
        "results": ["A complete clinic website with a dedicated page for each treatment",
                    "SEO set up on every page from day one, with Search Console",
                    "Reviews and clinic credentials visible where patients decide",
                    "Booking, calls and WhatsApp one tap away on every page"],
        "services": ["Website design & build", "Treatment page content", "On-page & technical SEO", "Search Console"],
        "insight": "seo-for-dental-clinics-tamil-nadu",
    },
    "akeela-whatsapp-automation": {
        "glance": ("Appointment requests were missed during busy clinic hours.",
                   "A short booking form that opens WhatsApp with the request filled in, plus call and WhatsApp buttons on every page.",
                   "Every request reaches the clinic on WhatsApp with the patient's details, ready to confirm in one reply."),
        "challenge": ["A dental clinic is busiest exactly when patients try to call. Phones rang during treatments, enquiries "
                      "got buried, and appointment requests were slow to answer. Every missed call is a patient who might "
                      "book somewhere else."],
        "approach": ["Use the app patients already use every day. Instead of a long form that waits for a call back, the "
                     "booking asks for four things and hands the request straight to WhatsApp. No app to download, no "
                     "account to create, and the clinic gets every request in the same clear format."],
        "features": [
            ("A four-field booking form", "Name, phone number, treatment and an optional message. That's all the clinic "
             "needs to confirm an appointment.", ["work/akeelawa-1"]),
            ("WhatsApp opens with the request filled in", "On submit, WhatsApp opens with the patient's details already "
             "written. They just press send, and the clinic receives a complete request.", ["work/akeelawa-m"]),
            ("Booking from every page", "A dedicated booking page, plus Book Appointment, Call and WhatsApp buttons that stay "
             "on screen on mobile, so patients can book the moment they decide.", ["blog/akeela-book"]),
        ],
        "results": ["Every appointment request arrives on WhatsApp with name, number and treatment",
                    "The team confirms bookings in one reply, without calling back",
                    "No missed enquiries during busy clinic hours",
                    "Nothing new for patients to install or learn"],
        "services": ["Booking flow design", "WhatsApp integration", "Mobile UX"],
        "insight": "whatsapp-appointment-booking-dental-clinic",
    },
    "ankhor-dental-lab": {
        "glance": ("A dental lab needed a website that shows everything it makes and makes sending a case easy.",
                   "A new website with a full product catalogue, technology pages, SEO on every page and Send a Case everywhere.",
                   "A complete lab website where every product can be found on its own and every page leads to a case."),
        "challenge": ["Ankhor Dental Lab's customers are dentists, and they look for very specific restorations: zirconia, "
                      "implant prostheses, dentures, digital models. They compare labs on quality, technology and how easy "
                      "they are to work with.",
                      "The lab needed a website that presents its full range clearly, proves its digital workflow and turns "
                      "a visiting dentist into a case."],
        "approach": ["Build the site like a catalogue, with categories, search and a page for every product. Explain the "
                     "lab's fully digital workflow on a technology page. Do the SEO on every page so each product can show "
                     "up in search. And put Send a Case in the header of every page."],
        "features": [
            ("Home page that sets the standard", "A clear promise, the lab's history since 1994, key numbers and quick "
             "routes to products and Send a Case.", ["work/ankhor-1", "work/ankhor-m"]),
            ("A product catalogue", "Categories (fixed, implant, removable, digital, specialised), search and filters, so a "
             "dentist can go straight to what they need.", ["blog/ankhor-products"]),
            ("A page for every product", "Each product, like metal-free zirconia, has its own page with the options, "
             "warranty and a call to action.", ["blog/ankhor-zirconia"]),
            ("A technology page", "Scanning, CAD/CAM design, milling, printing and finishing under one roof, shown with the "
             "lab's real machines and numbers.", ["blog/ankhor-technology"]),
            ("SEO on every page", "Unique titles and descriptions, clear headings, internal links between related products, "
             "image optimisation, a sitemap covering every product page and Search Console.", ["work/ankhor-2"]),
        ],
        "results": ["A full product catalogue with a page for every product",
                    "Every page optimised for search, with a complete sitemap",
                    "The lab's digital workflow presented clearly to dentists",
                    "Send a Case available from every page"],
        "services": ["Website design & build", "Product catalogue", "On-page & technical SEO", "Search Console"],
        "insight": "dental-lab-website-seo",
    },
    "ankhor-case-booking-automation": {
        "glance": ("Cases and scan bookings arrived through calls and scattered WhatsApp messages.",
                   "An online case portal and a scan booking platform, each with a dashboard, plus instant email and WhatsApp alerts and a mobile app.",
                   "Every case and booking lands in one place, and the team hears about new cases instantly."),
        "challenge": ["A dental lab runs on cases. Ankhor received them by phone and WhatsApp, details had to be copied by "
                      "hand, and nobody could see every open case in one place. Scan visits were booked over the phone too, "
                      "which meant back-and-forth and the risk of double bookings."],
        "approach": ["Move both workflows online. Clinics send cases through one form that collects every detail and the scan "
                     "files; the team is alerted instantly by email and WhatsApp and tracks everything in a dashboard and a "
                     "mobile app. Scan visits are booked on a platform with live slots and their own dashboard."],
        "features": [
            ("Send a Case portal", "Doctor and clinic details, case type and material, units, shade, a shade photo and STL, "
             "OBJ or PLY scan files, all in one form, so every case arrives complete.", ["blog/ankhor-send-case"]),
            ("Instant email and WhatsApp alerts", "The moment a case is submitted, the lab gets an email and a WhatsApp "
             "notification with the details. Nobody has to keep checking inboxes or chats.", []),
            ("Case dashboard and mobile app", "Every case lands in a dashboard where the team tracks it, and a mobile app lets "
             "them check cases away from the desk.", []),
            ("Scan booking with live slots", "Clinics pick a free day and time and add their case details. Booked slots show "
             "as taken instantly, so there are no double bookings.", ["work/ankhorcase-2", "work/ankhorcase-m"]),
            ("A clear process for clinics", "The booking page explains the four steps, what to prepare and the pricing, and "
             "every booking goes into a dashboard for the team.", ["work/ankhorcase-3", "work/ankhorcase-1"]),
        ],
        "results": ["Every case arrives complete, with scan files, in the same format",
                    "The team is notified by email and WhatsApp the moment a case comes in",
                    "All cases tracked in one dashboard and a mobile app",
                    "Scan visits booked online with no double bookings"],
        "services": ["Portal & form build", "Dashboards", "Email & WhatsApp automation", "Mobile app", "Booking platform"],
        "insight": "dental-lab-case-portal-automation",
    },
    "ankhor-referral-program": {
        "glance": ("The lab wanted more dentists to try it, and dentists trust other dentists more than ads.",
                   "A Diwali Refer & Earn campaign: a landing page with a countdown, personal referral links and a dashboard and app.",
                   "A complete referral campaign the lab can run and track without spreadsheets."),
        "challenge": ["Ankhor Dental Lab wanted to bring in new clinics during Diwali. Ads reach people, but a dentist is far "
                      "more likely to try a lab their colleague recommends. The lab needed a way to turn happy dentists into "
                      "referrers, and to track who referred whom so rewards are fair."],
        "approach": ["A time-limited Diwali offer with a reward worth sharing, a campaign page built to convert, personal "
                     "referral links that share to WhatsApp in one tap, and a dashboard and app that track every referral "
                     "automatically."],
        "features": [
            ("A campaign page built to convert", "The reward up front (refer 3 doctors, get 2 free premium zirconia crowns), "
             "a live countdown to the offer's end and a Get My Referral Link button.", ["blog/ankhor-refer", "blog/ankhor-refer-m"]),
            ("Rewards on both sides", "A surprise reward for the first referral, the main reward for three, and a welcome "
             "offer for every referred dentist, explained in three simple steps.", ["blog/ankhor-refer-2"]),
            ("One-tap WhatsApp sharing", "Each dentist gets a personal referral link and shares it on WhatsApp, where "
             "dentists already talk to each other.", []),
            ("Referral dashboard and app", "Every referral is tracked: who referred whom, which referred dentists have sent "
             "their first case and who has earned a reward.", []),
        ],
        "results": ["A live Diwali campaign page with countdown and FAQs",
                    "Personal referral links shared on WhatsApp in one tap",
                    "Referrals and rewards tracked in a dashboard and app",
                    "No spreadsheets or manual tracking"],
        "services": ["Campaign strategy", "Landing page", "Referral dashboard", "Mobile app"],
        "insight": "dental-lab-referral-program",
    },
    "guggulr-instagram": {
        "glance": ("A premium gift box brand's Instagram looked inconsistent from post to post.",
                   "A planned content calendar and a recognisable creative style for every product post, designed in Canva.",
                   "A consistent, premium feed of product creatives for the festive season."),
        "challenge": ["Guggulr sells premium gift boxes, and buyers judge premium products by how they look. When every post "
                      "looks different, the brand feels less premium and harder to remember."],
        "approach": ["Plan the content around the festive season and each collection, then design every creative in one "
                     "consistent style: rich festive settings, the product as the hero, elegant script names for each "
                     "collection, the logo and a QR code in the same place every time."],
        "features": [
            ("Collection launches", "Each gift collection, like Trésor Céleste, Édition Velaris and Paon Royal, gets its own "
             "named creative so buyers remember it.", ["work/guggulr-02", "work/guggulr-08"]),
            ("Offer posts", "Festive offers like 10% off are built into the same style, so promotions still look premium.",
             ["work/guggulr-07"]),
            ("Collages and multi-view posts", "Collage layouts show a box from several angles or several boxes together.",
             ["work/guggulr-10", "work/guggulr-04"]),
            ("Seasonal greetings and hampers", "Christmas greetings and dry fruit hampers keep the feed active between launches.",
             ["work/guggulr-13", "work/guggulr-11"]),
        ],
        "results": ["13 product creatives in one consistent, premium style",
                    "Each collection launched with its own named post",
                    "Offers presented without cheapening the brand",
                    "Published on the brand's Instagram"],
        "services": ["Content planning", "Creative design (Canva)", "Editing", "Instagram publishing"],
        "insight": None,
    },
    "google-business-profile": {
        "glance": ("Incomplete business profiles were costing local visibility on Google Search and Maps.",
                   "Complete, accurate profiles with the right categories, services, photos and regular updates.",
                   "Optimised listings that give nearby customers the right details and a reason to choose the business."),
        "challenge": ["For local businesses, the Google Business Profile is often the first thing a customer sees, before the "
                      "website. Missing hours, wrong categories, few photos and inconsistent details make a business look "
                      "less trustworthy and rank lower on Maps."],
        "approach": ["Audit each profile, fix every detail, choose the right primary and secondary categories, add every "
                     "service, add real photos, and keep the profile active with updates. Then track calls, direction "
                     "requests and website clicks from the profile's insights."],
        "features": [
            ("Profile audit", "Checked every field against the business's real details and the profiles of competitors "
             "ranking above it.", []),
            ("Categories and services", "Chose the right categories and listed every service so the profile matches more "
             "searches.", []),
            ("Photos and updates", "Added real visuals and regular posts so the profile looks active and trustworthy.", []),
            ("Insights and reporting", "Tracked calls, direction requests and website clicks to see what's working.", []),
        ],
        "results": ["Complete, accurate business details", "The right categories and services listed",
                    "Real photos and regular updates", "Performance tracked through profile insights"],
        "services": ["Profile audit", "Local SEO", "Image management", "Reporting"],
        "insight": None,
    },
}
