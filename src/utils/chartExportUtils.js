/**
 * Utility functions to export charts as images
 */
import * as echarts from 'echarts';

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
 * Convert ECharts instance to image data URL
 * @param {HTMLElement} echartsContainer - Container element containing ECharts
 * @returns {Promise<string>} Data URL of the image
 */
export const echartsToImage = async (echartsContainer) => {
  try {
    // Find the ECharts instance
    const echartsInstance = echarts.getInstanceByDom(echartsContainer);
    
    if (!echartsInstance) {
      throw new Error('ECharts instance not found');
    }
    
    // Get chart as data URL (PNG format, high quality)
    const dataURL = echartsInstance.getDataURL({
      type: 'png',
      pixelRatio: 2, // Higher quality
      backgroundColor: '#ffffff'
    });
    
    return dataURL;
  } catch (error) {
    console.error('Error converting ECharts to image:', error);
    // Fallback to html2canvas
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(echartsContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      return canvas.toDataURL('image/png', 1.0);
    } catch (canvasError) {
      throw new Error('Failed to convert ECharts to image: ' + canvasError.message);
    }
  }
};

/**
 * Find and convert all ECharts in a container to images
 * @param {HTMLElement} container - Container element
 * @returns {Promise<Array<{element: HTMLElement, imageData: string, title: string}>>}
 */
export const convertEChartsToImages = async (container) => {
  const charts = [];
  
  // Find all ECharts containers - ReactECharts creates divs with canvas or svg inside
  // Look for divs that contain canvas or svg elements (ECharts renders)
  const possibleContainers = container.querySelectorAll('div[style*="height"], div[class*="echarts"], canvas, svg');
  
  for (const element of possibleContainers) {
    try {
      // Find the actual container (parent div that contains the chart)
      let echartsContainer = element;
      if (element.tagName === 'CANVAS' || element.tagName === 'SVG') {
        echartsContainer = element.parentElement;
      }
      
      // Skip if we've already processed this container
      if (echartsContainer.dataset.processed) {
        continue;
      }
      echartsContainer.dataset.processed = 'true';
      
      // Try to get ECharts instance
      const echartsInstance = echarts.getInstanceByDom(echartsContainer);
      
      // If no instance found, try finding canvas/svg inside
      if (!echartsInstance) {
        const canvas = echartsContainer.querySelector('canvas');
        const svg = echartsContainer.querySelector('svg');
        if (canvas) {
          const instance = echarts.getInstanceByDom(canvas.parentElement);
          if (instance) {
            // Find the parent card/container for title
            const card = echartsContainer.closest('[class*="Card"], .card');
            const titleElement = card?.querySelector('[class*="CardTitle"], h3, h4, .chart-title');
            const title = titleElement?.textContent || card?.querySelector('h3, h4')?.textContent || 'Biểu đồ';
            
            try {
              const imageData = instance.getDataURL({
                type: 'png',
                pixelRatio: 2,
                backgroundColor: '#ffffff'
              });
              charts.push({
                element: canvas.parentElement,
                imageData,
                title,
                type: 'echarts'
              });
              continue;
            } catch (error) {
              console.warn('ECharts getDataURL failed:', error);
            }
          }
        }
      } else {
        // Found instance, get title and convert
        const card = echartsContainer.closest('[class*="Card"], .card');
        const titleElement = card?.querySelector('[class*="CardTitle"], h3, h4, .chart-title');
        const title = titleElement?.textContent || card?.querySelector('h3, h4')?.textContent || 'Biểu đồ';
        
        try {
          const imageData = echartsInstance.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          charts.push({
            element: echartsContainer,
            imageData,
            title,
            type: 'echarts'
          });
          continue;
        } catch (error) {
          console.warn('ECharts getDataURL failed:', error);
        }
      }
      
      // Fallback to html2canvas
      const card = echartsContainer.closest('[class*="Card"], .card');
      const titleElement = card?.querySelector('[class*="CardTitle"], h3, h4, .chart-title');
      const title = titleElement?.textContent || card?.querySelector('h3, h4')?.textContent || 'Biểu đồ';
      
      try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(echartsContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        const imageData = canvas.toDataURL('image/png', 1.0);
        charts.push({
          element: echartsContainer,
          imageData,
          title,
          type: 'canvas'
        });
      } catch (canvasError) {
        console.error('Canvas conversion failed:', canvasError);
      }
    } catch (error) {
      console.error('Error converting ECharts:', error);
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

