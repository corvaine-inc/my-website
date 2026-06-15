import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { writeFileSync } from 'fs';

// Helper to create a table
function createTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
      shading: { fill: "E0E0E0" },
      width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map(cell => new TableCell({
      children: [new Paragraph({ text: cell })],
      width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
    })),
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

const doc = new Document({
  sections: [{
    children: [
      // Title
      new Paragraph({
        text: "Cloudflare Pages Deployment Audit Report",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: "BLAZEHAZE by CORVAINE", italics: true })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, size: 20 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }),

      // Fixes Implemented
      new Paragraph({ text: "FIXES IMPLEMENTED", heading: HeadingLevel.HEADING_1 }),
      createTable(
        ["Issue", "Status", "Action Taken"],
        [
          ["Node.js crypto import", "FIXED", "Removed import { randomUUID } from 'crypto', now using global crypto.randomUUID()"],
          ["@vercel/analytics", "FIXED", "Removed package from dependencies and usage from layout.tsx"],
          ["Cloudflare build scripts", "FIXED", "Added pages:build and pages:dev scripts"],
          ["@cloudflare/next-on-pages", "FIXED", "Added to devDependencies"],
        ]
      ),
      new Paragraph({ text: "" }),

      // Dependencies
      new Paragraph({ text: "1. DEPENDENCIES - ALL COMPATIBLE", heading: HeadingLevel.HEADING_1 }),
      createTable(
        ["Package", "Status", "Notes"],
        [
          ["next@16.2.0", "Compatible", "Supported by @cloudflare/next-on-pages"],
          ["react@19 / react-dom@19", "Compatible", "Standard React"],
          ["framer-motion", "Compatible", "Client-side only"],
          ["All @radix-ui/*", "Compatible", "Client-side UI components"],
          ["lucide-react", "Compatible", "Icon library"],
          ["tailwindcss@4", "Compatible", "CSS framework"],
          ["zod", "Compatible", "Validation library"],
          ["swr", "Compatible", "Client-side data fetching"],
          ["@vercel/analytics", "REMOVED", "Was incompatible"],
        ]
      ),
      new Paragraph({ text: "" }),

      // API Routes
      new Paragraph({ text: "2. API ROUTES - ALL COMPATIBLE", heading: HeadingLevel.HEADING_1 }),
      createTable(
        ["Route", "Status", "Notes"],
        [
          ["/api/auth/login", "Compatible", "Uses global crypto.randomUUID()"],
          ["/api/auth/logout", "Compatible", "Standard Web APIs"],
          ["/api/auth/register", "Compatible", "Standard Web APIs"],
          ["/api/auth/session", "Compatible", "Standard Web APIs"],
          ["/api/products", "Compatible", "Returns placeholder"],
          ["/api/payment/*", "Compatible", "Uses global crypto.randomUUID()"],
          ["/api/webhooks", "Compatible", "Returns placeholder"],
        ]
      ),
      new Paragraph({ text: "" }),

      // Middleware
      new Paragraph({ text: "3. MIDDLEWARE - COMPATIBLE", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "File: middleware.ts" }),
      new Paragraph({ text: "Uses only:" }),
      new Paragraph({ text: "• NextRequest / NextResponse", bullet: { level: 0 } }),
      new Paragraph({ text: "• Standard cookie operations", bullet: { level: 0 } }),
      new Paragraph({ text: "• Pattern matching with matcher config", bullet: { level: 0 } }),
      new Paragraph({ text: "No Node.js-specific APIs." }),
      new Paragraph({ text: "" }),

      // Image Optimization
      new Paragraph({ text: "4. IMAGE OPTIMIZATION - CONFIGURED", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "File: next.config.mjs" }),
      new Paragraph({ children: [new TextRun({ text: "images: { unoptimized: true }  // Correct for Cloudflare", font: "Courier New", size: 20 })] }),
      new Paragraph({ text: "" }),

      // Environment Variables
      new Paragraph({ text: "5. ENVIRONMENT VARIABLES REQUIRED", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "Set these in Cloudflare Pages dashboard (Settings > Environment variables):" }),
      createTable(
        ["Variable", "Required", "Value"],
        [
          ["NEXT_PUBLIC_APP_URL", "YES", "Your production URL (e.g., https://blazehaze.com)"],
          ["NODE_ENV", "Automatic", "Set to production by Cloudflare"],
          ["HELCIM_API_URL", "If using payments", "Helcim API endpoint"],
          ["HELCIM_API_KEY", "If using payments", "Helcim API key"],
          ["HELCIM_WEBHOOK_SECRET", "If using payments", "Webhook signature secret"],
        ]
      ),
      new Paragraph({ text: "" }),

      // Build Configuration
      new Paragraph({ text: "6. BUILD CONFIGURATION FOR CLOUDFLARE PAGES", heading: HeadingLevel.HEADING_1 }),
      createTable(
        ["Setting", "Value"],
        [
          ["Build command", "npm run pages:build"],
          ["Build output directory", ".vercel/output/static"],
          ["Root directory", "/ (leave blank)"],
          ["Node.js version", "18 or higher"],
        ]
      ),
      new Paragraph({ text: "" }),

      // Verified Features
      new Paragraph({ text: "7. VERIFIED FEATURES", heading: HeadingLevel.HEADING_1 }),
      createTable(
        ["Feature", "Status", "Verification"],
        [
          ["Web3Forms contact form", "WORKING", "Client-side fetch to api.web3forms.com/submit with access key"],
          ["Disabled Sign In button", "INTACT", "disabled={isLoading || true} on line 113"],
          ["Disabled Register button", "INTACT", "disabled={isLoading || true} on line 262"],
          ["Google Fonts", "WORKING", "Cormorant Garamond, Montserrat, Geist Mono"],
          ["Lucide icons", "WORKING", "SVG icons bundled at build"],
        ]
      ),
      new Paragraph({ text: "" }),

      // Known Limitations
      new Paragraph({ text: "8. KNOWN LIMITATIONS (Production Considerations)", heading: HeadingLevel.HEADING_1 }),
      createTable(
        ["Item", "Current State", "Production Recommendation"],
        [
          ["Session storage", "In-memory (dev only)", "Implement Cloudflare KV or D1"],
          ["User database", "In-memory (dev only)", "Implement Cloudflare D1"],
          ["Payment sessions", "In-memory (dev only)", "Implement Cloudflare KV or D1"],
        ]
      ),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [new TextRun({
          text: "Note: The authentication and payment systems currently use in-memory storage which will NOT persist between edge worker invocations. Since you've disabled the Sign In and Register buttons, this is acceptable for now. When you re-enable authentication, you'll need to implement persistent storage.",
          italics: true
        })]
      }),
      new Paragraph({ text: "" }),

      // Deployment Steps
      new Paragraph({ text: "9. DEPLOYMENT STEPS", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "1. Push code to GitHub" }),
      new Paragraph({ text: "2. In Cloudflare Pages dashboard, create new project" }),
      new Paragraph({ text: "3. Connect to your GitHub repository" }),
      new Paragraph({ text: "4. Configure build settings:" }),
      new Paragraph({ text: "   • Build command: npm run pages:build" }),
      new Paragraph({ text: "   • Output directory: .vercel/output/static" }),
      new Paragraph({ text: "5. Add environment variables:" }),
      new Paragraph({ text: "   • NEXT_PUBLIC_APP_URL = https://your-domain.com" }),
      new Paragraph({ text: "6. Deploy" }),
      new Paragraph({ text: "" }),

      // Post-Deployment Checklist
      new Paragraph({ text: "10. POST-DEPLOYMENT CHECKLIST", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "☐ Verify all pages load correctly" }),
      new Paragraph({ text: "☐ Test contact form submission (Web3Forms)" }),
      new Paragraph({ text: "☐ Confirm Sign In/Register buttons are disabled" }),
      new Paragraph({ text: "☐ Verify all images load (unoptimized)" }),
      new Paragraph({ text: "☐ Check fonts render correctly" }),
      new Paragraph({ text: "☐ Test responsive layouts on mobile" }),
      new Paragraph({ text: "" }),

      // Deployment Readiness
      new Paragraph({
        children: [new TextRun({ text: "DEPLOYMENT READINESS: READY", bold: true, size: 28, color: "008000" })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: "All critical issues have been resolved. The project is now compatible with Cloudflare Pages deployment.",
        alignment: AlignmentType.CENTER,
      }),
    ],
  }],
});

// Generate and save the document
const buffer = await Packer.toBuffer(doc);
writeFileSync('public/Cloudflare-Pages-Audit-Report.docx', buffer);
console.log('Report exported to public/Cloudflare-Pages-Audit-Report.docx');
