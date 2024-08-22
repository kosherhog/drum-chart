import re
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

markup_text = """
[table]
Intro
4
[/table]
[table]
Verse
8
No snare 2 bars BD
Here come old flattop
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
[table]
Row 1
Row 2
Row 3
Row 4
[/table]
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

    stylesheet = getSampleStyleSheet()
    courier_style = stylesheet['Normal']  # Use the 'Normal' style as a base

    # Customize the font for the paragraph
    courier_style.fontName = 'Courier'  # Set the font to Courier
    # courier_style.fontSize = 12  # Adjust the font size as needed

    # Example markup parsing logic
    parts = re.split(r"(\[break\])", text)
    parsed_parts = []
    print(parts)
    for part in parts:
        if part == "[break]":
            parsed_parts.append(part)
        else:
            tables = re.findall(r"\[table\]([^\[]*)\[/table\]", part, re.DOTALL)
            print(f"tables {tables}")
            for table in tables:
                rows = table.strip().split("\n")
                while len(rows) < 4:
                    rows += [""]
                print(f"rows {rows}")
                rows = list(map(lambda x: Paragraph(x, courier_style), rows))
                parsed_parts.append(rows)
    return parsed_parts


def create_table(items) -> Table:
    column_widths = ['12%','12%','12%','12%','12%','12%','12%']
    # column_widths = None
    row_heights = None

    items = [["Form", "Bars", "Instr", "Lyrics"]] + items
    transpose = [list(x) for x in zip(*items)]
    print(f"items: {transpose}")
    table = Table(
        transpose, colWidths=column_widths, rowHeights=row_heights, hAlign="LEFT"
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.grey),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.whitesmoke),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (-1, -1), "Courier"),
                # ('BOTTOMPADDING', (0, 0), (0, -1), 12),
                # ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ("INNERGRID", (0, 0), (-1, -1), 2, colors.black),
            ]
        )
    )

    return table


def create_pdf(parsed_parts, filename):

    margin = 0.1 * inch
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=margin,
        rightMargin=margin,
        topMargin=margin,
        bottomMargin=margin,
    )
    elements = []
    items = []

    for part in parsed_parts:
        print(f"part {part}")
        if part == "[break]" or len(items) > 7:

            # dump the table we already have
            elements.append(create_table(items))
            elements.append(Spacer(1, 12))  # Add a spacer for the line break
            items = []
        else:
            # append to the current table
            items += [part]

    if items != []:
        elements.append(create_table(items))

    doc.build(elements)


def main():
    parsed_parts = parse_markup(markup_text)
    create_pdf(parsed_parts, "../build/output.pdf")
    return 0


if __name__ == "__main__":
    sys.exit(main())
