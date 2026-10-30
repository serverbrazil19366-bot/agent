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
    "I help businesses grow their online visibility, traffic and lead generation through structured, data-driven "
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
        "title": "Ankhor Dental Lab – Case Booking & Automation",
        "tag": "auto",
        "category": "Automation & Dashboard",
        "summary": "Online scan and case booking with a team dashboard, email and app notifications, and WhatsApp and email automation.",
        "cover": "work/ankhorcase-2",
        "gallery": ["work/ankhorcase-1", "work/ankhorcase-m", "work/ankhorcase-3"],
        "live": "https://ankhorlab.com/book-scan",
        "meta": [("Year", "2026"), ("Industry", "Dental laboratory"), ("Client", "Ankhor Dental Lab"), ("Role", "Planning, build & automation")],
        "sections": [
            ("The challenge", "Clinics booked scans and sent cases through calls and scattered WhatsApp messages, so the "
             "lab team had no single place to see what was coming in, and every confirmation had to be typed by hand."),
            ("Strategy", "Move booking online with live slots, send every request into one dashboard and automate the "
             "notifications and updates, so nobody has to chase them."),
            ("What I did", "Built the Book a Scan flow: clinics pick a free day and time, add clinic and case details, "
             "and one click saves the booking and opens WhatsApp with the details ready to send. Set up the team "
             "dashboard where cases arrive, with email and app notifications for new bookings, and WhatsApp and email "
             "automation for confirmations and case updates."),
            ("Outcome", "Every scan request and case lands in one place, taken slots show as booked straight away, and "
             "clinics get confirmations without the team typing them."),
        ],
        "tools": ["n8n", "WhatsApp", "Email automation", "Dashboard", "App notifications"],
    },
    {
        "slug": "ankhor-dental-lab",
        "title": "Ankhor Dental Lab – Website & SEO",
        "tag": "seo",
        "category": "SEO & Website",
        "summary": "Stronger search visibility through on-page SEO, technical fixes and a clearer website structure.",
        "cover": "work/ankhor-1",
        "gallery": ["work/ankhor-2", "work/ankhor-m"],
        "live": "https://ankhorlab.com/",
        "meta": [("Year", "2026"), ("Industry", "Dental laboratory"), ("Client", "Ankhor Dental Lab"), ("Role", "SEO & website")],
        "sections": [
            ("The challenge", "Missing metadata, inconsistent headings, weak internal linking and indexing issues were "
             "holding back search visibility for a long-established dental lab."),
            ("Strategy", "Start with a full SEO audit, then fix the foundations: metadata, headings, internal links and "
             "indexing, monitored through Google Search Console."),
            ("What I did", "SEO audit, keyword research, metadata and on-page optimisation, image optimisation, site "
             "structure improvements and Search Console monitoring."),
            ("Outcome", "A stronger technical SEO foundation, a better organised website and cleaner indexing."),
        ],
        "tools": ["WordPress", "Rank Math", "Search Console", "Google Analytics"],
    },
    {
        "slug": "akeela-dental-care",
        "title": "Akeela Dental Care – Website & UX",
        "tag": "web",
        "category": "Website Development & UX",
        "summary": "A clearer, more responsive website that helps patients find treatments and book quickly.",
        "cover": "work/akeela-1",
        "gallery": ["work/akeela-2", "work/akeela-m"],
        "live": "https://akeeladentalcare.com/",
        "meta": [("Year", "2026"), ("Industry", "Dental clinic"), ("Client", "Akeela Dental Care"), ("Role", "Website & UX")],
        "sections": [
            ("The challenge", "The existing navigation and content hierarchy made it hard for patients to find services "
             "and book an appointment quickly."),
            ("Strategy", "Improve page hierarchy, reorganise treatments and make booking, calls and WhatsApp easy from "
             "every page, especially on mobile."),
            ("What I did", "Updated layouts, refined service pages, improved readability and tested responsiveness "
             "and speed across devices."),
            ("Outcome", "A more accessible, professional website experience with clear paths to book."),
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
