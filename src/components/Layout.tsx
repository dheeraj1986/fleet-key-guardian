
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Dashboard, Car, Key, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: Dashboard },
    { name: "Cars", path: "/cars", icon: Car },
    { name: "Missing Keys", path: "/missing-keys", icon: AlertTriangle },
    { name: "Issued Keys", path: "/issued-keys", icon: Key },
    { name: "Recovered Keys", path: "/recovered-keys", icon: CheckCircle2 },
    { name: "Reports", path: "/reports", icon: FileText },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar>
          <SidebarContent>
            <div className="px-3 py-4">
              <h1 className="text-2xl font-bold text-navy flex items-center">
                <Key className="mr-2" size={24} />
                Fleet Key Guardian
              </h1>
            </div>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className={`flex items-center gap-2 ${location.pathname === item.path ? 'bg-navy text-white' : ''}`}
                    >
                      <item.icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
