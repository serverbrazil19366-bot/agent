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
    "ankhor-case-booking-automation": ("Dental Lab Case Booking & n8n Automation – Ankhor Case Study",
                                       "Online scan booking, a team dashboard, email and app notifications and WhatsApp automation for Ankhor Dental Lab, built with n8n."),
    "ankhor-dental-lab": ("Dental Lab Website & SEO – Ankhor Dental Lab Case Study",
                          "On-page SEO, technical fixes and a clearer website structure that improved search visibility for Ankhor Dental Lab."),
    "akeela-dental-care": ("Dental Clinic Website Design – Akeela Dental Care Case Study",
                           "A clearer, faster dental clinic website for Akeela Dental Care that helps patients find treatments and book an appointment quickly."),
    "akeela-whatsapp-automation": ("WhatsApp Booking Automation for a Dental Clinic – Case Study",
                                   "A dental clinic booking flow where every appointment request arrives in WhatsApp with the patient's name, number and treatment, ready to confirm."),
    "guggulr-instagram": ("Instagram Creatives for a Gift Box Brand – Guggulr Case Study",
                          "Instagram content planning and product creatives designed in Canva for Guggulr, a premium gift box brand, keeping every post on-brand."),
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
             "heading structure, mobile layout and structured data. On the Ankhor Dental Lab website, the problems were "
             "missing metadata, inconsistent headings, weak internal linking and indexing issues; fixing those gave the "
             "site a much stronger technical base."),
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
             "Ankhor Dental Lab received bookings through calls and scattered WhatsApp messages. I built a Book a Scan "
             "flow where clinics pick a free slot and add their case details; the booking is saved, a WhatsApp message is "
             "ready to send, the case appears in a team dashboard, and email and app notifications go out automatically. "
             "Taken slots show as booked straight away."),
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

# Articles under /insights/, written from Sakthi's own projects
ARTICLES = [
    {
        "slug": "seo-for-dental-clinics-tamil-nadu",
        "seo_title": "SEO for Dental Clinics in Tamil Nadu: A Practical Guide",
        "desc": ("How dental clinics in Tamil Nadu can get more patients from Google: Google Business Profile, local SEO, "
                 "treatment pages, reviews and easy booking. A practical guide by S. Saktheeswaran."),
        "h1": "SEO for dental clinics in <em>Tamil Nadu</em>",
        "kicker": "Guide · Local SEO",
        "date": "2026-11-07",
        "read": "7 min read",
        "intro": ("When someone has a toothache, they don't scroll through ten pages of Google. They search \"dentist near "
                  "me\" or \"dental clinic in T. Nagar\", look at the map, check the reviews and call. If your clinic isn't "
                  "in that first view, that patient goes somewhere else. This guide covers what I check and fix first "
                  "when I work on SEO for dental clinics and labs in Tamil Nadu."),
        "sections": [
            ("1. Start with your Google Business Profile",
             ["For a clinic, the map pack usually brings more calls than the website itself. Make sure your profile is "
              "complete: the right primary category (Dentist or Dental clinic), every treatment you offer added as a "
              "service, correct opening hours including holidays, and a phone number that is actually answered.",
              "Add real photos of the clinic, the reception, the team and the equipment. Stock photos don't build trust. "
              "Post an update every week or two: a new treatment, a festival greeting, a patient tip. An active profile "
              "looks like an active clinic."]),
            ("2. Collect reviews every week",
             ["Reviews are one of the strongest local ranking signals, and they are what patients read before they call. "
              "Ask every happy patient, and make it easy: a short link or a QR code at the reception. Reply to every "
              "review, good or bad, politely and without sharing treatment details."]),
            ("3. One page for each main treatment",
             ["Patients search for treatments, not for \"services\". Dental implants, root canal treatment, braces and "
              "aligners, wisdom tooth removal, kids' dentistry: each deserves its own page that explains the problem, the "
              "treatment, what to expect and how to book. Put the area in the page title, for example \"Dental Implants "
              "in T. Nagar, Chennai\".",
              "A single \"Services\" page with ten bullet points can't rank for ten different searches. Ten focused pages "
              "can."]),
            ("4. Make booking effortless, especially on mobile",
             ["Most dental searches happen on a phone. If booking means filling a long form and waiting for a call back, "
              "many patients give up. For Akeela Dental Care I built a short booking form that opens WhatsApp with the "
              "patient's name, number and treatment already filled in, plus call and WhatsApp buttons that stay on screen. "
              "Every request now reaches the team ready to confirm in one reply.",
              "Google notices when visitors find what they need and act on it. Good SEO and easy booking work together."]),
            ("5. Fix the technical basics",
             ["Check Google Search Console for pages that aren't indexed, make sure every page has a unique title and "
              "description, use one clear H1 per page, compress large images and test the site on a real phone. On the "
              "Ankhor Dental Lab website, missing metadata, inconsistent headings, weak internal links and indexing issues "
              "were holding the site back; fixing those foundations came before anything else."]),
            ("6. Keep your details the same everywhere",
             ["Your clinic name, address and phone number should match exactly on your website, Google Business Profile, "
              "Justdial, Practo, Facebook and anywhere else you are listed. Small differences confuse Google about which "
              "listing is the real one."]),
            ("7. Measure what matters",
             ["Track calls, WhatsApp clicks and booking requests, not just visitors. Google Business Profile insights "
              "shows calls and direction requests; GA4 can track button clicks and form submissions. Review it every "
              "month and keep doing more of what brings patients in."]),
        ],
        "checklist": ["Google Business Profile complete, with real photos", "A review request at every visit",
                      "One page per main treatment, with the area in the title", "WhatsApp and call buttons on every page",
                      "No indexing errors in Search Console", "Same name, address and phone everywhere",
                      "Calls and bookings tracked every month"],
        "projects": ["akeela-whatsapp-automation", "ankhor-dental-lab", "google-business-profile"],
        "faqs": [
            ("How long does SEO take for a dental clinic?",
             "Google Business Profile improvements and reviews can bring more calls within weeks. Ranking treatment pages "
             "on Google usually takes three to six months, depending on competition in your area."),
            ("Is Google Ads better than SEO for a new clinic?",
             "Ads bring calls immediately but stop when you stop paying. SEO and a strong Google Business Profile take "
             "longer but keep working. Most new clinics do best with a small ads budget while SEO builds up."),
        ],
    },
    {
        "slug": "whatsapp-booking-automation-n8n",
        "seo_title": "WhatsApp Booking Automation with n8n: How I Built It for Clinics",
        "desc": ("How I automated appointment and case bookings for a dental clinic and a dental lab using WhatsApp, n8n, "
                 "email and a simple dashboard, and what any small business can copy."),
        "h1": "WhatsApp booking automation with <em>n8n</em>",
        "kicker": "Case study · Automation",
        "date": "2026-11-07",
        "read": "6 min read",
        "intro": ("Most small businesses in India already run on WhatsApp. Patients message to book, clinics message to "
                  "confirm, labs message to send case details. The problem isn't the tool, it's everything around it: "
                  "messages that get missed in busy hours, details copied by hand, and the same confirmation typed again "
                  "and again. Here's how I automated bookings for two dental businesses without asking anyone to learn "
                  "new software."),
        "sections": [
            ("The problem: bookings scattered across calls and chats",
             ["At Akeela Dental Care, patients called during busy clinic hours or sent enquiries that were easy to miss. "
              "At Ankhor Dental Lab, clinics booked scans through calls and scattered WhatsApp messages, so the lab team "
              "had no single place to see what was coming in, and every confirmation was typed by hand."]),
            ("Step 1: a short form that opens WhatsApp",
             ["The first win is simple. A booking form asks only what the team needs (name, phone, treatment or case "
              "details) and, on submit, opens WhatsApp with the message already written. The patient or clinic just "
              "presses send. No app to install, no account to create.",
              "For Akeela, that's a four-field form plus call and WhatsApp buttons that stay on screen on mobile. Every "
              "request now arrives with the patient's details, ready to confirm in one reply."]),
            ("Step 2: live slots so nobody double-books",
             ["For Ankhor's scan bookings, clinics pick a free day and time on the page. Once a slot is taken it shows as "
              "booked straight away, so two clinics can't book the same visit and the team doesn't have to juggle "
              "calendars over the phone."]),
            ("Step 3: n8n connects everything behind the scenes",
             ["When a booking is submitted, an n8n workflow takes over: it saves the booking, adds the case to the team "
              "dashboard, sends an email and an app notification to the team, and sends a WhatsApp and email confirmation "
              "to the clinic. Status updates follow the same route, so clinics hear back without anyone typing a message.",
              "n8n is a workflow tool that connects forms, WhatsApp, email, Google Sheets and CRMs. Each step that used to "
              "be manual becomes a node in the workflow."]),
            ("Step 4: one dashboard for the team",
             ["Instead of searching through chats, the team sees every booking and case in one place, with the details "
              "the clinic entered. Nothing gets lost when someone is on leave or a phone is switched off."]),
            ("What any small business can copy",
             ["You don't need to automate everything at once. Start with a pre-filled WhatsApp booking form; it costs "
              "almost nothing and removes the biggest source of missed enquiries. Then add notifications for your team, "
              "then automatic confirmations, then a dashboard. Remove steps instead of adding software, and keep your "
              "customers on the channel they already use."]),
        ],
        "checklist": ["Map how bookings arrive today and where they get lost", "Ask only for the details you really need",
                      "Open WhatsApp with the message pre-filled", "Show booked slots instantly",
                      "Notify the team by email or app", "Confirm automatically by WhatsApp and email",
                      "Keep everything in one dashboard"],
        "projects": ["akeela-whatsapp-automation", "ankhor-case-booking-automation"],
        "faqs": [
            ("Do I need the WhatsApp Business API for this?",
             "Not for a pre-filled booking form; that works with any WhatsApp number. Sending fully automatic WhatsApp "
             "messages from a workflow needs the WhatsApp Business API or an approved provider."),
            ("Is n8n free?",
             "n8n can be self-hosted for free, and it also has a paid cloud version. The right choice depends on how many "
             "workflows you run and who will maintain them."),
        ],
    },
]

# Covers and in-article screenshots (all from real client websites); figures are keyed by section index
ARTICLE_MEDIA = {
    "seo-for-dental-clinics-tamil-nadu": {
        "cover": ("blog/cover-dental-seo", "Akeela Dental Care dental implants page on desktop and mobile"),
        "figs": {
            1: [("blog/akeela-reviews", "Akeela Dental Care's patient reviews page puts real stories and ratings front and centre.")],
            2: [("blog/akeela-implants", "A dedicated dental implants page for Akeela Dental Care."),
                ("blog/akeela-rct", "A separate root canal treatment page, so each treatment can rank for its own searches.")],
            3: [("work/akeelawa-1", "Akeela's booking form: four fields, then WhatsApp opens with the request filled in."),
                ("work/akeelawa-m", "On mobile, Call and WhatsApp buttons stay on screen.")],
            4: [("work/ankhor-1", "The Ankhor Dental Lab website after the on-page and technical SEO fixes.")],
        },
    },
    "whatsapp-booking-automation-n8n": {
        "cover": ("blog/cover-whatsapp-automation", "Ankhor Dental Lab scan booking page on desktop and mobile"),
        "figs": {
            1: [("work/akeelawa-1", "The Akeela Dental Care booking form on desktop."),
                ("work/akeelawa-m", "The same form on mobile, with Call and WhatsApp buttons fixed at the bottom.")],
            2: [("work/ankhorcase-2", "Ankhor's Book a Scan page: choose a day, choose a time, add clinic and case details."),
                ("work/ankhorcase-m", "Slot booking on mobile, with free and booked times.")],
            3: [("work/ankhorcase-3", "The four steps clinics see: book a slot, we confirm, we visit and scan, we make it.")],
            5: [("work/ankhorcase-1", "Ankhor's chairside scanning service page, where every booking starts.")],
        },
    },
}
for _a in ARTICLES:
    _a.update(ARTICLE_MEDIA[_a["slug"]])
