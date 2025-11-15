import { useThemeStore } from '@/store/themeStore'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const FONT_OPTIONS = [
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'TheGoodMonolith', sans-serif", label: 'TheGoodMonolith' },
  { value: "'Pixeloid Sans', sans-serif", label: 'Pixeloid Sans' },
]

const COLOR_PRESETS = [
  { name: 'Blue', value: '222.2 47.4% 11.2%' },
  { name: 'Purple', value: '262.1 83.3% 57.8%' },
  { name: 'Green', value: '142.1 76.2% 36.3%' },
  { name: 'Orange', value: '24.6 95% 53.1%' },
  { name: 'Red', value: '0 72.2% 50.6%' },
  { name: 'Pink', value: '330 81% 60%' },
]

export default function ThemeCustomizer() {
  const { primaryColor, fontFamily, darkMode, setPrimaryColor, setFontFamily, toggleDarkMode, resetTheme } = useThemeStore()
  const [customColor, setCustomColor] = useState('#1e293b')
  const [showSuccess, setShowSuccess] = useState(false)
  const [tempFontFamily, setTempFontFamily] = useState(fontFamily)
  const [tempPrimaryColor, setTempPrimaryColor] = useState(primaryColor)
  const [tempCustomColor, setTempCustomColor] = useState('#1e293b')
  const [tempDarkMode, setTempDarkMode] = useState(darkMode)

  useEffect(() => {
    // Initialize customColor from primaryColor
    const hex = hslToHex(primaryColor)
    setCustomColor(hex)
    setTempCustomColor(hex)
    setTempFontFamily(fontFamily)
    setTempPrimaryColor(primaryColor)
    setTempDarkMode(darkMode)
  }, [primaryColor, fontFamily, darkMode])

  const handleColorChange = (color: string) => {
    // Convert hex to HSL
    const hsl = hexToHsl(color)
    setTempPrimaryColor(hsl)
    setTempCustomColor(color)
    setCustomColor(color)
  }

  const handlePresetColor = (hsl: string) => {
    setTempPrimaryColor(hsl)
    // Convert HSL back to hex for display
    const hex = hslToHex(hsl)
    setTempCustomColor(hex)
    setCustomColor(hex)
  }

  const handleFontChange = (font: string) => {
    setTempFontFamily(font)
  }

  const handleSave = () => {
    setPrimaryColor(tempPrimaryColor)
    setFontFamily(tempFontFamily)
    if (tempDarkMode !== darkMode) {
      toggleDarkMode()
    }
    setCustomColor(tempCustomColor)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const hasChanges = () => {
    return tempPrimaryColor !== primaryColor || tempFontFamily !== fontFamily || tempDarkMode !== darkMode
  }

  return (
    <div className="space-y-8">
      {/* Dark Mode Toggle */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-[#211c37] dark:text-white mb-4 block">
          Chế độ giao diện
        </Label>
        <div className="flex items-center justify-between p-4 bg-[#f5f7f9] dark:bg-[#1a1a1a] rounded-xl border border-[#e7eae9] dark:border-[#333]">
          <div className="flex items-center gap-3">
            {tempDarkMode ? (
              <Moon className="w-5 h-5 text-[#211c37] dark:text-white" />
            ) : (
              <Sun className="w-5 h-5 text-[#211c37] dark:text-white" />
            )}
            <span className="text-sm font-medium text-[#211c37] dark:text-white">
              {tempDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <button
            onClick={() => setTempDarkMode(!tempDarkMode)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              tempDarkMode ? "bg-[#3bafa8]" : "bg-gray-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                tempDarkMode ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      {/* Color Customization */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-[#211c37] dark:text-white mb-4 block">
            Màu chủ đạo
          </Label>
          
          {/* Color Presets */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetColor(preset.value)}
                className={cn(
                  "h-12 rounded-xl border-2 transition-colors",
                  tempPrimaryColor === preset.value
                    ? "border-[#3bafa8] ring-2 ring-[#3bafa8] ring-offset-2"
                    : "border-[#e7eae9] hover:border-[#3bafa8]"
                )}
                style={{
                  backgroundColor: hslToHex(preset.value),
                }}
                title={preset.name}
              />
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={tempCustomColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-12 w-20 rounded-xl border border-[#e7eae9] cursor-pointer"
            />
            <Input
              type="text"
              value={tempCustomColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="flex-1 border-[#e7eae9] rounded-xl h-12"
              placeholder="#1e293b"
            />
          </div>
        </div>
      </div>

      {/* Font Customization */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-[#211c37] dark:text-white mb-4 block">
          Font chữ
        </Label>
        <select
          value={tempFontFamily}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full px-4 py-3 border border-[#e7eae9] dark:border-[#333] bg-white dark:bg-[#1a1a1a] rounded-xl focus:ring-2 focus:ring-[#3bafa8] focus:border-transparent h-12 text-sm font-medium text-[#211c37] dark:text-white"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
        
        {/* Font Preview */}
        <div className="mt-4 p-6 bg-[#f5f7f9] dark:bg-[#1a1a1a] rounded-xl border border-[#e7eae9] dark:border-[#333]">
          <p className="text-base text-[#211c37] dark:text-white" style={{ fontFamily: tempFontFamily }}>
            Xem trước font chữ: The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      {/* Save and Reset Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={!hasChanges()}
          className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-xl h-12 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Đã lưu!
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </Button>
        <Button
          onClick={resetTheme}
          variant="outline"
          className="flex-1 border-[#e7eae9] dark:border-[#333] rounded-xl h-12 text-[#211c37] dark:text-white hover:bg-[#f5f7f9] dark:hover:bg-[#2a2a2a] transition-colors"
        >
          Đặt lại mặc định
        </Button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Đã lưu thành công! Các thay đổi đã được áp dụng.</span>
        </div>
      )}
    </div>
  )
}

// Helper functions
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(' ').map((val, i) => {
    if (i === 0) return parseFloat(val) / 360
    return parseFloat(val) / 100
  })

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

