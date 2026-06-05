"""Generate mock legal-corpus PDF files from the seed laws.

One PDF per kodeks (code), saved under storage/laws_pdfs/. Used by the
frontend legal library. Uzbek-Latin text is normalised to latin-1 safe
characters so the fpdf2 core font renders it without a bundled TTF.
"""
import json
import os

from app.core.config import settings

LAWS_PDF_DIR = os.path.join(settings.STORAGE_DIR, "laws_pdfs")
_DATA = os.path.join(os.path.dirname(__file__), "..", "data", "laws_sample.json")

CODE_NAMES = {
    "FK": "O'zbekiston Respublikasi Fuqarolik kodeksi",
    "MK": "O'zbekiston Respublikasi Mehnat kodeksi",
    "OK": "O'zbekiston Respublikasi Oila kodeksi",
    "JK": "O'zbekiston Respublikasi Jinoyat kodeksi",
    "MJK": "Ma'muriy javobgarlik to'g'risidagi kodeks",
    "FPK": "Fuqarolik protsessual kodeksi",
    "IPK": "Iqtisodiy protsessual kodeks",
}


def _latin1(text: str) -> str:
    """Normalise smart punctuation so the core PDF font can render it."""
    repl = {
        "‘": "'", "’": "'", "ʻ": "'", "ʼ": "'",
        "“": '"', "”": '"', "–": "-", "—": "-",
        "…": "...", "′": "'",
    }
    for k, v in repl.items():
        text = text.replace(k, v)
    return text.encode("latin-1", "replace").decode("latin-1")


def generate_law_pdfs() -> list[str]:
    """(Re)generate one PDF per kodeks. Returns list of filenames."""
    from fpdf import FPDF

    os.makedirs(LAWS_PDF_DIR, exist_ok=True)
    with open(_DATA, encoding="utf-8") as f:
        laws = json.load(f)

    by_code: dict[str, list] = {}
    for law in laws:
        by_code.setdefault(law["code"], []).append(law)

    written = []
    for code, items in by_code.items():
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=18)
        pdf.add_page()

        title = CODE_NAMES.get(code, f"{code} kodeksi")
        pdf.set_font("Helvetica", "B", 16)
        pdf.multi_cell(0, 9, _latin1(title))
        pdf.ln(2)
        pdf.set_font("Helvetica", "I", 10)
        pdf.set_text_color(110, 110, 110)
        pdf.multi_cell(0, 6, _latin1("SmartCourt AI - demo huquqiy korpus. Rasmiy manba emas."))
        pdf.set_text_color(0, 0, 0)
        pdf.ln(4)

        for law in items:
            pdf.set_font("Helvetica", "B", 12)
            pdf.multi_cell(0, 7, _latin1(f"{law['article']}-modda. {law['title']}"))
            pdf.ln(1)
            pdf.set_font("Helvetica", "", 11)
            pdf.multi_cell(0, 6, _latin1(law["text"]))
            pdf.ln(4)

        fname = f"{code}_kodeks.pdf"
        pdf.output(os.path.join(LAWS_PDF_DIR, fname))
        written.append(fname)

    return written


if __name__ == "__main__":
    print(generate_law_pdfs())
