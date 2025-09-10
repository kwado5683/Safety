# Theme System Testing Guide

## Quick Test Checklist

### 1. **Basic Theme Toggle**
- [ ] Click the sun/moon icon in the header
- [ ] Background should change from light to dark (or vice versa)
- [ ] Text colors should change appropriately
- [ ] All components should adapt to the new theme

### 2. **Visual Verification**
- [ ] **Light Mode**: White/light backgrounds, dark text
- [ ] **Dark Mode**: Dark backgrounds, light text
- [ ] **KPI Cards**: Should have different background colors in each theme
- [ ] **Charts**: Text and grid lines should change color
- [ ] **Navigation**: Hover states should work in both themes

### 3. **Persistence Test**
- [ ] Toggle theme to dark mode
- [ ] Refresh the page
- [ ] Page should load in dark mode (no flash)
- [ ] Toggle to light mode
- [ ] Refresh again
- [ ] Page should load in light mode

### 4. **System Preference Test**
- [ ] Clear localStorage: `localStorage.removeItem('theme')`
- [ ] Refresh page
- [ ] Should match your system's dark/light mode preference

### 5. **Accessibility Test**
- [ ] Use Tab key to navigate to theme toggle
- [ ] Press Enter or Space to toggle theme
- [ ] Focus ring should be visible
- [ ] Screen reader should announce theme changes

## Troubleshooting

### If backgrounds aren't changing:
1. Check browser console for errors
2. Verify Tailwind config is loaded
3. Ensure `dark` class is being added to `<html>` element
4. Check that dark mode classes are being applied

### If there's a flash of unstyled content:
1. The inline script in layout.js should prevent this
2. Check that the script is running before page load

### If theme toggle isn't working:
1. Check that ThemeProvider is wrapping the app
2. Verify useTheme hook is being used correctly
3. Check for JavaScript errors in console

## Expected Behavior

### Light Mode
- Background: Light gradients (slate-50, blue-50, indigo-50)
- Text: Dark colors (slate-800, slate-600)
- Cards: White backgrounds with light borders
- Charts: Dark text and grid lines

### Dark Mode
- Background: Dark gradients (slate-900, slate-800)
- Text: Light colors (slate-200, slate-400)
- Cards: Dark backgrounds (slate-800) with dark borders
- Charts: Light text and grid lines

## Browser Developer Tools

### Check Theme Class
```javascript
// In browser console
document.documentElement.classList.contains('dark')
// Should return true in dark mode, false in light mode
```

### Check CSS Variables
```javascript
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--background')
// Should return different values in light vs dark mode
```

### Check Tailwind Classes
- Inspect elements to see if `dark:` classes are being applied
- Look for classes like `dark:bg-slate-800`, `dark:text-slate-200`
