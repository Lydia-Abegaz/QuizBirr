# GIF Background Setup Guide

## ✅ What's Been Configured

I've added a GIF background system to your app with the following features:

- **Fixed background layer** that stays in place while content scrolls
- **Opacity control** (currently set to 30% for subtle effect)
- **Dark overlay** to ensure text remains readable
- **Blur effect** for better content visibility
- **Responsive design** that works on all screen sizes

## 📁 How to Add Your GIF

1. **Get your GIF file** - Choose or create an animated GIF you want as background

2. **Name it `background.gif`** - The file must be named exactly `background.gif`

3. **Place it in the public folder**:
   ```
   frontend/public/background.gif
   ```

4. **That's it!** The background will automatically appear when you run the app

## 🎨 Customization Options

You can customize the background effect by editing `frontend/src/index.css`:

### Change GIF Opacity
```css
.gif-background::before {
  opacity: 0.3; /* Change this value (0.0 to 1.0) */
}
```
- `0.1` = Very subtle
- `0.3` = Moderate (current setting)
- `0.5` = Strong
- `1.0` = Full opacity

### Adjust Overlay Darkness
```css
.gif-background::after {
  background: linear-gradient(135deg, rgba(13, 15, 18, 0.85) 0%, rgba(33, 37, 41, 0.85) 100%);
  /* Change 0.85 to adjust darkness (0.0 to 1.0) */
}
```

### Change Blur Amount
```css
.gif-background::after {
  backdrop-filter: blur(2px); /* Change 2px to your preferred blur */
}
```

### Use a Different File Name or Path
```css
.gif-background::before {
  background-image: url('/your-custom-name.gif');
}
```

### Change Background Size/Position
```css
.gif-background::before {
  background-size: cover; /* Options: cover, contain, 100%, auto */
  background-position: center; /* Options: top, bottom, left, right, center */
}
```

## 🎯 Recommended GIF Specifications

- **Resolution**: 1920x1080 or higher for desktop, optimized for mobile
- **File Size**: Keep under 5MB for better performance
- **Frame Rate**: 15-30 fps for smooth animation
- **Colors**: Darker or muted colors work best with the overlay
- **Content**: Abstract patterns, subtle animations, or themed graphics

## 🔧 Troubleshooting

**GIF not showing?**
- Check the file is named exactly `background.gif`
- Verify it's in `frontend/public/` folder
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

**GIF too bright/dark?**
- Adjust the `opacity` value in `.gif-background::before`
- Modify the overlay darkness in `.gif-background::after`

**Performance issues?**
- Reduce GIF file size
- Lower frame rate
- Use fewer colors in the GIF
- Consider using a video format instead (MP4 with similar setup)

## 🌐 Alternative: Using Video Instead of GIF

For better performance with large animations, you can use MP4:

1. Convert your GIF to MP4
2. Update `index.css`:
```css
.gif-background::before {
  background-image: none;
}

.gif-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.gif-background video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  opacity: 0.3;
}
```

3. Update `App.tsx`:
```tsx
<div className="gif-background">
  <video autoPlay loop muted playsInline>
    <source src="/background.mp4" type="video/mp4" />
  </video>
</div>
```

## 📝 Notes

- The background is applied globally across all pages
- Content remains fully readable with the overlay system
- The setup is mobile-responsive and works on all devices
- Z-index layering ensures content always appears above the background
