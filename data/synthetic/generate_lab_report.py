"""
Generate a realistic synthetic laboratory report PDF for HealthRisk AI testing.
Produces: sample_lab_report.pdf in the project root.
Compatible with fpdf2 v2.8+ (no ln=True, no Unicode chars outside latin-1).
"""
from fpdf import FPDF, XPos, YPos
from datetime import date
import os

OUTPUT = "sample_lab_report.pdf"

# Use ASCII-safe dash instead of unicode en-dash
DASH = " - "


class LabReportPDF(FPDF):
    def header(self):
        self.set_fill_color(0, 82, 147)
        self.rect(0, 0, 210, 28, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 16)
        self.set_xy(10, 6)
        self.cell(0, 8, "CITY GENERAL HOSPITAL & DIAGNOSTIC CENTRE",
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_font("Helvetica", "", 9)
        self.set_xy(10, 15)
        self.cell(0, 5,
                  "123 Medical Plaza, New Delhi - 110001  |  Ph: +91-11-2345-6789  |  lab@cityhospital.in",
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(0, 0, 0)
        self.ln(6)

    def footer(self):
        self.set_y(-18)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5,
                  "DISCLAIMER: This report is for clinical information only. "
                  "Results should be interpreted by a qualified healthcare professional. "
                  "Not valid without authorised signature.",
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        self.cell(0, 5,
                  f"Page {self.page_no()} | Printed: {date.today().strftime('%d-%b-%Y')}",
                  align="C")

    def section_title(self, text):
        self.set_fill_color(230, 240, 255)
        self.set_text_color(0, 50, 120)
        self.set_font("Helvetica", "B", 10)
        self.cell(0, 7, f"  {text}",
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT, fill=True)
        self.set_text_color(0, 0, 0)
        self.ln(1)

    def table_header(self, cols, widths):
        self.set_fill_color(0, 82, 147)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 8)
        for col, w in zip(cols, widths):
            self.cell(w, 6, col, fill=True, align="C")
        self.ln()
        self.set_text_color(0, 0, 0)

    def table_row(self, values, widths, flag=False):
        if flag:
            self.set_fill_color(255, 235, 235)
        elif int(self.get_y() // 6) % 2 == 0:
            self.set_fill_color(248, 248, 248)
        else:
            self.set_fill_color(255, 255, 255)
        self.set_font("Helvetica", "B" if flag else "", 8)
        for i, (val, w) in enumerate(zip(values, widths)):
            align = "L" if i == 0 else "C"
            self.cell(w, 6, str(val), fill=True, align=align)
        self.ln()


def r(lo, hi):
    """Format reference range with ASCII dash"""
    return f"{lo} - {hi}"


def build():
    pdf = LabReportPDF()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # ── Title ─────────────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(0, 82, 147)
    pdf.cell(0, 8, "COMPLETE BLOOD & BIOCHEMISTRY PANEL REPORT",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.set_text_color(0, 0, 0)
    pdf.ln(3)

    # ── Patient / Report info block ───────────────────────────────────────────
    col = 95
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(240, 245, 255)
    pdf.cell(col, 6, "  PATIENT DETAILS", fill=True)
    pdf.cell(col, 6, "  REPORT DETAILS", fill=True)
    pdf.ln()

    left = [
        ("Patient Name",  "Rajesh Kumar Sharma"),
        ("Date of Birth", "14-Mar-1978  (Age: 48 yrs)"),
        ("Gender",        "Male"),
        ("Patient ID",    "CGH-2026-00847"),
        ("Referred By",   "Dr. Priya Mehta, MD"),
    ]
    right = [
        ("Sample ID",       "LAB-S-20260922-0391"),
        ("Collection Date", "22-Sep-2026  07:45 AM"),
        ("Report Date",     "22-Sep-2026  01:30 PM"),
        ("Sample Type",     "Venous Blood / Serum"),
        ("Lab Technician",  "Mr. Anil Verma (MT-4421)"),
    ]
    for (lk, lv), (rk, rv) in zip(left, right):
        pdf.set_font("Helvetica", "B", 8)
        pdf.cell(28, 5, lk + ":")
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(col - 28, 5, lv)
        pdf.set_font("Helvetica", "B", 8)
        pdf.cell(28, 5, rk + ":")
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(col - 28, 5, rv)
        pdf.ln()

    pdf.ln(4)

    widths = [70, 28, 28, 44, 20]

    # ══════════════════════════════════════════════════════════════════════════
    # 1. COMPLETE BLOOD COUNT
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("1. COMPLETE BLOOD COUNT (CBC)")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("Haemoglobin (Hb)",           "11.2",   "g/dL",     r("13.0","17.0"),    True),
        ("Total RBC Count",             "3.98",   "mill/cmm", r("4.5","5.5"),      True),
        ("Haematocrit (PCV)",           "34.6",   "%",        r("40","50"),         True),
        ("MCV",                         "86.9",   "fL",       r("83","101"),        False),
        ("MCH",                         "28.1",   "pg",       r("27","32"),         False),
        ("MCHC",                        "32.4",   "g/dL",     r("31.5","34.5"),     False),
        ("RDW-CV",                      "16.8",   "%",        r("11.6","14.0"),     True),
        ("Total WBC Count",             "11400",  "cells/cmm",r("4000","11000"),    True),
        ("Neutrophils",                 "74",     "%",        r("40","75"),         False),
        ("Lymphocytes",                 "18",     "%",        r("20","45"),         True),
        ("Monocytes",                   "6",      "%",        r("2","10"),          False),
        ("Eosinophils",                 "2",      "%",        r("1","6"),           False),
        ("Platelet Count",              "152000", "cells/cmm",r("150000","410000"), False),
        ("Erythrocyte Sed. Rate (ESR)", "42",     "mm/hr",    r("0","15"),          True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 2. LIVER FUNCTION TEST
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("2. LIVER FUNCTION TEST (LFT)")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("Total Bilirubin",       "2.8",  "mg/dL", r("0.2","1.2"),  True),
        ("Direct Bilirubin",      "1.4",  "mg/dL", r("0.0","0.4"),  True),
        ("Indirect Bilirubin",    "1.4",  "mg/dL", r("0.2","0.9"),  True),
        ("SGPT / ALT",            "78",   "U/L",   r("7","56"),     True),
        ("SGOT / AST",            "54",   "U/L",   r("10","40"),    True),
        ("Alkaline Phosphatase",  "112",  "U/L",   r("44","147"),   False),
        ("GGT",                   "68",   "U/L",   r("10","71"),    False),
        ("Total Protein",         "6.8",  "g/dL",  r("6.0","8.3"),  False),
        ("Albumin",               "3.4",  "g/dL",  r("3.5","5.0"),  True),
        ("Globulin",              "3.4",  "g/dL",  r("2.0","3.5"),  False),
        ("A/G Ratio",             "1.0",  "",      r("1.2","2.2"),  True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 3. KIDNEY FUNCTION TEST
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("3. KIDNEY FUNCTION TEST (KFT / RFT)")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("Blood Urea Nitrogen (BUN)", "24",   "mg/dL",          r("7","20"),       True),
        ("Serum Creatinine",          "1.42", "mg/dL",          r("0.74","1.35"),  True),
        ("eGFR (CKD-EPI)",           "56",   "mL/min/1.73m2",  "> 60",            True),
        ("Uric Acid",                 "7.8",  "mg/dL",          r("3.5","7.2"),    True),
        ("Serum Sodium (Na+)",        "138",  "mEq/L",          r("136","145"),    False),
        ("Serum Potassium (K+)",      "5.6",  "mEq/L",          r("3.5","5.1"),    True),
        ("Serum Chloride (Cl-)",      "102",  "mEq/L",          r("98","107"),     False),
        ("Serum Bicarbonate",         "20",   "mEq/L",          r("22","29"),      True),
        ("Calcium (Total)",           "8.2",  "mg/dL",          r("8.5","10.5"),   True),
        ("Phosphorus",                "4.8",  "mg/dL",          r("2.5","4.5"),    True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 4. LIPID PROFILE
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("4. LIPID PROFILE")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("Total Cholesterol",      "238", "mg/dL", "< 200",      True),
        ("Triglycerides",          "312", "mg/dL", "< 150",      True),
        ("HDL Cholesterol",        "34",  "mg/dL", "> 40",       True),
        ("LDL Cholesterol",        "166", "mg/dL", "< 100",      True),
        ("VLDL",                   "62",  "mg/dL", r("2","30"),  True),
        ("Non-HDL Cholesterol",    "204", "mg/dL", "< 130",      True),
        ("Total Cholesterol/HDL",  "7.0", "ratio", "< 4.5",      True),
        ("LDL/HDL Ratio",          "4.9", "ratio", "< 3.0",      True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 5. DIABETES PANEL
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("5. DIABETES PANEL")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("Fasting Blood Glucose",       "142", "mg/dL",  r("70","100"),   True),
        ("Post-Prandial Blood Glucose", "224", "mg/dL",  "< 140",         True),
        ("HbA1c",                       "8.2", "%",      "< 5.7",         True),
        ("Estimated Average Glucose",   "189", "mg/dL",  "< 126",         True),
        ("Fasting Insulin",             "22.4","uIU/mL", r("2.6","24.9"), False),
        ("HOMA-IR",                     "7.8", "",       "< 2.5",         True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 6. THYROID FUNCTION
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("6. THYROID FUNCTION TEST (TFT)")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("TSH (Thyroid Stimulating Hormone)", "6.8",  "uIU/mL", r("0.4","4.0"), True),
        ("Free T3 (fT3)",                     "3.1",  "pg/mL",  r("2.3","4.2"), False),
        ("Free T4 (fT4)",                     "0.74", "ng/dL",  r("0.8","1.8"), True),
        ("Anti-TPO Antibodies",               "142",  "IU/mL",  "< 34",         True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 7. VITAMINS & MINERALS
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("7. VITAMINS & MINERALS")
    pdf.table_header(["TEST", "RESULT", "UNIT", "REFERENCE RANGE", "STATUS"], widths)
    for row in [
        ("Vitamin D (25-OH)",      "14.2", "ng/mL",  r("30","100"),  True),
        ("Vitamin B12",            "186",  "pg/mL",  r("200","900"), True),
        ("Folate (Folic Acid)",    "3.8",  "ng/mL",  r("3.0","17.0"),False),
        ("Serum Iron",             "52",   "ug/dL",  r("60","170"),  True),
        ("TIBC",                   "398",  "ug/dL",  r("250","370"), True),
        ("Transferrin Saturation", "13",   "%",      r("20","50"),   True),
        ("Serum Ferritin",         "8.4",  "ng/mL",  r("12","300"),  True),
        ("Magnesium",              "1.6",  "mg/dL",  r("1.7","2.2"), True),
    ]:
        pdf.table_row([row[0], row[1], row[2], row[3], "Abnormal" if row[4] else "Normal"], widths, flag=row[4])

    pdf.ln(4)

    # ══════════════════════════════════════════════════════════════════════════
    # 8. CLINICAL NOTES
    # ══════════════════════════════════════════════════════════════════════════
    pdf.section_title("8. CLINICAL OBSERVATIONS (Lab Perspective)")
    notes = [
        "* Haemoglobin and RBC count below normal range - possible anaemia, iron deficiency pattern noted.",
        "* Elevated liver enzymes (SGPT/SGOT) with raised bilirubin - suggestive of hepatic involvement.",
        "* eGFR 56 mL/min/1.73m2 indicates Stage G3a Chronic Kidney Disease.",
        "* Severely deranged lipid profile: high LDL, very high triglycerides, low HDL - high cardiovascular risk.",
        "* Fasting glucose 142 mg/dL and HbA1c 8.2% indicate poorly controlled Type 2 Diabetes Mellitus.",
        "* TSH elevated with low fT4 and raised Anti-TPO antibodies - consistent with Hashimoto's Hypothyroidism.",
        "* Iron deficiency markers low (Ferritin 8.4, Saturation 13%) - iron deficiency anaemia likely.",
        "* Vitamin D and B12 deficiency noted - supplementation may be warranted.",
        "* All findings require clinical correlation and interpretation by the treating physician.",
    ]
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(60, 60, 60)
    for note in notes:
        pdf.set_x(pdf.l_margin + 3)
        pdf.multi_cell(0, 5, note)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

    # ── Signatures ────────────────────────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(95, 5, "Lab Technician:")
    pdf.cell(95, 5, "Authorised by:")
    pdf.ln()
    pdf.ln(8)
    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(95, 5, "Mr. Anil Verma  (MT-4421)")
    pdf.cell(95, 5, "Dr. Sunita Rao, MD, DM (Pathology)")
    pdf.ln()
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(95, 5, "City General Hospital Lab")
    pdf.cell(95, 5, "Senior Consultant Pathologist")
    pdf.ln()
    pdf.cell(95, 5, "Date: 22-Sep-2026")
    pdf.cell(95, 5, "Reg. No.: MCI-2001-04-12847")
    pdf.ln()

    pdf.output(OUTPUT)
    size = os.path.getsize(OUTPUT)
    print(f"[OK] PDF saved: {OUTPUT}  ({size:,} bytes)")


if __name__ == "__main__":
    build()
