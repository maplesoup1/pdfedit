import fitz  # PyMuPDF
import os

# input and output file paths
input_pdf = "MC18414737.pdf"
output_pdf = "MC18414737_redacted.pdf"

doc = fitz.open(input_pdf)
removed = 0

for page_number, page in enumerate(doc, start=1):
    targets = ["The Element Pty Ltd", "The Element(NSW) Pty Ltd"]
    for t in targets:
        rects = page.search_for(t)
        for rect in rects:
            page.add_redact_annot(rect, fill=(1, 1, 1))
            removed += 1
    page.apply_redactions()

print(f"✅ totally deleted {removed} parts")


doc.save(output_pdf)
doc.close()

print(f"💾 Saved: {os.path.abspath(output_pdf)}")
