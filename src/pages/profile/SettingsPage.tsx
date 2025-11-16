import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ThemeCustomizer from '@/components/theme/ThemeCustomizer'
import { cn } from '@/lib/utils'
import { useNeoBrutalismMode, getNeoBrutalismCardClasses, getNeoBrutalismTextClasses } from '@/lib/utils/theme-utils'

export default function SettingsPage() {
  const neoBrutalismMode = useNeoBrutalismMode()

  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Customize interface and system settings"
    >
      <div className="space-y-6">
        <Card className={getNeoBrutalismCardClasses(neoBrutalismMode)}>
          <CardHeader>
            <CardTitle className={cn(
              "text-xl text-[#1f1d39] dark:text-white",
              getNeoBrutalismTextClasses(neoBrutalismMode, 'heading')
            )}>Theme Customization</CardTitle>
            <CardDescription className={cn(
              "text-[#85878d] dark:text-gray-400",
              getNeoBrutalismTextClasses(neoBrutalismMode, 'body')
            )}>
              Change colors and fonts according to your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeCustomizer />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

