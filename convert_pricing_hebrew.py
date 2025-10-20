#!/usr/bin/env python3
"""
Convert English mobile pricing page to Hebrew with accordion structure intact.
Translates content while preserving all HTML structure, IDs, and JavaScript.
"""

# Translation dictionary - English to Hebrew
translations = {
    # Meta and titles
    'lang="en"': 'lang="he" dir="rtl"',
    '<html lang="en">': '<html lang="he" dir="rtl">',
    'AI Club — Pricing & Plans': 'AI Club — מחירים ותוכניות',
    'Pricing and plans for AI Club Raanana': 'מחירים ותוכניות מועדון AI רעננה',
    'Limited founder\'s offer! Comprehensive AI education': 'מבצע מייסדים מוגבל! חינוך AI מקיף',
    'for children ages 8-18': 'לילדים בגילאי 8-18',
    'AI Club - AI Education for Kids': 'AI Club - חינוך AI לילדים',

    # Main headings
    'AI Club Raanana': 'מועדון AI רעננה',
    'Pricing & Plans': 'מחירים ותוכניות',
    'Limited Founder\'s Offer!': '!מבצע מייסדים מוגבל',
    '20% OFF Early Bird Pricing!': '!20% הנחה למצטרפים הראשונים',
    'Lock in founder pricing before regular rates begin': 'נעלו מחירי מייסדים לפני שהמחירים הרגילים יתחילו',
    'Offer ends in:': ':המבצע מסתיים בעוד',

    # Time units
    'Days': 'ימים',
    'Hours': 'שעות',
    'Minutes': 'דקות',
    'Seconds': 'שניות',

    # Age selection
    'Choose Your Child\'s Program': 'בחרו את תוכנית הילד שלכם',
    'Select the age group that matches your child': 'בחרו את קבוצת הגיל שמתאימה לילד שלכם',

    # Age groups
    'Ages 8-10': 'גילאי 8-10',
    'Young Innovators': 'חדשנים צעירים',
    'Ages 11-13': 'גילאי 11-13',
    'Tech Explorers': 'חוקרי טכנולוגיה',
    'Ages 14-18': 'גילאי 14-18',
    'Future Leaders': 'מנהיגי העתיד',

    # Features - Young Innovators
    'AI Fundamentals & Safety': 'יסודות AI ובטיחות',
    'Creative Storytelling & Art': 'סיפור יצירתי ואומנות',
    'Project-Based Learning': 'למידה מבוססת פרויקטים',

    # Features - Tech Explorers
    'Programming Fundamentals': 'יסודות תכנות',
    'AI Research Skills': 'מיומנויות מחקר AI',
    'Advanced Projects': 'פרויקטים מתקדמים',

    # Features - Future Leaders
    'Advanced AI Applications': 'יישומי AI מתקדמים',
    'Startup & Entrepreneurship': 'סטארט-אפ ויזמות',
    'Professional Development': 'פיתוח מקצועי',

    # Badges
    'PREMIUM': 'פרימיום',
    'MOST POPULAR': 'הפופולרי ביותר',
    'BEST VALUE': 'המבצע הטוב ביותר',

    # Pricing tiers
    'Free Trial': 'ניסיון חינם',
    'Monthly': 'חודשי',
    'Quarterly': 'רבעוני',
    'Annually': 'שנתי',
    'Annual': 'שנתי',

    # Pricing details
    'per child/month': 'לילד/חודש',
    'per child/quarter': 'לילד/רבעון',
    'per child/year': 'לילד/שנה',
    'First Session': 'מפגש ראשון',
    'Try before you commit': 'נסו לפני שאתם מתחייבים',
    '4 Sessions': '4 מפגשים',
    '12 Sessions': '12 מפגשים',
    '48 Sessions': '48 מפגשים',

    # Feature rows
    '2 lessons': '2 שיעורים',
    '4 per month': '4 בחודש',
    '12 per quarter': '12 ברבעון',
    '48 per year': '48 בשנה',
    '90 minutes': '90 דקות',
    'Up to 12': 'עד 12',
    'Pro': 'Pro',
    'Free': 'חינם',

    # Additional features
    'AI Tools - Outside Sessions': 'כלי AI - מחוץ למפגשים',
    'WhatsApp Parent Group': 'קבוצת הורים בוואטסאפ',
    'Discord Community Channel': 'ערוץ קהילה בדיסקורד',
    'Resource Library': 'ספריית משאבים',
    'Digital Portfolio': 'תיק עבודות דיגיטלי',
    'Waitlist Priority': 'עדיפות ברשימת ההמתנה',

    # Buttons
    'View Pricing →': '← צפה במחירים',
    'Try Free': 'נסו חינם',
    'Get Started': 'התחילו עכשיו',
    'Back to Age Selection': 'חזרה לבחירת גיל',
    'Register Now': 'הרשמו עכשיו',
    'Register Now • Choose Your Child\'s Plan': 'הרשמו עכשיו • בחרו את תוכנית הילד שלכם',

    # Pricing headers
    'Young Innovators Pricing': 'מחירים לחדשנים צעירים',
    'Creative AI Introduction': 'היכרות יצירתית עם AI',
    'Tech Explorers Pricing': 'מחירים לחוקרי טכנולוגיה',
    'Advanced AI Skills': 'מיומנויות AI מתקדמות',
    'Future Leaders Pricing': 'מחירים למנהיגי העתיד',
    'Professional AI Mastery': 'שליטה מקצועית ב-AI',

    # Additional pricing details
    '/month per child': 'לילד/חודש',
    'Save 20%': 'חסכו 20%',
    'Best Value - Save 20% vs חודשי': 'המבצע הטוב ביותר - חסכו 20% לעומת חודשי',

    # Meta and internal links
    'pricing-mobile.html': 'pricing-he.html',

    # Family Discounts Section
    'Family Discounts': 'הנחות משפחתיות',
    'Save with multiple children': 'חסכו עם מספר ילדים',
    'Second child: 10% off all plans': 'ילד שני: 10% הנחה על כל התוכניות',
    'Third child and beyond: 15% off all plans': 'ילד שלישי ומעלה: 15% הנחה על כל התוכניות',
    'First child:': 'ילד ראשון:',
    'Second child:': 'ילד שני:',
    'Third child:': 'ילד שלישי:',
    'First': 'ראשון',
    'Second': 'שני',
    'Third': 'שלישי',
    'child': 'ילד',
    'month': 'חודש',
    '(10% off)': '(10% הנחה)',
    '(15% off)': '(15% הנחה)',
    'Month-to-חודש billing': 'חיוב חודשי',
    'Choose Your Child\'s Plan': 'בחרו את תוכנית הילד שלכם',

    # Trial Period & Policies Section
    'Trial Period & Policies': 'תקופת ניסיון ומדיניות',
    '2-Lesson Trial Period': 'תקופת ניסיון של 2 שיעורים',
    'Full refund available after the second lesson if you\'re not completely satisfied with the program.': 'החזר כספי מלא זמין לאחר השיעור השני אם אינכם מרוצים לחלוטין מהתוכנית.',
    'Cancellation Terms': 'תנאי ביטול',
    '30 days advance notice required for cancellation. No penalties or hidden fees.': 'נדרשת הודעה מוקדמת של 30 יום לביטול. ללא קנסות או עמלות נסתרות.',
    'Payment Methods': 'אמצעי תשלום',
    'We accept Bit, PayBox, and all major credit cards for your convenience.': 'אנחנו מקבלים Bit, PayBox וכל כרטיסי האשראי הגדולים לנוחיותכם.',

    # Footer
    'Quick Links': 'קישורים מהירים',
    'Home': 'בית',
    'Curriculum': 'תוכנית לימודים',
    'Pricing': 'מחירים',
    'FAQ': 'שאלות נפוצות',
    'Legal': 'משפטי',
    'Privacy Policy': 'מדיניות פרטיות',
    'Terms of Service': 'תנאי שירות',
    'Contact': 'צור קשר',
    'Email:': 'דוא"ל:',
    'Phone:': 'טלפון:',
    'Location: Raanana, Israel': 'מיקום: רעננה, ישראל',
    'All rights reserved': 'כל הזכויות שמורות',
}

# Read the file
with open('/Users/raphaelberrebi/AI for Kids/public/pricing-he.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Apply translations
for eng, heb in translations.items():
    content = content.replace(eng, heb)

# Write back
with open('/Users/raphaelberrebi/AI for Kids/public/pricing-he.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Translation complete")
print(f"✓ File length: {len(content)} characters")
print(f"✓ Applied {len(translations)} translations")
print(f"✓ Output file: /Users/raphaelberrebi/AI for Kids/public/pricing-he.html")
