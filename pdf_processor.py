#!/usr/bin/env python3

import fitz
import os
from typing import List, Dict, Any, Optional, Tuple


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
    def search_text(
        pdf_path: str,
        query: str,
        case_sensitive: bool = False,
        whole_word: bool = False,
        max_hits: int = 0
    ) -> Dict[str, Any]:
        try:
            normalized_query = query if case_sensitive else query.lower()

            with fitz.open(pdf_path) as doc:
                matches: List[Dict[str, Any]] = []
                for page_index, page in enumerate(doc):
                    rects = page.search_for(
                        query,
                        hit_max=max_hits if max_hits else 0,
                    )
                    for rect in rects:
                        extracted = page.get_textbox(rect).strip()
                        normalized_extracted = extracted if case_sensitive else extracted.lower()

                        if whole_word:
                            if normalized_extracted != normalized_query:
                                continue
                        else:
                            if normalized_query not in normalized_extracted:
                                continue

                        matches.append({
                            "page": page_index,
                            "text": extracted,
                            "rect": [rect.x0, rect.y0, rect.x1, rect.y1]
                        })

                return {
                    "success": True,
                    "query": query,
                    "match_count": len(matches),
                    "matches": matches,
                    "page_count": len(doc)
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def replace_text_instance(
        pdf_path: str,
        output_path: str,
        page: int,
        rect_coords: List[float],
        replacement: Optional[str] = None,
        font_size: float = 12,
        color: Tuple[float, float, float] = (0, 0, 0),
        font_name: str = "helv",
        align: int = 0,
        fill_color: Tuple[float, float, float] = (1, 1, 1)
    ) -> Dict[str, Any]:
        try:
            if len(rect_coords) != 4:
                return {"success": False, "error": "rect must contain 4 values"}

            with fitz.open(pdf_path) as doc:

                if page < 0 or page >= len(doc):
                    return {"success": False, "error": f"Invalid page number: {page}"}

                page_obj = doc[page]
                rect = fitz.Rect(*rect_coords)

                page_obj.add_redact_annot(rect, fill=fill_color)
                page_obj.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

                if replacement:
                    page_obj.insert_textbox(
                        rect,
                        replacement,
                        fontsize=font_size,
                        fontname=font_name,
                        color=color,
                        align=align
                    )

                doc.save(output_path)

                return {
                    "success": True,
                    "message": "Replaced text" if replacement else "Removed text",
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
    def search_text(pdf_path: str, search_term: str, case_sensitive: bool = False) -> Dict[str, Any]:
        """
        Search for text in PDF and return all matches with location info
        """
        try:
            with fitz.open(pdf_path) as doc:
                results = []
                total_matches = 0

                for page_num, page in enumerate(doc):
                    # Search for text (PyMuPDF search is case-sensitive by default)
                    search_flags = 0 if case_sensitive else fitz.TEXT_PRESERVE_WHITESPACE
                    rects = page.search_for(search_term, flags=search_flags)

                    for rect in rects:
                        # Get surrounding text for context
                        text_dict = page.get_text("dict")
                        context = search_term  # Simple context (can be enhanced)

                        results.append({
                            "page": page_num,
                            "text": search_term,
                            "rect": [rect.x0, rect.y0, rect.x1, rect.y1],
                            "context": context
                        })
                        total_matches += 1

                return {
                    "success": True,
                    "total_matches": total_matches,
                    "search_term": search_term,
                    "results": results
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def replace_text(
        pdf_path: str,
        output_path: str,
        search_term: str,
        replacement: str,
        page: Optional[int] = None,
        font_size: Optional[float] = None,
        font_name: str = "helv",
        color: tuple = (0, 0, 0)
    ) -> Dict[str, Any]:
        """
        Replace text in PDF by redacting old text and adding new text
        """
        try:
            replaced_count = 0
            with fitz.open(pdf_path) as doc:
                pages_to_process = [doc[page]] if page is not None else doc

                for page_obj in pages_to_process:
                    # Find all instances of search term
                    rects = page_obj.search_for(search_term)

                    for rect in rects:
                        # Redact (cover) the old text with white
                        page_obj.add_redact_annot(rect, fill=(1, 1, 1))

                        # Calculate font size if not provided
                        if font_size is None:
                            estimated_font_size = rect.height * 0.8
                        else:
                            estimated_font_size = font_size

                        # Insert new text at the same position
                        # Note: Position might need adjustment for better alignment
                        page_obj.insert_text(
                            (rect.x0, rect.y1 - 2),  # Slight vertical adjustment
                            replacement,
                            fontsize=estimated_font_size,
                            color=color,
                            fontname=font_name
                        )

                        replaced_count += 1

                    # Apply redactions
                    page_obj.apply_redactions()

                doc.save(output_path)

                return {
                    "success": True,
                    "message": f"Replaced {replaced_count} instances",
                    "replaced_count": replaced_count,
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
