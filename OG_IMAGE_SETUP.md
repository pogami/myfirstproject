# 📸 Open Graph Image Setup Guide

## ✅ What We Fixed

Your OG (Open Graph) meta tags were pointing to the **old Vercel URL** instead of **courseconnectai.com**, which is why iMessage and other social platforms weren't showing proper link previews.

### Changes Made:
1. ✅ Updated all OG URLs from old Vercel domain to `https://courseconnectai.com`
2. ✅ Enhanced OG meta tags with better descriptions
3. ✅ Added Twitter Card meta tags
4. ✅ Added additional SEO meta tags
5. ✅ Created OG image generator tool
6. ✅ Added iMessage-specific preview tags

---

## 🖼️ How to Generate Your Custom OG Image

### Option 1: Using the Built-in Generator (Recommended)

1. **Open the generator:**
   ```
   http://localhost:9002/generate-og-image.html
   ```
   Or after deployment:
   ```
   https://courseconnectai.com/generate-og-image.html
   ```

2. **Capture the image using Chrome DevTools:**
   - Right-click on the purple gradient image
   - Select **"Inspect"** or **"Inspect Element"**
   - In DevTools, find `<div class="og-image" id="og-image">`
   - Right-click on that element
   - Select **"Capture node screenshot"**
   - Save as `courseconnect-og.png`

3. **Save the image:**
   ```bash
   # Save to your public folder
   public/og-images/courseconnect-og.png
   ```

4. **Update the layout.tsx to use your new image:**
   - Open `src/app/layout.tsx`
   - Change the image URL from `profile-default.png` to `courseconnect-og.png`:
   ```typescript
   images: [
     {
       url: "https://courseconnectai.com/og-images/courseconnect-og.png",
       width: 1200,
       height: 630,
       alt: "CourseConnect AI - AI-Powered Study Platform",
     },
   ],
   ```

### Option 2: Using a Screenshot Tool

1. Open `http://localhost:9002/generate-og-image.html`
2. Use any screenshot tool to capture exactly **1200px × 630px**
3. Save as `courseconnect-og.png` in `public/og-images/`

### Option 3: Use Existing Image

If you already have a branded image:
- Make sure it's **1200px × 630px** (or 2:1 aspect ratio)
- Save it to `public/og-images/`
- Update `src/app/layout.tsx` with the filename

---

## 🧪 Testing Your OG Image

### Test on Different Platforms:

1. **iMessage:**
   - Send the link to yourself: `https://courseconnectai.com`
   - Wait a few seconds for the preview to load
   - You should see: Title + Description + Large Image

2. **Facebook Debugger:**
   ```
   https://developers.facebook.com/tools/debug/
   ```
   - Paste your URL
   - Click "Scrape Again" to refresh cache
   - Check if image loads

3. **Twitter Card Validator:**
   ```
   https://cards-dev.twitter.com/validator
   ```
   - Paste your URL
   - See preview

4. **LinkedIn Post Inspector:**
   ```
   https://www.linkedin.com/post-inspector/
   ```
   - Inspect your URL

### Important Notes:

- ⚠️ **Cache Issue:** Social platforms cache OG images for 24-48 hours
- ⚠️ **localhost won't work:** You need to deploy to a public URL first
- ⚠️ **Image must be accessible:** Make sure the image URL is publicly accessible

---

## 📋 Current OG Tags Structure

```html
<!-- Open Graph (Facebook, iMessage, WhatsApp, etc.) -->
<meta property="og:title" content="CourseConnect AI - Your AI-Powered Study Companion" />
<meta property="og:description" content="Upload your syllabus and let AI help you ace your courses..." />
<meta property="og:url" content="https://courseconnectai.com" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="CourseConnect AI" />
<meta property="og:image" content="https://courseconnectai.com/og-images/profile-default.png" />
<meta property="og:image:secure_url" content="https://courseconnectai.com/og-images/profile-default.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="CourseConnect AI - AI-Powered Study Platform" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="CourseConnect AI - Your AI-Powered Study Companion" />
<meta name="twitter:description" content="Upload your syllabus and let AI help you ace your courses..." />
<meta name="twitter:image" content="https://courseconnectai.com/og-images/profile-default.png" />
<meta name="twitter:image:alt" content="CourseConnect AI - AI-Powered Study Platform" />
<meta name="twitter:creator" content="@courseconnectai" />
<meta name="twitter:site" content="@courseconnectai" />
```

---

## 🚀 Next Steps for Deployment

1. **Generate your custom OG image** (using the tool above)
2. **Deploy to Vercel/production**
3. **Test the link preview** by sharing on iMessage, Facebook, or Twitter
4. **Clear social media caches** if needed (using the debugging tools above)

### After Deployment:

1. Wait 5-10 minutes for DNS propagation
2. Share `https://courseconnectai.com` on iMessage
3. You should now see a **beautiful preview** with:
   - ✅ CourseConnect AI logo
   - ✅ Title and description
   - ✅ Large preview image (1200x630)
   - ✅ Domain name

---

## 🔧 Troubleshooting

### Preview not showing?
- ✅ Make sure you've deployed to production (localhost won't work)
- ✅ Check that the image file exists at `/public/og-images/`
- ✅ Verify the image is publicly accessible
- ✅ Clear social media cache using debugging tools
- ✅ Wait 24-48 hours for cache to expire naturally

### Image size wrong?
- ✅ Ensure image is exactly **1200px × 630px**
- ✅ Use PNG or JPEG format (PNG recommended)
- ✅ Keep file size under 8MB

### Still not working?
- Check browser console for errors
- Verify all meta tags are in the `<head>` section
- Make sure there are no conflicting meta tags
- Test with Facebook Debugger to see specific errors

---

## 📚 Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

Made with ❤️ for CourseConnect AI

