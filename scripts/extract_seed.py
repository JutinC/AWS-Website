#!/usr/bin/env python3
"""
Extract full word-for-word content from HTML backups and generate seed.sql.
Run from project root: python scripts/extract_seed.py
"""
import re
import os

BACKUP_DIR = "Frontend/html-backup"
OUTPUT_SQL = "src/main/resources/db/seed.sql"

def strip_html(html):
    """Remove HTML tags and decode entities."""
    text = re.sub(r'<[^>]+>', ' ', html or '')
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_text_content(element):
    """Recursively get text, preserving structure for blocks."""
    if element is None:
        return ""
    if hasattr(element, 'strings'):
        return ' '.join(s.strip() for s in element.strict_strings if s.strip())
    return str(element).strip() if element else ""

def extract_card_content(card_html):
    """Extract full text from an info-card, preserving paragraphs and lists."""
    parts = []
    
    # Get all direct content - split by block elements
    for match in re.finditer(r'<(p|div|ul|li)(?:\s[^>]*)?>([\s\S]*?)</\1>', card_html):
        tag, content = match.group(1), match.group(2)
        inner = strip_html(content)
        if not inner:
            continue
        if tag == 'li':
            parts.append('- ' + inner)
        elif tag == 'ul':
            # Process li items - they're handled above in recursion, so we need to parse differently
            lis = re.findall(r'<li[^>]*>([\s\S]*?)</li>', content)
            for li in lis:
                parts.append('- ' + strip_html(li))
        elif tag in ('p', 'div'):
            if inner and not inner.startswith('-'):
                parts.append(inner)
    
    # Also get strong labels from card-details
    for match in re.finditer(r'<strong>([^<]+)</strong>\s*([^<]*(?:<[^>]+>[^<]*)*)', card_html):
        label = strip_html(match.group(1))
        rest = match.group(2)
        if '<ul>' in rest:
            lis = re.findall(r'<li[^>]*>([\s\S]*?)</li>', rest)
            if lis:
                parts.append(label + ':')
                for li in lis:
                    parts.append('- ' + strip_html(li))
            else:
                parts.append(label + ': ' + strip_html(rest))
        else:
            parts.append(label + ': ' + strip_html(rest))
    
    # Simple paragraphs not in blocks
    for match in re.finditer(r'<p[^>]*>([\s\S]*?)</p>', card_html):
        p = strip_html(match.group(1))
        if p and p not in [x for x in parts if isinstance(x, str) and x.startswith(p[:30])]:
            parts.append(p)
    
    result = []
    seen = set()
    for p in parts:
        if isinstance(p, str) and p.strip() and p.strip() not in seen:
            result.append(p.strip())
            seen.add(p.strip())
    
    return '\n\n'.join(result)

def parse_info_cards(html_content):
    """Parse info-card blocks from HTML."""
    cards = []
    card_pattern = r'<div class="info-card[^"]*">\s*<h3>([^<]+)</h3>([\s\S]*?)(?=<div class="info-card|</div>\s*</div>\s*</main>|$)'
    for match in re.finditer(card_pattern, html_content):
        title = strip_html(match.group(1))
        body = match.group(2)
        
        img_match = re.search(r'src="([^"]+)"', body)
        image_url = ''
        if img_match:
            src = img_match.group(1)
            if '../Pictures/' in src:
                image_url = '/Pictures/' + src.split('Pictures/')[-1]
            elif 'Pictures/' in src:
                image_url = '/' + src.split('/', 1)[-1] if src.startswith('.') else src
        
        parts = []
        for p_match in re.finditer(r'<p[^>]*>([\s\S]*?)</p>', body):
            parts.append(strip_html(p_match.group(1)))
        
        for div_match in re.finditer(r'<div class="card-details">([\s\S]*?)</div>', body):
            block = div_match.group(1)
            pos = 0
            while pos < len(block):
                strong_m = re.search(r'<strong>([^<]+)</strong>\s*', block[pos:])
                if not strong_m:
                    break
                label = strip_html(strong_m.group(1)).rstrip(':')
                cont_start = pos + strong_m.end()
                rest = block[cont_start:]
                if rest.lstrip().startswith('<ul>'):
                    ul_match = re.search(r'<ul>\s*([\s\S]*?)\s*</ul>', rest)
                    if ul_match:
                        lis = re.findall(r'<li[^>]*>([\s\S]*?)</li>', ul_match.group(1))
                        if lis:
                            parts.append(label + ':')
                            for li in lis:
                                parts.append('- ' + strip_html(li))
                        pos = cont_start + ul_match.end()
                        continue
                if rest.lstrip().startswith('<p>'):
                    p_match = re.search(r'<p>([\s\S]*?)</p>', rest)
                    if p_match:
                        parts.append(label + ': ' + strip_html(p_match.group(1)))
                        pos = cont_start + p_match.end()
                        continue
                next_strong = re.search(r'\s*<strong>', rest)
                if next_strong and next_strong.start() == 0:
                    pos = cont_start + next_strong.end()
                    continue
                text_end = re.search(r'<(?:ul|p|strong)', rest)
                cont_end = text_end.start() if text_end else len(rest)
                if cont_end > 0:
                    parts.append(label + ': ' + strip_html(rest[:cont_end]))
                pos = cont_start + cont_end
        
        for div_match in re.finditer(r'<div class="card-note">\s*<strong>([^<]+)</strong>\s*([^<]*(?:<[^>]+>[^<]*)*)', body):
            label = strip_html(div_match.group(1)).rstrip(':')
            rest = strip_html(div_match.group(2))
            parts.append(label + ': ' + rest)
        
        for ul_match in re.finditer(r'<ul>\s*([\s\S]*?)\s*</ul>', body):
            ul_content = ul_match.group(1)
            if '<div class="card-details">' in body and ul_match.start() > body.find('card-details'):
                continue
            lis = re.findall(r'<li[^>]*>([\s\S]*?)</li>', ul_content)
            if lis and not any('- ' + strip_html(li) in '\n'.join(parts) for li in lis):
                for li in lis:
                    parts.append('- ' + strip_html(li))
        
        seen_parts = set()
        unique_parts = []
        for p in parts:
            if not p.strip():
                continue
            skip = False
            to_remove = []
            for s in seen_parts:
                if p in s:
                    skip = True
                    break
                if len(p) > 20 and s in p:
                    to_remove.append(s)
            for s in to_remove:
                unique_parts.remove(s)
                seen_parts.discard(s)
            if not skip:
                unique_parts.append(p)
                seen_parts.add(p)
        desc = '\n\n'.join(unique_parts)
        cards.append({'title': title, 'description': desc, 'imageUrl': image_url})
    
    return cards

def parse_unit_overview(html_content):
    """Extract unit overview for homepage."""
    match = re.search(r'<div class="unit-overview">\s*<h2>[^<]+</h2>([\s\S]*?)</div>', html_content)
    if not match:
        return None
    pars = re.findall(r'<p>([\s\S]*?)</p>', match.group(1))
    return '\n\n'.join(strip_html(p) for p in pars)

def escape_sql(s):
    """Escape string for SQL."""
    if s is None:
        return ''
    s = str(s).replace('\\', '\\\\').replace("'", "''").replace('\n', '\\n').replace('\r', '')
    return s

def parse_unit4_sections(html_content):
    """Parse Unit 4 content-section into 7 cards with full word-for-word text."""
    content_match = re.search(r'<div class="content-section">([\s\S]*?)</div>\s*</div>\s*</main>', html_content)
    if not content_match:
        return []
    
    raw_html = content_match.group(1)
    full_text = strip_html(raw_html)
    full_text = re.sub(r'\s+', ' ', full_text)
    
    section_splits = [
        (r'1\. IDENTITY AND ACCESS MANAGEMENT \(IAM\)', r'2\. ENCRYPTION AND KEY MANAGEMENT'),
        (r'2\. ENCRYPTION AND KEY MANAGEMENT', r'3\. LOGGING, MONITORING, AND AUDITING'),
        (r'3\. LOGGING, MONITORING, AND AUDITING', r'4\. ADVANCED SECURITY SERVICES'),
        (r'4\. ADVANCED SECURITY SERVICES', r'5\. BACKUP, DISASTER RECOVERY'),
        (r'5\. BACKUP, DISASTER RECOVERY', r'6\. COST MANAGEMENT AND OPTIMIZATION'),
        (r'6\. COST MANAGEMENT AND OPTIMIZATION', r'7\. AWS SUPPORT PLANS'),
        (r'7\. AWS SUPPORT PLANS', r' UNIT 4 SUMMARY'),
    ]
    
    titles = [
        'IAM – Identity and Access Management',
        'Encryption and KMS',
        'CloudWatch, CloudTrail, Config',
        'WAF, Shield, GuardDuty, Inspector',
        'Backup and RPO/RTO',
        'Cost Management',
        'AWS Support Plans',
    ]
    
    images = ['/Pictures/Unit 4 pt 1.png', '', '/Pictures/Unit 4 pt 2.png', '', '', '/Pictures/Unit 4 pt 3.png', '']
    
    cards = []
    for i, (start_pat, end_pat) in enumerate(section_splits):
        start_m = re.search(start_pat, full_text, re.I)
        end_m = re.search(end_pat, full_text, re.I)
        if start_m:
            begin_pos = start_m.start()
            end_pos = end_m.start() if end_m and end_m.start() > begin_pos else len(full_text)
            text = full_text[begin_pos:end_pos].strip()
            text = re.sub(r'\s{2,}', '\n\n', text)
        else:
            text = titles[i]
        img = images[i] if i < len(images) else ''
        cards.append({'title': titles[i], 'description': text, 'imageUrl': img})
    
    return cards

def main():
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    rows = []
    
    for unit_num in range(1, 11):
        path = os.path.join(BACKUP_DIR, f'unit{unit_num}.html')
        if not os.path.exists(path):
            continue
        
        with open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        if unit_num == 4:
            from update_unit4_seed import UNIT4_NEW
            unit4_overview = next((r for r in UNIT4_NEW if r[5] == 1), None)
            if unit4_overview:
                rows.append((4, unit4_overview[1], unit4_overview[2], unit4_overview[3], 0, 1))
            cards = [{'title': t, 'description': d, 'imageUrl': img} for _, t, d, img, _, show in UNIT4_NEW if show == 0]
        else:
            overview = parse_unit_overview(html)
            if overview:
                unit_title_match = re.search(r'<h1>([^<]+)</h1>', html)
                unit_title = strip_html(unit_title_match.group(1)) if unit_title_match else f'Unit {unit_num}'
                rows.append((unit_num, unit_title, overview, '', 0, 1))
            cards = parse_info_cards(html)
        
        for idx, card in enumerate(cards):
            rows.append((unit_num, card['title'], card['description'], card.get('imageUrl', ''), idx + 1, 0))
    
    lines = [
        "CREATE DATABASE IF NOT EXISTS aws;",
        "USE aws;",
        "",
        "DROP TABLE IF EXISTS card;",
        "CREATE TABLE card (",
        "    id INT AUTO_INCREMENT PRIMARY KEY,",
        "    pageId INT NOT NULL,",
        "    title VARCHAR(500) NOT NULL,",
        "    description TEXT,",
        "    imageUrl VARCHAR(512) DEFAULT '',",
        "    orderIndex INT DEFAULT 0,",
        "    showOnHomepage TINYINT DEFAULT 0",
        ");",
        "",
        "INSERT INTO card (pageId, title, description, imageUrl, orderIndex, showOnHomepage) VALUES",
    ]
    for i, (page_id, title, desc, img, order_idx, show) in enumerate(rows):
        desc_escaped = escape_sql(desc)
        title_escaped = escape_sql(title)
        img_escaped = escape_sql(img)
        lines.append(f"({page_id}, '{title_escaped}', '{desc_escaped}', '{img_escaped}', {order_idx}, {show})" + ("," if i < len(rows)-1 else ";"))
    
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print(f"Generated {OUTPUT_SQL} with {len(rows)} rows")

if __name__ == '__main__':
    main()
