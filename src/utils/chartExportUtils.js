/**
 * Utility functions to export charts as images
 */

/**
 * Convert SVG element to image data URL
 * @param {SVGElement} svgElement - SVG element to convert
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {Promise<string>} Data URL of the image
 */
export const svgToImage = (svgElement, width = 800, height = 400) => {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true);
      
      // Set explicit dimensions
      clonedSvg.setAttribute('width', width);
      clonedSvg.setAttribute('height', height);
      
      // Get SVG as string
      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Create image from SVG
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw SVG
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      
      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Convert Recharts container to image using html2canvas
 * @param {HTMLElement} chartContainer - Container element containing the chart
 * @returns {Promise<string>} Data URL of the image
 */
export const chartContainerToImage = async (chartContainer) => {
  try {
    // Dynamic import html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(chartContainer, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: chartContainer.offsetWidth || 800,
      height: chartContainer.offsetHeight || 400,
    });
    
    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error converting chart to image:', error);
    throw error;
  }
};

/**
 * Find and convert all charts in a container to images
 * @param {HTMLElement} container - Container element
 * @returns {Promise<Array<{element: HTMLElement, imageData: string, title: string}>>}
 */
export const convertChartsToImages = async (container) => {
  const charts = [];
  
  // Find all ResponsiveContainer elements (Recharts wrapper)
  const responsiveContainers = container.querySelectorAll('.recharts-responsive-container');
  
  for (const responsiveContainer of responsiveContainers) {
    try {
      // Find the parent card/container for title
      const card = responsiveContainer.closest('[class*="Card"], .card');
      const titleElement = card?.querySelector('[class*="CardTitle"], h3, h4, .chart-title');
      const title = titleElement?.textContent || 'Biểu đồ';
      
      // Try SVG first (better quality for Recharts)
      const svg = responsiveContainer.querySelector('svg');
      if (svg && svg.outerHTML) {
        try {
          const imageData = await svgToImage(svg, 800, 400);
          charts.push({
            element: responsiveContainer,
            imageData,
            title,
            type: 'svg'
          });
          continue;
        } catch (svgError) {
          console.warn('SVG conversion failed, trying html2canvas:', svgError);
        }
      }
      
      // Fallback to html2canvas
      try {
        const imageData = await chartContainerToImage(responsiveContainer);
        charts.push({
          element: responsiveContainer,
          imageData,
          title,
          type: 'canvas'
        });
      } catch (canvasError) {
        console.error('Both SVG and canvas conversion failed:', canvasError);
      }
    } catch (error) {
      console.error('Error converting chart:', error);
      // Continue with other charts
    }
  }
  
  return charts;
};

/**
 * Replace chart elements with images in HTML
 * @param {HTMLElement} container - Container element
 * @param {Array} chartImages - Array of chart image data
 */
export const replaceChartsWithImages = (container, chartImages) => {
  chartImages.forEach(({ element, imageData, title }) => {
    const card = element.closest('[class*="Card"], .card');
    const cardContent = card?.querySelector('[class*="CardContent"], .card-content') || element.parentElement;
    
    if (cardContent) {
      cardContent.innerHTML = `
        <div style="text-align: center; margin: 20px 0;">
          <h3 style="font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 15px;">${title}</h3>
          <img src="${imageData}" alt="${title}" style="max-width: 100%; height: auto; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
          <p style="font-size: 12px; color: #6b7280; font-style: italic; margin-top: 10px;">
            Biểu đồ được xuất từ hệ thống thống kê
          </p>
        </div>
      `;
    }
  });
};

