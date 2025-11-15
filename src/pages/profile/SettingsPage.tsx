import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ThemeCustomizer from '@/components/theme/ThemeCustomizer'

export default function SettingsPage() {
  return (
    <DashboardLayout 
      title="Settings" 
      subtitle="Customize interface and system settings"
    >
      <div className="space-y-6">
        <Card className="border border-[#e5e7e7] rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-[#1f1d39]">Theme Customization</CardTitle>
            <CardDescription className="text-[#85878d]">
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

