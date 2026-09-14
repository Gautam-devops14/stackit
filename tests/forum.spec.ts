import { test, expect } from '@playwright/test';

test.describe('StackIt Core Q&A Flow', () => {
  test('User can complete the full Q&A lifecycle', async ({ page }) => {
    // 1. Mock Signup / Authentication
    // In a real app we would hit Supabase Auth, but for E2E we verify the UI loads and is accessible.
    await page.goto('/');
    await expect(page).toHaveTitle(/StackIt/);
    
    // 2. Post a Question
    // Assuming the "Ask Question" button is on the homepage
    await page.click('text=Ask Question');
    
    // Fill out the question form
    await page.fill('input#title', 'How to test Next.js with Playwright?');
    // Using TipTap editor (targets the contenteditable area)
    await page.locator('.ProseMirror').fill('I need help setting up E2E tests for my Next.js App Router project.');
    
    // Add a tag
    await page.fill('input#tags', 'testing');
    await page.press('input#tags', 'Enter');
    
    // Submit the question
    await page.click('text=Post Question');
    
    // 3. Answer a Question
    // In our mocked UI, we navigate directly to the mock detail page (e.g., /q/1)
    await page.goto('/q/1');
    
    // Verify question content exists
    await expect(page.locator('h1')).toContainText('Supabase'); // Using our mocked data title for the test
    
    // Submit an answer
    // Wait for the TipTap editor for the answer to load
    await page.locator('.ProseMirror').fill('You should use the @playwright/test package and configure the webServer block.');
    await page.click('text=Post Answer');
    
    // 4. Upvote the Answer
    // Click the first upvote chevron button in the answers list
    // Our mock data has two answers, we upvote the first one
    const firstAnswerUpvoteBtn = page.locator('button:has(.lucide-chevron-up)').nth(1); // 0 is question, 1 is first answer
    await firstAnswerUpvoteBtn.click();
    
    // 5. Accept the Answer
    // Click the checkmark button
    const acceptBtn = page.locator('button[title="Mark as accepted"], button[title="Accepted Answer"]').first();
    await acceptBtn.click();
    
    // Verify the answer is marked as accepted (green text)
    await expect(acceptBtn).toHaveClass(/text-green-600/);
  });
});
