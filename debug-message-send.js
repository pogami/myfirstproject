// Debug script to test message sending
console.log('Testing message sending...');

// Check if we can access the form
const sendButton = document.querySelector('button[type="button"]');
const inputField = document.querySelector('input[type="text"]');

console.log('Send button:', sendButton);
console.log('Input field:', inputField);

if (inputField) {
  inputField.value = 'test message';
  console.log('Set input value to test message');
  
  if (sendButton) {
    console.log('Clicking send button...');
    sendButton.click();
  }
}

// Check for any errors after 2 seconds
setTimeout(() => {
  const errorMessages = document.querySelectorAll('[class*="error"], [class*="Error"]');
  console.log('Error elements found:', errorMessages.length);
  
  const chatMessages = document.querySelectorAll('[class*="message"]');
  console.log('Message elements found:', chatMessages.length);
  
  // Check console for any caught errors
  console.log('Check browser console for any errors');
}, 2000);
