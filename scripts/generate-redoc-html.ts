import { logger, Env } from 'robo.js'
import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

Env.loadSync()

const startTime = Date.now()

start()
	.then(() => {
		logger.ready(`Finished in ${Date.now() - startTime}ms`)
		process.exit(0)
	})
	.catch((error) => {
		logger.error(error)
		process.exit(1)
	})

async function start() {
	logger.info('Generating W3Schools-branded Redoc HTML...')

	const currentDirectory = fileURLToPath(new URL('.', import.meta.url))
	const serverRoot = path.resolve(currentDirectory, '..')
	
	const openApiPath = path.join(serverRoot, 'openapi', 'w3sbot-openapi.json')
	const outputPath = path.join(serverRoot, 'redoc-static.html')

	// Read the OpenAPI spec
	const spec = JSON.parse(await readFile(openApiPath, 'utf-8'))

	// Fix description indentation to prevent code block rendering
	if (spec.info && spec.info.description) {
		spec.info.description = spec.info.description
			.split('\n')
			.map((line: string) => line.trim())
			.join('\n')
	}

	// W3Schools brand colors - Light theme matching their website
	const theme = {
		colors: {
			primary: {
				main: '#36AF57' // Medium Sea Green - W3Schools primary brand color
			},
			text: {
				primary: '#3A3A3A', // Dark text for good contrast on white
				secondary: '#555555' // Slightly lighter for secondary text
			},
			success: {
				main: '#36AF57' // Medium Sea Green
			},
			warning: {
				main: '#FFA500'
			},
			error: {
				main: '#D41F1C'
			},
			http: {
				get: '#36AF57', // Medium Sea Green for GET
				post: '#186FAF', // Blue for POST
				put: '#95507C', // Purple for PUT
				patch: '#BF581D', // Orange for PATCH
				delete: '#CC3333', // Red for DELETE
				basic: '#707070',
				link: '#36AF57', // Use green for links
				head: '#A23DAD'
			},
			responses: {
				success: {
					color: '#36AF57',
					backgroundColor: 'rgba(54, 175, 87, 0.1)'
				},
				error: {
					color: '#D41F1C',
					backgroundColor: 'rgba(212, 31, 28, 0.1)'
				}
			}
		},
		typography: {
			fontSize: '14px',
			fontFamily: 'Arial, sans-serif',
			headings: {
				fontFamily: 'Arial, sans-serif',
				fontWeight: 'bold',
				lineHeight: '1.5'
			},
			code: {
				fontSize: '13px',
				fontFamily: "'Courier New', Courier, monospace",
				lineHeight: '20px',
				fontWeight: '400',
				backgroundColor: '#F1F1F1',
				color: '#3A3A3A',
				wrap: false
			}
		},
		sidebar: {
			backgroundColor: '#FFFFFF', // White like W3Schools sidebar
			textColor: '#3A3A3A', // Dark text for contrast
			activeTextColor: '#36AF57', // Green for active items
			groupItems: {
				activeBackgroundColor: '#F1F1F1', // Light gray for hover
				activeTextColor: '#36AF57'
			}
		},
		rightPanel: {
			backgroundColor: '#FFFFFF', // White background
			textColor: '#3A3A3A'
		},
		scrollbar: {
			width: '10px'
		}
	}

	const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf8" />
  <title>W3Schools Bot API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      padding: 0;
      margin: 0;
      font-family: Arial, sans-serif;
      background: #FFFFFF;
    }
    
    /* W3Schools Brand Theme - Comprehensive Overrides */
    /* Force light theme throughout */
    #redoc,
    #redoc * {
      font-family: Arial, sans-serif !important;
    }
    
    /* Sidebar - Make it white/light gray like W3Schools */
    /* Sidebar - Make it white/light gray like W3Schools */
    #redoc > div > div:first-child,
    #redoc [class*="menu-content"],
    #redoc [class*="sidebar"] {
      background-color: #FFFFFF !important;
      border-right: 1px solid #E1E1E1 !important;
    }
    
    /* Search bar in sidebar - W3Schools style (Clean & Rounded) */
    div[role="search"] {
      display: flex !important;
      align-items: center !important;
    }
    div[role="search"] input {
      background-color: #FFFFFF !important;
      border: 1px solid #CCCCCC !important;
      border-radius: 25px !important;
      padding: 8px 16px 8px 48px !important; /* Increased left padding */
      color: #000000 !important;
      width: 100% !important;
    }
    div[role="search"] svg {
      fill: #3A3A3A !important;
      position: absolute !important;
      left: 15px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
    }
    
    /* Sidebar menu items - dark text on light background */
    #redoc [class*="menu"] label,
    #redoc [class*="menu"] span,
    #redoc [class*="kFbpCO"] {
      color: #3A3A3A !important;
      background-color: transparent !important;
    }
    
    /* Active/hover menu items - W3Schools green */
    #redoc [class*="menu"] label:hover,
    #redoc [class*="menu"] label[class*="active"],
    #redoc [class*="kFbpCO"]:hover {
      color: #36AF57 !important;
      background-color: #F1F1F1 !important;
    }
    
    /* Main content area - white background */
    #redoc > div > div:last-child,
    #redoc [class*="api-content"],
    #redoc [class*="cKLOic"] {
      background-color: #FFFFFF !important;
    }
    
    /* Headings - dark gray, bold */
    #redoc h1,
    #redoc h2,
    #redoc h3,
    #redoc h4,
    #redoc h5,
    #redoc [class*="etEcMu"],
    #redoc [class*="eSjOhJ"] {
      color: #3A3A3A !important;
      font-family: Arial, sans-serif !important;
      font-weight: bold !important;
    }
    
    /* Body text - dark gray for good contrast */
    #redoc p,
    #redoc div,
    #redoc span:not([class*="operation"]):not([class*="http"]) {
      color: #3A3A3A !important;
    }
    
    /* Links - W3Schools green */
    #redoc a {
      color: #36AF57 !important;
      text-decoration: none !important;
    }
    #redoc a:hover {
      color: #2d8f47 !important;
      text-decoration: underline !important;
    }
    
    /* HTTP Method Badges - proper colors with white text for contrast */
    #redoc [class*="operation-type"],
    #redoc [class*="http-verb"],
    #redoc [class*="hFkwOU"] {
      color: #FFFFFF !important;
      font-weight: bold !important;
      text-transform: uppercase !important;
    }
    #redoc [class*="operation-type"].get,
    #redoc [class*="http-verb"].get,
    #redoc [class*="hFkwOU"].get {
      background-color: #36AF57 !important;
    }
    #redoc [class*="operation-type"].post,
    #redoc [class*="http-verb"].post,
    #redoc [class*="hFkwOU"].post {
      background-color: #186FAF !important;
    }
    #redoc [class*="operation-type"].put,
    #redoc [class*="http-verb"].put,
    #redoc [class*="hFkwOU"].put {
      background-color: #95507C !important;
    }
    #redoc [class*="operation-type"].patch,
    #redoc [class*="http-verb"].patch,
    #redoc [class*="hFkwOU"].patch {
      background-color: #BF581D !important;
    }
    #redoc [class*="operation-type"].delete,
    #redoc [class*="http-verb"].delete,
    #redoc [class*="hFkwOU"].delete {
      background-color: #CC3333 !important;
    }
    
    /* Response status buttons */
    #redoc button[class*="success"],
    #redoc button[class*="eA-Dmfi"] {
      color: #36AF57 !important;
      background-color: rgba(54, 175, 87, 0.1) !important;
      border: 1px solid rgba(54, 175, 87, 0.3) !important;
    }
    #redoc button[class*="error"],
    #redoc button[class*="fSHIeE"] {
      color: #D41F1C !important;
      background-color: rgba(212, 31, 28, 0.1) !important;
      border: 1px solid rgba(212, 31, 28, 0.3) !important;
    }
    
    /* Code blocks - light gray background like W3Schools */
    #redoc code,
    #redoc pre,
    #redoc [class*="code"],
    #redoc [class*="react-tabs__tab-panel"] {
      background-color: #F1F1F1 !important;
      color: #3A3A3A !important;
      font-family: 'Courier New', Courier, monospace !important;
      border: 1px solid #CCCCCC !important;
    }
    #redoc pre {
      padding: 10px !important;
      border-radius: 4px !important;
    }
    
    /* Syntax Highlighting - Balanced Contrast */
    .token.punctuation {
      color: #555555 !important; /* Dark gray brackets */
      font-weight: normal !important;
    }
    .token.property {
      color: #D41F1C !important; /* Red keys */
    }
    .token.string {
      color: #36AF57 !important; /* Green strings */
    }
    .token.number, .token.boolean {
      color: #186FAF !important; /* Blue numbers/bools */
    }
    .token.operator {
      color: #3A3A3A !important;
    }
    
    /* Content Type Label & Dropdown - Fix Dark Box */
    #redoc [class*="dropdown"],
    #redoc [class*="dropdown"] button,
    #redoc [class*="dropdown"] div {
      color: #3A3A3A !important;
      background-color: #FFFFFF !important;
      border: 1px solid #CCCCCC !important;
    }
    
    /* Scrollbar - Light theme */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #F1F1F1; 
    }
    ::-webkit-scrollbar-thumb {
      background: #CCCCCC; 
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #999999; 
    }
    
    /* Top Description - Aggressively remove box styling */
    .api-info {
      font-family: Arial, sans-serif !important;
    }
    .api-info > div,
    .api-info pre,
    .api-info code {
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      color: #3A3A3A !important;
      box-shadow: none !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.6 !important;
    }
    
    /* Payload/Response Tabs - High Contrast */
    ul[class*="react-tabs__tab-list"] li,
    [class*="react-tabs__tab"],
    button[role="tab"] {
      color: #3A3A3A !important;
      background-color: #F1F1F1 !important;
      border: 1px solid #CCCCCC !important;
      border-bottom: none !important;
      padding: 6px 12px !important;
      margin-right: 4px !important;
      border-radius: 4px 4px 0 0 !important;
    }
    
    ul[class*="react-tabs__tab-list"] li[class*="selected"],
    [class*="react-tabs__tab--selected"],
    button[role="tab"][aria-selected="true"] {
      color: #FFFFFF !important;
      background-color: #36AF57 !important;
      font-weight: bold !important;
      border-color: #36AF57 !important;
    }
    
    /* Specific fix for the "Payload" label if it's just a label */
    div[class*="MediaType"] > div > span {
      color: #FFFFFF !important;
      background-color: #36AF57 !important;
      padding: 4px 12px !important;
      border-radius: 12px !important;
      font-size: 12px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
    }
    
    /* Remove dark backgrounds from right panel tabs/selectors */
    div[class*="react-tabs__tab-list"],
    div[class*="sc-"] {
        background-color: transparent !important;
    }
    
    /* Fix specific dark boxes (Language selector, etc) */
    div[style*="background-color: #263238"],
    div[style*="background-color: rgb(38, 50, 56)"],
    div[style*="background-color: #323232"],
    div[style*="background-color: rgb(50, 50, 50)"] {
      background-color: #F1F1F1 !important;
      color: #3A3A3A !important;
      border-bottom: 1px solid #CCCCCC !important;
    }
    
    /* Tables - clean borders */
    #redoc table,
    #redoc table td,
    #redoc table th {
      border: 1px solid #CCCCCC !important;
    }
    #redoc table th {
      background-color: #F1F1F1 !important;
      color: #3A3A3A !important;
    }
    
    /* Remove dark backgrounds */
    #redoc [style*="background-color: #263238"],
    #redoc [style*="background-color:rgb(38, 50, 56)"],
    #redoc [class*="iQEJnI"] {
      background-color: #FFFFFF !important;
    }
    
    /* Right panel - white background */
    #redoc [class*="rightPanel"],
    #redoc [class*="icuOYb"] {
      background-color: #FFFFFF !important;
    }
    
    /* Footer */
    #redoc [class*="jZkbxm"] {
      background-color: #F1F1F1 !important;
      border-top: 1px solid #CCCCCC !important;
    }
    #redoc [class*="jZkbxm"] a {
      color: #3A3A3A !important;
    }
    
    /* Download button - W3Schools green */
    #redoc button,
    #redoc [class*="button"] {
      border: 1px solid #36AF57 !important;
    }
    #redoc button:hover,
    #redoc [class*="button"]:hover {
      background-color: #36AF57 !important;
      color: #FFFFFF !important;
    }
  </style>
  <script src="https://cdn.redocly.com/redoc/v2.5.1/bundles/redoc.standalone.js"></script>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
</head>
<body>
  <div id="redoc"></div>
  <script>
    const spec = ${JSON.stringify(spec, null, 2)};
    const theme = ${JSON.stringify(theme, null, 2)};
    const options = {
      theme: theme,
      scrollYOffset: 0,
      hideDownloadButton: false,
      disableSearch: false,
      nativeScrollbars: false
    };
    
    Redoc.init(spec, options, document.getElementById('redoc'));
    
    // Apply W3Schools branding after Redoc fully renders
    // Use a debounced approach to avoid performance issues
    let stylingApplied = false;
    let timeoutId = null;
    
    function applyW3SchoolsBranding() {
      const redocEl = document.getElementById('redoc');
      if (!redocEl || redocEl.children.length === 0) return;
      
      // Check if Redoc has finished rendering by looking for content
      const hasContent = redocEl.querySelector('h1, h2, [class*="api-info"]');
      if (!hasContent) return;

      
      // Style HTTP method badges - only target operation-type spans
      redocEl.querySelectorAll('span[class*="operation-type"], span[class*="http-verb"]').forEach(span => {
        const text = span.textContent?.toLowerCase().trim();
        const classes = span.className || '';
        
        if (text === 'get' || classes.includes('get')) {
          span.style.cssText = 'background-color: #36AF57 !important; color: #FFFFFF !important;';
        } else if (text === 'post' || classes.includes('post')) {
          span.style.cssText = 'background-color: #186FAF !important; color: #FFFFFF !important;';
        } else if (text === 'put' || classes.includes('put')) {
          span.style.cssText = 'background-color: #95507C !important; color: #FFFFFF !important;';
        } else if (text === 'patch' || classes.includes('patch')) {
          span.style.cssText = 'background-color: #BF581D !important; color: #FFFFFF !important;';
        } else if (text === 'delete' || classes.includes('delete')) {
          span.style.cssText = 'background-color: #CC3333 !important; color: #FFFFFF !important;';
        }
      });
      
      // Style links - only apply if not already styled
      redocEl.querySelectorAll('a:not([style*="color: rgb(54, 175, 87)"])').forEach(link => {
        link.style.color = '#36AF57';
      });
    }
    
    // Debounced observer - only fire after mutations stop
    const observer = new MutationObserver(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        applyW3SchoolsBranding();
      }, 300);
    });
    
    // Only observe childList to reduce overhead
    observer.observe(document.getElementById('redoc'), {
      childList: true,
      subtree: false
    });
    
    // Apply after Redoc has time to render
    setTimeout(() => {
      applyW3SchoolsBranding();
      // Keep observer active for dynamic changes
    }, 1500);
  </script>
</body>
</html>`

	await writeFile(outputPath, html, 'utf-8')

	const relativeOutput = path.relative(serverRoot, outputPath)
	logger.info(`Redoc HTML with W3Schools branding written to ${relativeOutput}`)
}

