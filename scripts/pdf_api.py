#!/usr/bin/env python3

from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Tuple

from fastapi import (
    BackgroundTasks,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse, JSONResponse

from pdf_processor import PDFProcessor


app = FastAPI(
    title="PDF Processor API",
    description="REST API wrapper around PDFProcessor utilities.",
    version="1.0.0",
)

processor = PDFProcessor()


def _mk_workdir() -> Path:
    return Path(tempfile.mkdtemp(prefix="pdf_processor_"))


def _save_upload(upload: UploadFile, directory: Path, *, default_suffix: str = "") -> Path:
    filename = upload.filename or ""
    suffix = Path(filename).suffix or default_suffix
    fd, temp_path = tempfile.mkstemp(dir=str(directory), suffix=suffix)
    with os.fdopen(fd, "wb") as buffer:
        upload.file.seek(0)
        shutil.copyfileobj(upload.file, buffer)
    return Path(temp_path)


def _parse_int_list(raw: str, field_name: str) -> List[int]:
    try:
        return [int(item.strip()) for item in raw.split(",") if item.strip()]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid integer list for '{field_name}'.") from exc


def _parse_string_list(raw: str) -> List[str]:
    return [item.strip() for item in raw.split(",") if item.strip()]


def _ensure_success(result: Dict[str, Any]) -> Dict[str, Any]:
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Operation failed."))
    return result


def _file_result_response(
    *,
    result: Dict[str, Any],
    background_tasks: BackgroundTasks,
    workdir: Path,
    download_name: str,
) -> FileResponse:
    data = _ensure_success(result)
    output_path = Path(data.get("output_path", ""))
    if not output_path.is_file():
        background_tasks.add_task(shutil.rmtree, workdir, ignore_errors=True)
        raise HTTPException(status_code=500, detail="Expected output file was not produced.")

    headers = {}
    if data.get("message"):
        headers["X-Operation-Message"] = data["message"]
    if "removed_count" in data:
        headers["X-Removed-Count"] = str(data["removed_count"])

    background_tasks.add_task(shutil.rmtree, workdir, ignore_errors=True)

    return FileResponse(
        path=str(output_path),
        media_type="application/pdf",
        filename=download_name,
        headers=headers,
    )


def _cleanup_and_raise(workdir: Path, status_code: int, detail: str) -> None:
    shutil.rmtree(workdir, ignore_errors=True)
    raise HTTPException(status_code=status_code, detail=detail)


@app.post("/pdf/add-text")
async def add_text(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    text: str = Form(...),
    x: float = Form(...),
    y: float = Form(...),
    page: int = Form(0),
    font_size: float = Form(12.0),
    font_name: str = Form("helv"),
    color_r: float = Form(0.0),
    color_g: float = Form(0.0),
    color_b: float = Form(0.0),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"
        color: Tuple[float, float, float] = (color_r, color_g, color_b)

        result = processor.add_text(
            str(pdf_path),
            str(output_path),
            text,
            x,
            y,
            page,
            font_size,
            color,
            font_name,
        )

        download_name = f"add-text-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/add-image")
async def add_image(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    image_file: UploadFile = File(...),
    x: float = Form(...),
    y: float = Form(...),
    page: int = Form(0),
    width: float | None = Form(None),
    height: float | None = Form(None),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        image_path = _save_upload(image_file, workdir)
        output_path = workdir / "output.pdf"

        result = processor.add_image(
            str(pdf_path),
            str(output_path),
            str(image_path),
            x,
            y,
            page,
            width,
            height,
        )

        download_name = f"add-image-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/delete-pages")
async def delete_pages(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    page_numbers: str = Form(..., description="Comma-separated page indices (0-based)."),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        indices = _parse_int_list(page_numbers, "page_numbers")
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"

        result = processor.delete_pages(
            str(pdf_path),
            str(output_path),
            indices,
        )

        download_name = f"delete-pages-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/reorder-pages")
async def reorder_pages(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    new_order: str = Form(..., description="Comma-separated target order, 0-based."),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        order = _parse_int_list(new_order, "new_order")
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"

        result = processor.reorder_pages(
            str(pdf_path),
            str(output_path),
            order,
        )

        download_name = f"reorder-pages-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/merge")
async def merge_pdfs(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="Upload at least two PDF files."),
) -> FileResponse:
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDF files are required.")

    workdir = _mk_workdir()
    try:
        pdf_paths = [str(_save_upload(upload, workdir, default_suffix=".pdf")) for upload in files]
        output_path = workdir / "merged.pdf"

        result = processor.merge_pdfs(
            pdf_paths,
            str(output_path),
        )

        download_name = "merged.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/extract-pages")
async def extract_pages(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    page_numbers: str = Form(..., description="Comma-separated page indices (0-based)."),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        indices = _parse_int_list(page_numbers, "page_numbers")
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"

        result = processor.extract_pages(
            str(pdf_path),
            str(output_path),
            indices,
        )

        download_name = f"extract-pages-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/redact-text")
async def redact_text(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    targets: str = Form(..., description="Comma-separated strings to redact."),
    fill_r: float = Form(1.0),
    fill_g: float = Form(1.0),
    fill_b: float = Form(1.0),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"

        fill_color: Tuple[float, float, float] = (fill_r, fill_g, fill_b)
        target_list = _parse_string_list(targets)
        if not target_list:
            _cleanup_and_raise(workdir, 400, "At least one target string is required.")

        result = processor.redact_text(
            str(pdf_path),
            str(output_path),
            target_list,
            fill_color,
        )

        download_name = f"redact-text-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.post("/pdf/get-info")
async def get_info(pdf_file: UploadFile = File(...)) -> JSONResponse:
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        result = processor.get_info(str(pdf_path))
        _ensure_success(result)
        return JSONResponse(content=result)
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


@app.post("/pdf/search-text")
async def search_text(
    pdf_file: UploadFile = File(...),
    query: str = Form(..., description="Text to search for"),
    case_sensitive: bool = Form(False),
    whole_word: bool = Form(False),
    max_hits: int | None = Form(None),
) -> JSONResponse:
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        result = processor.search_text(
            str(pdf_path),
            query,
            case_sensitive=case_sensitive,
            whole_word=whole_word,
            max_hits=max_hits or 0,
        )
        _ensure_success(result)
        return JSONResponse(content=result)
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


@app.post("/pdf/replace-text")
async def replace_text(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(...),
    page: int = Form(..., description="Page index (0-based)"),
    rect: str = Form(..., description="Comma-separated rect coordinates x0,y0,x1,y1."),
    replacement: str | None = Form(None, description="Replacement text (leave empty to delete)"),
    font_size: float = Form(12.0, description="Font size for replacement text"),
    font_name: str = Form("helv"),
    color_r: float = Form(0.0),
    color_g: float = Form(0.0),
    color_b: float = Form(0.0),
    align: int = Form(0, description="fitz text alignment (0=left,1=center,2=right,3=justify)"),
    fill_r: float = Form(1.0),
    fill_g: float = Form(1.0),
    fill_b: float = Form(1.0),
) -> FileResponse:
    workdir = _mk_workdir()
    try:
        pdf_path = _save_upload(pdf_file, workdir, default_suffix=".pdf")
        output_path = workdir / "output.pdf"

        try:
            rect_values = [float(value.strip()) for value in rect.split(",")]
        except Exception as exc:
            _cleanup_and_raise(workdir, 400, f"Invalid rect: {exc}")

        color: Tuple[float, float, float] = (color_r, color_g, color_b)
        fill_color: Tuple[float, float, float] = (fill_r, fill_g, fill_b)

        result = processor.replace_text_instance(
            str(pdf_path),
            str(output_path),
            page=page,
            rect_coords=rect_values,
            replacement=replacement,
            font_size=font_size,
            color=color,
            font_name=font_name,
            align=align,
            fill_color=fill_color,
        )

        download_name = f"replace-text-{pdf_file.filename or 'document'}.pdf"
        return _file_result_response(
            result=result,
            background_tasks=background_tasks,
            workdir=workdir,
            download_name=download_name,
        )
    except HTTPException:
        shutil.rmtree(workdir, ignore_errors=True)
        raise
    except Exception as exc:
        _cleanup_and_raise(workdir, 500, str(exc))


@app.get("/healthz")
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("scripts.pdf_api:app", host="0.0.0.0", port=8000, reload=True)
