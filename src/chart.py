import re
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer
from reportlab.lib import colors

markup_text = """
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[break]
[table]
Row A
Row B
Row C
Row D
[/table]
[table]
Row X
Row Y
Row Z
Row W
[/table]
"""


def parse_markup(text):
    # Example markup parsing logic
    parts = re.split(r'(\[break\])', text)
    parsed_parts = []
    print(parts)
    for part in parts:
        if part == '[break]':
            parsed_parts.append(part)
        else:
            tables = re.findall(r'\[table\][^\[]*\[/table\]', part, re.DOTALL)
            print(tables)
            for table in tables:
                rows = table.strip().split('\n')
                parsed_parts.append(rows)
    return parsed_parts


def create_pdf(parsed_parts, filename):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    for part in parsed_parts:
        if part == '[break]':
            elements.append(Spacer(1, 12))  # Add a spacer for the line break
        else:
            column_widths = None
            row_heights = None
            columns = list(zip(*part))
            table = Table(columns, colWidths=column_widths, rowHeights=row_heights)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(table)

    doc.build(elements)


def main():
    parsed_parts = parse_markup(markup_text)
    create_pdf(parsed_parts, "output.pdf")
    return 0

if __name__ == '__main__':
    sys.exit(main()) 

