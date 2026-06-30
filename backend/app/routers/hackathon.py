from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.agents.orchestrator import run_agent_pipeline
from app.models.schemas import GenerateRequest, GenerateResponse, ReportRequest
from app.services.pdf import generate_pdf_report

router = APIRouter(prefix="/api", tags=["hackathon"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_hackathon_plan(request: GenerateRequest, debate: bool = False) -> GenerateResponse:
    try:
        return await run_agent_pipeline(request, use_debate=debate)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {e}") from e


@router.post("/report/pdf")
async def download_pdf_report(request: ReportRequest) -> Response:
    try:
        pdf_bytes = generate_pdf_report(request)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Hackathon_Report.pdf"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}") from e


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "hackathon-partner-api"}
