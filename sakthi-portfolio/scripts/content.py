"""Everything written on the portfolio lives here. Edit this file, then run
`python3 scripts/build.py`."""

PROFILE = {
    "name": "S. Saktheeswaran",
    "first": "Saktheeswaran",
    "short": "Sakthi",
    "role": "Digital Marketing Executive & SEO Specialist",
    "lead": ("I help businesses grow online with SEO, websites, content and data-driven marketing, "
             "from the first audit to launch and monthly reporting."),
    "location": "Tamil Nadu, India",
    "email": "saktheesw2005@gmail.com",
    "whatsapp": "918838417707",
    "resume": "https://docs.google.com/document/d/1brBd7zu546so_-IKQJtDZykJBsVI6wHi/preview",
    "social": [
        ("LinkedIn", "https://www.linkedin.com/in/saktheeswaran-s-30a036273/"),
        ("Instagram", "https://www.instagram.com/itx_sakthi_77_/"),
    ],
    "agency": ("Astra Nexora", "https://astranexora.netlify.app/"),
}

# Shown as given by Sakthi: real figures from his own work.
STATS = [("2+", "Years experience"), ("18+", "Projects completed"), ("12+", "Happy clients")]
RESULTS = [("98%", "Client satisfaction"), ("200%", "Revenue growth delivered for clients")]

ABOUT = [
    "I'm a digital marketing professional with hands-on experience in SEO, website development, content creation, "
    "AI-powered marketing and analytics. I enjoy helping businesses strengthen their online presence through "
    "data-driven marketing, creative problem-solving and continuous optimisation.",
    "My career has moved through administration, operations, training and digital marketing. That mix taught me how "
    "businesses actually run, so the marketing I plan is practical, measurable and built around real goals. In 2025 "
    "I founded Astra Nexora, a digital marketing studio for SEO, websites and branding.",
]

TICKER = ["SEO", "Google Business Profile", "WordPress", "Website Development", "Social Media", "Content Creation",
          "Google Analytics 4", "Search Console", "AI Automation", "Lead Generation"]

SKILL_TABS = [
    ("Marketing", [
        ("Digital marketing strategy", "Plans that tie every channel to enquiries and sales."),
        ("Social media marketing", "Content calendars, campaigns and steady organic growth."),
        ("Content creation", "Creatives, short videos and copy that match the brand."),
        ("Performance & lead generation", "Campaigns and landing pages built to convert."),
    ]),
    ("SEO & Web", [
        ("Technical & on-page SEO", "Audits, metadata, internal links, indexing and speed."),
        ("Local SEO", "Google Business Profile, reviews and map-pack visibility."),
        ("Website development", "WordPress, Wix, Framer and custom builds that load fast."),
        ("Website optimisation", "Clearer structure, better UX and stronger calls to action."),
    ]),
    ("Data & AI", [
        ("Analytics & reporting", "GA4 set-up, conversion tracking and clear monthly reports."),
        ("Google Search Console", "Search performance, indexing and fixing site issues."),
        ("AI marketing automation", "n8n workflows that save hours on repeat tasks."),
        ("Operations & training", "Processes, team training and smooth day-to-day delivery."),
    ]),
]

TOOLS = [("WordPress", "wordpress"), ("Framer", "framer"), ("Figma", "figma"), ("Wix", "wix"), ("Canva", "canva"),
         ("CapCut", "capcut"), ("n8n", "n8n"), ("Bolt", "bolt"), ("Lovable", "lovable"),
         ("Rank Math", None), ("Google Analytics 4", None), ("Search Console", None)]
SOFT_SKILLS = ["Communication", "Team training", "Problem solving", "Operations", "Client handling", "Planning"]

EXPERIENCE = [
    ("2025 – Present", "Founder & Managing Director", "Astra Nexora",
     "Started and run a digital marketing studio for SEO, websites, branding and performance marketing."),
    ("Mar 2026 – Present", "Digital Marketing Executive", "Ankhor Groups",
     "SEO, website and digital marketing for the group's brands, including Ankhor Dental Lab and Akeela Dental Care."),
    ("2025 – 2026", "Assistant Manager", "Dream Emphasis", ""),
    ("2025 – 2026", "Admin Executive", "Positive Growth Properties", ""),
    ("2025 – 2026", "Training Manager", "Skyline Technology", ""),
    ("2024 – 2025", "Digital Marketing Intern", "ASSR Emphorium", ""),
]

HIGHLIGHTS = [
    ("Founder", "Built Astra Nexora from the ground up in 2025: brand, website, SEO and client work."),
    ("Live websites", "astranexora, ankhorlab.com and akeeladentalcare.com are live and growing."),
    ("All-round background", "Admin, operations and training roles before marketing, so I plan for how businesses really work."),
]

SERVICES = [
    ("Digital Marketing Strategy", "Marketing strategy, campaign planning, lead generation and performance marketing.", "strategy"),
    ("Search Engine Optimization", "Technical, on-page and local SEO with Search Console monitoring and reporting.", "seo"),
    ("Website Development", "Fast, mobile-first websites on WordPress, Wix, Framer, Bolt and Lovable.", "web"),
    ("Social Media Marketing", "Content planning, campaign management, organic growth and audience engagement.", "social"),
    ("Content Creation", "Brand creatives, posters, reels and short videos with Canva and CapCut.", "content"),
    ("Analytics & AI Automation", "GA4 reporting, Search Console insights and n8n workflows that save time.", "ai"),
]

# Projects: images are keys in assets/work (desktop shots are 1400 wide).
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
            ("Outcome", "A live, fully indexed agency website with 8 service pages, project pages, a blog and an "
             "enquiry form that opens WhatsApp with the visitor's details filled in."),
        ],
        "tools": ["HTML/CSS/JS", "GSAP", "Netlify", "Search Console", "Bing Webmaster"],
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
            ("Outcome", "A stronger technical SEO foundation, better organised website and cleaner indexing."),
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

# Shared by Sakthi from real clients, with their permission.
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
