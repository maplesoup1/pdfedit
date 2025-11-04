#!/usr/bin/env python3

import fitz
import sys
import json
import os
from typing import List, Dict, Any, Optional


class PDFProcessor:

    @staticmethod
    def add_text(
        pdf_path: str,
        output_path: str,
        text: str,
        x: float,
        y: float,
        page: int = 0,
        font_size: float = 12,
        color: tuple = (0, 0, 0),
        font_name: str = "helv"
    ) -> Dict[str, Any]:
        try:
            with fitz.open(pdf_path) as doc:

                if page < 0 or page >= len(doc):
                    return {"success": False, "error": f"Invalid page number: {page}"}

                page_obj = doc[page]
                page_obj.insert_text(
                    (x, y),
                    text,
                    fontsize=font_size,
                    color=color,
                    fontname=font_name
                )

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Text added to page {page}",
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def add_image(
        pdf_path: str,
        output_path: str,
        image_path: str,
        x: float,
        y: float,
        page: int = 0,
        width: Optional[float] = None,
        height: Optional[float] = None
    ) -> Dict[str, Any]:
        try:
            if not os.path.exists(image_path):
                return {"success": False, "error": f"Image not found: {image_path}"}

            with fitz.open(pdf_path) as doc:

                if page < 0 or page >= len(doc):
                    return {"success": False, "error": f"Invalid page number: {page}"}

                page_obj = doc[page]

                if width and height:
                    rect = fitz.Rect(x, y, x + width, y + height)
                else:
                    with fitz.open(image_path) as img:
                        img_rect = img[0].rect
                        rect = fitz.Rect(x, y, x + img_rect.width, y + img_rect.height)

                page_obj.insert_image(rect, filename=image_path)

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Image added to page {page}",
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def delete_pages(
        pdf_path: str,
        output_path: str,
        page_numbers: List[int]
    ) -> Dict[str, Any]:
        try:
            with fitz.open(pdf_path) as doc:

                invalid_pages = [p for p in page_numbers if p < 0 or p >= len(doc)]
                if invalid_pages:
                    return {"success": False, "error": f"Invalid page numbers: {invalid_pages}"}

                for page_num in sorted(page_numbers, reverse=True):
                    doc.delete_page(page_num)

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Deleted {len(page_numbers)} pages",
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def reorder_pages(
        pdf_path: str,
        output_path: str,
        new_order: List[int]
    ) -> Dict[str, Any]:
        try:
            with fitz.open(pdf_path) as doc:

                if len(new_order) != len(doc):
                    return {
                        "success": False,
                        "error": f"Order length ({len(new_order)}) doesn't match page count ({len(doc)})"
                    }

                invalid_pages = [p for p in new_order if p < 0 or p >= len(doc)]
                if invalid_pages:
                    return {"success": False, "error": f"Invalid page numbers: {invalid_pages}"}

                doc.select(new_order)

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Reordered {len(new_order)} pages",
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def merge_pdfs(
        pdf_paths: List[str],
        output_path: str
    ) -> Dict[str, Any]:
        try:
            missing_files = [p for p in pdf_paths if not os.path.exists(p)]
            if missing_files:
                return {"success": False, "error": f"Files not found: {missing_files}"}

            with fitz.open() as result_doc:

                for pdf_path in pdf_paths:
                    with fitz.open(pdf_path) as doc:
                        result_doc.insert_pdf(doc)

                result_doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Merged {len(pdf_paths)} PDFs",
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def extract_pages(
        pdf_path: str,
        output_path: str,
        page_numbers: List[int]
    ) -> Dict[str, Any]:
        try:
            with fitz.open(pdf_path) as doc:

                invalid_pages = [p for p in page_numbers if p < 0 or p >= len(doc)]
                if invalid_pages:
                    return {"success": False, "error": f"Invalid page numbers: {invalid_pages}"}

                doc.select(page_numbers)

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Extracted {len(page_numbers)} pages",
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def redact_text(
        pdf_path: str,
        output_path: str,
        targets: List[str],
        fill_color: tuple = (1, 1, 1)
    ) -> Dict[str, Any]:
        try:
            removed = 0
            with fitz.open(pdf_path) as doc:

                for page in doc:
                    for target in targets:
                        rects = page.search_for(target)
                        for rect in rects:
                            page.add_redact_annot(rect, fill=fill_color)
                            removed += 1
                    page.apply_redactions()

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Redacted {removed} instances",
                    "removed_count": removed,
                    "output_path": os.path.abspath(output_path)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def get_info(pdf_path: str) -> Dict[str, Any]:
        try:
            with fitz.open(pdf_path) as doc:

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

                return info
        except Exception as e:
            return {"success": False, "error": str(e)}
