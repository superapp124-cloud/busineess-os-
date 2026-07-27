import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log("Navigating to http://localhost:8086/#/ai-browser-home");
  // Don't wait for networkidle because Server-Sent Events keep the network open forever!
  await page.goto('http://localhost:8086/#/ai-browser-home', { waitUntil: 'load' });
  
  // Wait a bit for animations
  await page.waitForTimeout(3000);
  
  const outputPath = "C:/Users/Arshid.Wani/.gemini/antigravity/brain/050e43e3-2138-4790-a113-c4bec0495cb1/screenshot.png";
  await page.screenshot({ path: outputPath });
  console.log("Screenshot saved to " + outputPath);
  
  await browser.close();
})();
