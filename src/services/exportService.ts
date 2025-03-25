import { JobDescription, sectionLabels } from '../types';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  WidthType,
  ShadingType,
  Header,
  Footer
} from 'docx';

/**
 * Generates a formatted job description string from the job description object
 */
export const generateFormattedJobDescription = (jobDescription: JobDescription): string => {
  const { title, seniority, employmentType, remoteOption, sections, teamSize, reportingTo, tools } = jobDescription;
  
  let jd = `${seniority} ${title}\n`;
  jd += `${employmentType} • ${remoteOption}\n\n`;
  
  // Add each section
  Object.entries(sections).forEach(([key, section]) => {
    if (section.content) {
      jd += `## ${sectionLabels[key as keyof typeof sectionLabels]}\n`;
      jd += `${section.content}\n\n`;
    }
  });
  
  // Add optional information
  if (teamSize) {
    jd += `Team Size: ${teamSize}\n`;
  }
  if (reportingTo) {
    jd += `Reports To: ${reportingTo}\n`;
  }
  if (tools) {
    jd += `Tools & Technologies: ${tools}\n`;
  }
  
  return jd.trim();
};

/**
 * Exports job description as PDF file
 */
export const exportToPDF = (jobDescription: JobDescription): void => {
  try {
    const { title, seniority, employmentType, remoteOption, sections, teamSize, reportingTo, tools } = jobDescription;
    
    // Initialize PDF document with A4 format
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set font styles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    
    // Add job title and basic info
    const jobTitle = `${seniority} ${title}`;
    doc.text(jobTitle, 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${employmentType} • ${remoteOption}`, 20, 28);
    
    // Initialize position for content
    let yPosition = 38;
    const leftMargin = 20;
    const pageWidth = doc.internal.pageSize.width - 40; // 20mm margins on each side
    
    // Add each section
    Object.entries(sections).forEach(([key, section]) => {
      if (section.content) {
        // Add some margin before each section
        yPosition += 5;
        
        // Add section heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        const sectionTitle = sectionLabels[key as keyof typeof sectionLabels];
        doc.text(sectionTitle, leftMargin, yPosition);
        yPosition += 7;
        
        // Add section content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        // Split content by lines to preserve formatting
        const contentLines = section.content.split('\n');
        contentLines.forEach(line => {
          // Check if we need a new page
          if (yPosition > 270) { // ~270mm is close to the bottom of A4
            doc.addPage();
            yPosition = 20;
          }
          
          // Handle text wrapping for long lines
          const textLines = doc.splitTextToSize(line, pageWidth);
          textLines.forEach(textLine => {
            doc.text(textLine, leftMargin, yPosition);
            yPosition += 6;
          });
        });
      }
    });
    
    // Add optional information at the bottom
    yPosition += 5;
    
    if (teamSize || reportingTo || tools) {
      // Check if we need a new page for optional info
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Additional Information', leftMargin, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      if (teamSize) {
        doc.text(`Team Size: ${teamSize}`, leftMargin, yPosition);
        yPosition += 6;
      }
      
      if (reportingTo) {
        doc.text(`Reports To: ${reportingTo}`, leftMargin, yPosition);
        yPosition += 6;
      }
      
      if (tools) {
        // For tools, handle potential text wrapping
        const toolsText = `Tools & Technologies: ${tools}`;
        const toolsLines = doc.splitTextToSize(toolsText, pageWidth);
        toolsLines.forEach(line => {
          doc.text(line, leftMargin, yPosition);
          yPosition += 6;
        });
      }
    }
    
    // Add footer with branding
    const footerText = 'Generated with HireWrite | hirewrite.app';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128); // Gray color
    
    // Position footer at bottom of each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        footerText,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Save the PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-job-description.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try again.');
  }
};

/**
 * Exports job description as DOCX file
 */
export const exportToDOCX = (jobDescription: JobDescription): void => {
  try {
    const { title, seniority, employmentType, remoteOption, sections, teamSize, reportingTo, tools } = jobDescription;
    
    // Create document
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'JobTitle',
            name: 'Job Title',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 32,
              bold: true,
              color: '2E3A59'
            },
            paragraph: {
              spacing: { after: 120 }
            }
          },
          {
            id: 'JobInfo',
            name: 'Job Info',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 24,
              color: '666666'
            },
            paragraph: {
              spacing: { after: 200 }
            }
          },
          {
            id: 'SectionHeading',
            name: 'Section Heading',
            basedOn: 'Heading2',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: '333333'
            },
            paragraph: {
              spacing: { before: 240, after: 120 }
            }
          }
        ]
      },
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  text: 'Job Description',
                  alignment: AlignmentType.RIGHT,
                  style: 'JobTitle'
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'Generated with HireWrite | hirewrite.app',
                      size: 18,
                      color: '888888'
                    })
                  ]
                })
              ]
            })
          },
          children: [
            // Job Title
            new Paragraph({
              style: 'JobTitle',
              children: [
                new TextRun({ text: `${seniority} ${title}`, bold: true })
              ]
            }),
            
            // Job Type Info
            new Paragraph({
              style: 'JobInfo',
              children: [
                new TextRun(`${employmentType} • ${remoteOption}`)
              ]
            }),
            
            // Sections
            ...Object.entries(sections).flatMap(([key, section]) => {
              if (!section.content) return [];
              
              const sectionTitle = sectionLabels[key as keyof typeof sectionLabels];
              const contentParagraphs = section.content.split('\n').map(line => {
                // For bullet points, preserve formatting
                if (line.trim().startsWith('•')) {
                  return new Paragraph({
                    children: [new TextRun(line)],
                    spacing: { before: 80, after: 80 },
                    indent: { left: 360 } // Indent bullet points
                  });
                }
                
                return new Paragraph({
                  children: [new TextRun(line)],
                  spacing: { after: 80 }
                });
              });
              
              return [
                new Paragraph({
                  style: 'SectionHeading',
                  children: [new TextRun(sectionTitle)]
                }),
                ...contentParagraphs
              ];
            }),
            
            // Additional Information
            ...(teamSize || reportingTo || tools ? [
              new Paragraph({
                style: 'SectionHeading',
                children: [new TextRun('Additional Information')]
              })
            ] : []),
            
            ...(teamSize ? [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Team Size: ', bold: true }),
                  new TextRun(teamSize)
                ],
                spacing: { after: 80 }
              })
            ] : []),
            
            ...(reportingTo ? [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Reports To: ', bold: true }),
                  new TextRun(reportingTo)
                ],
                spacing: { after: 80 }
              })
            ] : []),
            
            ...(tools ? [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tools & Technologies: ', bold: true }),
                  new TextRun(tools)
                ],
                spacing: { after: 80 }
              })
            ] : [])
          ]
        }
      ]
    });
    
    // Generate the document as a Blob
    const fileName = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-job-description.docx`;
    
    // Use Document.createBlobAsync() to generate a blob
    doc.createBlobAsync().then(blob => {
      saveAs(blob, fileName);
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    alert('There was an error generating the DOCX file. Please try again.');
  }
};