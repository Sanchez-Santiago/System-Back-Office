#!/usr/bin/env python3
"""Extract unique content (KPI cards + main content) from captured DOM files,
stripping the shared header shell."""

import os, re

CAPTURED_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/captured-dom'
CONTENT_DIR = CAPTURED_DIR + '/content'
os.makedirs(CONTENT_DIR, exist_ok=True)

PAGES = {
    'gestion': 'gestion.html',
    'seguimiento': 'seguimiento.html',
    'reportes': 'reportes.html',
    'ofertas': 'ofertas.html',
    'aichat': 'aichat.html',
    'nomina': 'nomina.html',
}

for name, filename in PAGES.items():
    with open(os.path.join(CAPTURED_DIR, filename)) as f:
        html = f.read()

    # The shared structure is:
    # <div class="min-h-screen pb-40">
    #   <div class="fixed top-[12vh]..."> (notifications container - empty)
    #   <header>...</header>
    #   <div class="fixed bottom-[2vh]..."> (inspection badge)
    #   <div class="w-[98vw] mx-auto px-[1vw] mb-[2vh] relative z-20"> (KPI cards)
    #   <main>...</main>
    #   (modals for aichat/nomina)
    # </div>

    # Strategy: find KPI cards + <main> content + any modals after main

    kpi_start = html.find('<div class="w-[98vw] mx-auto px-[1vw] mb-[2vh] relative z-20">')

    # Find the closing wrapper </div> that matches min-h-screen
    # The structure is ...</main>...modal(s)...</div>
    # Find the LAST </div> which closes min-h-screen
    main_end = html.rfind('</main>')
    if main_end > 0:
        main_end += len('</main>')

    # For aichat and nomina, there's useful modal content after </main>
    # For others, content ends after </main>
    # Find the closing </div> of min-h-screen
    outer_close = html.rfind('</div>')
    
    if kpi_start > 0 and main_end > 0:
        # KPI cards + main content
        kpi_and_main = html[kpi_start:main_end]

        # Also capture modals (content after </main> but before </div>)
        modals = ''
        if main_end < outer_close:
            modals = html[main_end:outer_close]

        content = kpi_and_main + modals

        with open(os.path.join(CONTENT_DIR, f'{name}.html'), 'w') as f:
            f.write(content)

        print(f'{name}: extracted {len(content)} chars (kpi+main={len(kpi_and_main)}, modals={len(modals)})')
    else:
        print(f'{name}: SKIPPED - kpi_start={kpi_start}, main_end={main_end}')
