"""Check every style PDF emitted by generate-template-previews.mjs.

Usage: python tests/check-pdf-pagination.py PATH_TO_GENERATED_PDFS
Requires pypdfium2. Final-page whitespace is expected and excluded.
"""
import sys
from pathlib import Path
import pypdfium2 as pdfium

files = [f for f in Path(sys.argv[1]).glob('*.pdf') if not f.name.startswith('roles-')]
assert len(files) == 15, f'Expected all 15 style PDFs, got {len(files)}'
for file in sorted(files):
    document = pdfium.PdfDocument(str(file))
    coverage = []
    for page in document:
        text = page.get_textpage()
        boxes = [text.get_charbox(i) for i in range(text.count_chars())
                 if text.get_text_range(i, 1).strip()]
        assert boxes, f'{file.name} contains an empty page'
        coverage.append((page.get_height() - min(b[1] for b in boxes)) / page.get_height())
        text.close()
        page.close()
    document.close()
    assert all(value >= .85 for value in coverage[:-1]), f'{file.name}: premature breaks {coverage}'
    print(file.stem, 'page-end %:', ', '.join(str(round(v * 100)) for v in coverage))
