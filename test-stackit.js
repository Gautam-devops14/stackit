const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to home...");
  await page.goto('http://localhost:3000/');
  console.log("Home page title:", await page.title());

  console.log("Navigating to login...");
  await page.goto('http://localhost:3000/login');
  
  const testEmail = `user_${Date.now()}@test.com`;
  
  await page.fill('input[name="email"]', testEmail);
  await page.fill('input[name="password"]', 'password123');
  
  console.log("Signing up...");
  await page.click('button:has-text("Sign up")');
  
  // Wait for redirect to home
  await page.waitForURL('http://localhost:3000/');
  console.log("Signed up successfully!");

  console.log("Navigating to ask question...");
  await page.goto('http://localhost:3000/ask');
  
  await page.fill('input[name="title"]', 'How to write an E2E test with Playwright?');
  
  // The tiptap editor doesn't use a standard input, but we can type into the prose block
  await page.click('.ProseMirror');
  await page.keyboard.type('I am trying to write a playwright test for this cool Next.js app.');

  // Tag input
  await page.fill('input[placeholder*="press Enter to add"]', 'playwright');
  await page.keyboard.press('Enter');
  
  console.log("Publishing question...");
  await page.click('button:has-text("Post Your Question")');
  
  // Wait for it to show the question detail page
  await page.waitForURL(/\/questions\/.+/);
  console.log("Question posted successfully! URL:", page.url());

  // Post an answer
  console.log("Posting an answer...");
  await page.click('.ProseMirror');
  await page.keyboard.type('You can just use the playwright library directly in a node script like this one!');
  
  await page.click('button:has-text("Post Your Answer")');
  await page.waitForTimeout(2000); // give it a sec to refresh
  
  const content = await page.content();
  if (content.includes('You can just use the playwright library')) {
      console.log("Answer posted successfully!");
  } else {
      console.log("Answer failed to post or show up.");
  }

  await browser.close();
  console.log("Test finished.");
})();
