#!/usr/bin/env python3
"""
Script to update mobile HTML pages with consistent menu and footer patterns.
"""

import re
import os

# Define the files to update with their corresponding language pair
FILES_TO_UPDATE = [
    # (file_path, corresponding_language_page, is_hebrew)
    ("/Users/raphaelberrebi/AI for Kids/public/mobile-he.html", "mobile.html", True),
    ("/Users/raphaelberrebi/AI for Kids/public/curriculum-he.html", "curriculum-mobile.html", True),
    ("/Users/raphaelberrebi/AI for Kids/public/pricing-mobile.html", "pricing-he.html", False),
    ("/Users/raphaelberrebi/AI for Kids/public/pricing-he.html", "pricing-mobile.html", True),
    ("/Users/raphaelberrebi/AI for Kids/public/faq-mobile-he.html", "faq-mobile.html", True),
    ("/Users/raphaelberrebi/AI for Kids/public/privacy-mobile.html", "privacy-mobile-he.html", False),
    ("/Users/raphaelberrebi/AI for Kids/public/privacy-mobile-he.html", "privacy-mobile.html", True),
    ("/Users/raphaelberrebi/AI for Kids/public/terms-mobile.html", "terms-mobile-he.html", False),
    ("/Users/raphaelberrebi/AI for Kids/public/terms-mobile-he.html", "terms-mobile.html", True),
]

def get_cleaned_menu_english(lang_page):
    """Get cleaned hamburger menu for English pages."""
    return f'''            <!-- Menu Items -->
            <nav class="flex-1 p-6 pt-20">
                <ul class="space-y-4">
                    <li>
                        <a href="{lang_page}" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-400">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span class="text-lg">עברית (Hebrew)</span>
                        </a>
                    </li>
                    <li>
                        <a href="mobile.html" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-cyan-400">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            <span class="text-lg">Home</span>
                        </a>
                    </li>
                    <li>
                        <a href="curriculum-mobile.html" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-400">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            <span class="text-lg">Curriculum</span>
                        </a>
                    </li>
                    <li>
                        <a href="pricing-mobile.html" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                            <span class="text-lg">Pricing</span>
                        </a>
                    </li>
                </ul>
            </nav>'''

def get_cleaned_menu_hebrew(lang_page):
    """Get cleaned hamburger menu for Hebrew pages."""
    return f'''            <!-- Menu Items -->
            <nav class="flex-1 p-6 pt-20">
                <ul class="space-y-4">
                    <li>
                        <a href="{lang_page}" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors flex-row-reverse">
                            <span class="text-lg">English (אנגלית)</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-400">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="mobile-he.html" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors flex-row-reverse">
                            <span class="text-lg">בית</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-cyan-400">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="curriculum-he.html" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors flex-row-reverse">
                            <span class="text-lg">תוכנית לימודים</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-amber-400">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a href="pricing-he.html" class="menu-item flex items-center gap-4 p-4 text-white hover:bg-white/10 rounded-xl transition-colors flex-row-reverse">
                            <span class="text-lg">מחירים</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400">
                                <line x1="12" y1="1" x2="12" y2="23"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </a>
                    </li>
                </ul>
            </nav>'''

def update_file(file_path, lang_page, is_hebrew):
    """Update a single file with the new patterns."""
    print(f"Updating {os.path.basename(file_path)}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update hamburger menu (remove FAQ, Privacy, Terms)
    menu_pattern = r'(\s*<!-- Menu Items -->\s*<nav class="flex-1 p-6 pt-20">\s*<ul class="space-y-4">).*?(</ul>\s*</nav>)'

    if is_hebrew:
        new_menu = get_cleaned_menu_hebrew(lang_page)
    else:
        new_menu = get_cleaned_menu_english(lang_page)

    content = re.sub(menu_pattern, new_menu, content, flags=re.DOTALL)

    # Update footer to add language toggle and WhatsApp buttons
    # This is complex, so we'll note files that need manual checking

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Updated {os.path.basename(file_path)}")

def main():
    """Main execution function."""
    print("Starting mobile pages update...")
    print("=" * 60)

    for file_path, lang_page, is_hebrew in FILES_TO_UPDATE:
        if os.path.exists(file_path):
            try:
                update_file(file_path, lang_page, is_hebrew)
            except Exception as e:
                print(f"✗ Error updating {os.path.basename(file_path)}: {e}")
        else:
            print(f"✗ File not found: {file_path}")

    print("=" * 60)
    print("Update complete!")
    print("\nNote: Footer sections need manual updates for contact buttons.")

if __name__ == "__main__":
    main()
