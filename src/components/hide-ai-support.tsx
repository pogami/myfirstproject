'use client';

import { useEffect } from 'react';

export function HideAISupport() {
  useEffect(() => {
    // Hide AI support widgets across all pages
    const hideAISupport = () => {
      // Hide AI support chat button
      const aiSupportButtons = document.querySelectorAll('[class*="ai-support"], [class*="AISupport"]');
      aiSupportButtons.forEach(button => {
        (button as HTMLElement).style.display = 'none';
      });

      // Hide floating chat buttons
      const chatButtons = document.querySelectorAll('button[class*="fixed"][class*="bottom-"], button[class*="fixed"][class*="right-"]');
      chatButtons.forEach(button => {
        const buttonElement = button as HTMLElement;
        if (buttonElement.innerHTML.includes('MessageCircle') || 
            buttonElement.innerHTML.includes('Bot') ||
            buttonElement.textContent?.includes('AI Support')) {
          buttonElement.style.display = 'none';
        }
      });

      // Hide AI support chat windows
      const chatWindows = document.querySelectorAll('[class*="chat"][class*="fixed"]');
      chatWindows.forEach(window => {
        const windowElement = window as HTMLElement;
        if (windowElement.innerHTML.includes('AI Support') || 
            windowElement.innerHTML.includes('CourseConnect AI')) {
          windowElement.style.display = 'none';
        }
      });
    };

    // Run immediately
    hideAISupport();

    // Run on DOM changes (for dynamic content)
    const observer = new MutationObserver(hideAISupport);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
