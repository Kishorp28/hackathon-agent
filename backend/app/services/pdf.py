import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models.schemas import ReportRequest


def generate_pdf_report(request: ReportRequest) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", parent=styles["Heading1"], fontSize=22, spaceAfter=20)
    heading_style = ParagraphStyle("Heading", parent=styles["Heading2"], fontSize=14, spaceAfter=10, textColor=colors.HexColor("#1e40af"))
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14, spaceAfter=8)

    story = []

    story.append(Paragraph("Hackathon Partner Report", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", styles["Normal"]))
    story.append(Spacer(1, 0.25 * inch))
    story.append(Paragraph("Problem Statement", heading_style))
    story.append(Paragraph(_escape(request.problem_statement), body_style))
    story.append(Spacer(1, 0.15 * inch))

    for agent in request.agents:
        if agent.agent == "judge":
            continue
        story.append(Paragraph(agent.title, heading_style))
        for paragraph in agent.content.split("\n\n"):
            if paragraph.strip():
                story.append(Paragraph(_escape(paragraph.strip()), body_style))
        story.append(Spacer(1, 0.1 * inch))

    if request.judge:
        story.append(Paragraph("Judge Evaluation", heading_style))
        scores = [
            ["Category", "Score (/10)"],
            ["Innovation", str(request.judge.innovation)],
            ["Impact", str(request.judge.impact)],
            ["Technical", str(request.judge.technical)],
            ["Scalability", str(request.judge.scalability)],
        ]
        table = Table(scores, colWidths=[3 * inch, 1.5 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 0.1 * inch))
        story.append(Paragraph("Judge Feedback", styles["Heading3"]))
        story.append(Paragraph(_escape(request.judge.feedback), body_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )
