from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import fitz
import io
from typing import Optional

app = FastAPI(title="PDF Processor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/pdf/add-text")
async def add_text(
    pdf_file: UploadFile = File(...),
    text: str = Form(...),
    x: float = Form(...),
    y: float = Form(...),
    page: int = Form(0),
    font_size: float = Form(12),
    font_name: str = Form("helv"),
    color_r: float = Form(0),
    color_g: float = Form(0),
    color_b: float = Form(0)
):
    pdf_bytes = await pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    if page < 0 or page >= len(doc):
        return Response(
            content=f"Invalid page number: {page}",
            status_code=400
        )

    page_obj = doc[page]
    page_obj.insert_text(
        (x, y),
        text,
        fontsize=font_size,
        color=(color_r, color_g, color_b),
        fontname=font_name
    )

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={"x-operation-message": "Text added successfully"}
    )


@app.post("/pdf/add-image")
async def add_image(
    pdf_file: UploadFile = File(...),
    image_file: UploadFile = File(...),
    x: float = Form(...),
    y: float = Form(...),
    page: int = Form(0),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None)
):
    pdf_bytes = await pdf_file.read()
    image_bytes = await image_file.read()

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    if page < 0 or page >= len(doc):
        return Response(
            content=f"Invalid page number: {page}",
            status_code=400
        )

    page_obj = doc[page]

    if width and height:
        rect = fitz.Rect(x, y, x + width, y + height)
    else:
        img_doc = fitz.open(stream=image_bytes, filetype="png")
        img_rect = img_doc[0].rect
        rect = fitz.Rect(x, y, x + img_rect.width, y + img_rect.height)
        img_doc.close()

    page_obj.insert_image(rect, stream=image_bytes)

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={"x-operation-message": "Image added successfully"}
    )


@app.post("/pdf/delete-pages")
async def delete_pages(
    pdf_file: UploadFile = File(...),
    page_numbers: str = Form(...)
):
    pdf_bytes = await pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages = [int(p) for p in page_numbers.split(",")]

    invalid_pages = [p for p in pages if p < 0 or p >= len(doc)]
    if invalid_pages:
        return Response(
            content=f"Invalid page numbers: {invalid_pages}",
            status_code=400
        )

    for page_num in sorted(pages, reverse=True):
        doc.delete_page(page_num)

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={"x-operation-message": f"Deleted {len(pages)} pages"}
    )


@app.post("/pdf/reorder-pages")
async def reorder_pages(
    pdf_file: UploadFile = File(...),
    new_order: str = Form(...)
):
    pdf_bytes = await pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    order = [int(p) for p in new_order.split(",")]

    if len(order) != len(doc):
        return Response(
            content=f"Order length ({len(order)}) doesn't match page count ({len(doc)})",
            status_code=400
        )

    invalid_pages = [p for p in order if p < 0 or p >= len(doc)]
    if invalid_pages:
        return Response(
            content=f"Invalid page numbers: {invalid_pages}",
            status_code=400
        )

    doc.select(order)

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={"x-operation-message": f"Reordered {len(order)} pages"}
    )


@app.post("/pdf/extract-pages")
async def extract_pages(
    pdf_file: UploadFile = File(...),
    page_numbers: str = Form(...)
):
    pdf_bytes = await pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages = [int(p) for p in page_numbers.split(",")]

    invalid_pages = [p for p in pages if p < 0 or p >= len(doc)]
    if invalid_pages:
        return Response(
            content=f"Invalid page numbers: {invalid_pages}",
            status_code=400
        )

    doc.select(pages)

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={"x-operation-message": f"Extracted {len(pages)} pages"}
    )


@app.post("/pdf/redact-text")
async def redact_text(
    pdf_file: UploadFile = File(...),
    targets: str = Form(...),
    fill_r: float = Form(1),
    fill_g: float = Form(1),
    fill_b: float = Form(1)
):
    pdf_bytes = await pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    target_list = targets.split(",")
    removed = 0

    for page in doc:
        for target in target_list:
            rects = page.search_for(target)
            for rect in rects:
                page.add_redact_annot(rect, fill=(fill_r, fill_g, fill_b))
                removed += 1
        page.apply_redactions()

    output = io.BytesIO()
    doc.save(output)
    doc.close()

    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={
            "x-operation-message": f"Redacted {removed} instances",
            "x-removed-count": str(removed)
        }
    )


@app.post("/pdf/get-info")
async def get_info(pdf_file: UploadFile = File(...)):
    pdf_bytes = await pdf_file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")

    pages_info = []
    for i, page in enumerate(doc):
        pages_info.append({
            "page_number": i,
            "width": page.rect.width,
            "height": page.rect.height,
            "rotation": page.rotation
        })

    metadata = doc.metadata

    info = {
        "success": True,
        "page_count": len(doc),
        "pages": pages_info,
        "metadata": {
            "title": metadata.get("title", ""),
            "author": metadata.get("author", ""),
            "subject": metadata.get("subject", ""),
            "creator": metadata.get("creator", "")
        }
    }

    doc.close()

    return info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
