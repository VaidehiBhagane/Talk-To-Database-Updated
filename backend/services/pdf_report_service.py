"""
Service for generating PDF reports with AI insights
"""
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import io
import base64

class PDFReportService:
    """Service for generating formatted PDF reports"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#00ff88'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#00ff88'),
            spaceAfter=12,
            alignment=TA_LEFT
        ))
        
        # Summary box style
        self.styles.add(ParagraphStyle(
            name='SummaryText',
            parent=self.styles['BodyText'],
            fontSize=11,
            textColor=colors.black,
            spaceAfter=12,
            alignment=TA_JUSTIFY
        ))
    
    def generate_pdf(self, results, summary=None, chart_base64=None, query_text=None):
        """
        Generate a PDF report
        
        Args:
            results: List of dictionaries (query results)
            summary: AI-generated summary text
            chart_base64: Base64 encoded chart image
            query_text: Original query text
        
        Returns:
            BytesIO buffer containing the PDF
        """
        try:
            buffer = io.BytesIO()
            
            # Create PDF document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Container for PDF elements
            story = []
            
            # Add header
            story.extend(self._create_header())
            
            # Add query text if provided
            if query_text:
                story.extend(self._create_query_section(query_text))
            
            # Add AI summary if provided
            if summary:
                story.extend(self._create_summary_section(summary))
            
            # Add chart if provided
            if chart_base64:
                story.extend(self._create_chart_section(chart_base64))
            
            # Add data table
            if results and len(results) > 0:
                story.extend(self._create_data_table(results))
            else:
                story.append(Paragraph("No data to display", self.styles['BodyText']))
            
            # Build PDF
            doc.build(story)
            
            # Reset buffer position
            buffer.seek(0)
            
            return buffer
            
        except Exception as e:
            raise Exception(f"PDF generation failed: {str(e)}")
    
    def _create_header(self):
        """Create PDF header with title and timestamp"""
        elements = []
        
        # Title
        title = Paragraph("Talk to Database", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        # Subtitle with timestamp
        timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        subtitle = Paragraph(f"Query Report - {timestamp}", self.styles['Heading3'])
        elements.append(subtitle)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_query_section(self, query_text):
        """Create query text section"""
        elements = []
        
        # Section title
        title = Paragraph("Query:", self.styles['CustomSubtitle'])
        elements.append(title)
        
        # Query text
        query_para = Paragraph(query_text, self.styles['BodyText'])
        elements.append(query_para)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_summary_section(self, summary):
        """Create AI summary section with colored box"""
        elements = []
        
        # Section title
        title = Paragraph("AI Insights:", self.styles['CustomSubtitle'])
        elements.append(title)
        
        # Summary in a table (to create a colored box)
        summary_text = Paragraph(summary, self.styles['SummaryText'])
        summary_table = Table([[summary_text]], colWidths=[6.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e3f2fd')),
            ('BORDER', (0, 0), (-1, -1), 2, colors.HexColor('#2196f3')),
            ('PADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_chart_section(self, chart_base64):
        """Create chart image section"""
        elements = []
        
        try:
            # Section title
            title = Paragraph("Visualization:", self.styles['CustomSubtitle'])
            elements.append(title)
            
            # Decode base64 image
            if chart_base64.startswith('data:image'):
                # Remove data URL prefix
                chart_base64 = chart_base64.split(',')[1]
            
            img_data = base64.b64decode(chart_base64)
            img_buffer = io.BytesIO(img_data)
            
            # Add image
            img = Image(img_buffer, width=5*inch, height=3.5*inch)
            elements.append(img)
            elements.append(Spacer(1, 20))
            
        except Exception as e:
            # If chart fails, add a note
            elements.append(Paragraph(f"Chart unavailable: {str(e)}", self.styles['BodyText']))
            elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_data_table(self, results):
        """Create data table section (max 50 rows)"""
        elements = []
        
        # Section title
        title = Paragraph("Query Results:", self.styles['CustomSubtitle'])
        elements.append(title)
        
        # Limit to 50 rows
        limited_results = results[:50]
        total_rows = len(results)
        
        if total_rows > 50:
            note = Paragraph(
                f"Showing first 50 of {total_rows} rows",
                self.styles['Italic']
            )
            elements.append(note)
            elements.append(Spacer(1, 10))
        
        # Get column names
        columns = list(limited_results[0].keys())
        
        # Create table data
        table_data = []
        
        # Header row
        table_data.append(columns)
        
        # Data rows
        for row in limited_results:
            table_data.append([str(row.get(col, '')) for col in columns])
        
        # Calculate column widths dynamically
        available_width = 6.5 * inch
        col_width = available_width / len(columns)
        
        # Create table
        data_table = Table(table_data, colWidths=[col_width] * len(columns))
        
        # Style the table
        data_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00ff88')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(data_table)
        
        return elements

# Create singleton instance
pdf_report_service = PDFReportService()
