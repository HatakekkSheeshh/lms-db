import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, MapPin, IdCard } from 'lucide-react'

export default function ProfilePage() {
  const { user, role } = useAuth()

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-[#85878d]">User information not found</div>
      </DashboardLayout>
    )
  }

  const getInitials = () => {
    return `${user.First_Name?.[0] || ''}${user.Last_Name?.[0] || ''}`.toUpperCase()
  }

  return (
    <DashboardLayout 
      title="Profile" 
      subtitle="View and manage your account information"
    >
      <div className="space-y-6">
        <Card className="border border-[#e5e7e7] rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-[#3bafa8] to-[#ff9053] text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl text-[#1f1d39]">
                  {user.First_Name} {user.Last_Name}
                </CardTitle>
                <CardDescription className="capitalize text-[#85878d]">{role}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                <IdCard className="h-5 w-5 text-[#85878d]" />
                <div>
                  <p className="text-sm font-medium text-[#676767] mb-1">University ID</p>
                  <p className="text-sm font-semibold text-[#1f1d39]">{user.University_ID}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                <Mail className="h-5 w-5 text-[#85878d]" />
                <div>
                  <p className="text-sm font-medium text-[#676767] mb-1">Email</p>
                  <p className="text-sm font-semibold text-[#1f1d39]">{user.Email}</p>
                </div>
              </div>

              {user.Phone_Number && (
                <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                  <Phone className="h-5 w-5 text-[#85878d]" />
                  <div>
                    <p className="text-sm font-medium text-[#676767] mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-[#1f1d39]">{user.Phone_Number}</p>
                  </div>
                </div>
              )}

              {user.Address && (
                <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                  <MapPin className="h-5 w-5 text-[#85878d]" />
                  <div>
                    <p className="text-sm font-medium text-[#676767] mb-1">Address</p>
                    <p className="text-sm font-semibold text-[#1f1d39]">{user.Address}</p>
                  </div>
                </div>
              )}

              {user.National_ID && (
                <div className="flex items-center gap-3 p-4 bg-[#f5f7f9] rounded-lg">
                  <IdCard className="h-5 w-5 text-[#85878d]" />
                  <div>
                    <p className="text-sm font-medium text-[#676767] mb-1">National ID</p>
                    <p className="text-sm font-semibold text-[#1f1d39]">{user.National_ID}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

