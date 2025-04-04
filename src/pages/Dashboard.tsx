
import React from "react";
import { useKeyManagement } from "@/contexts/KeyManagementContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { 
  Car,
  Key,
  ShieldCheck,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import KeyStatusCard from "@/components/KeyStatusCard";

const Dashboard: React.FC = () => {
  const { stats, cars } = useKeyManagement();
  
  // Get 4 cars with recent activity for the overview section
  const recentCars = cars.slice(0, 4);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Fleet Key Management Overview</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Total Cars" 
          value={stats.totalCars}
          icon={<Car className="h-4 w-4 text-white" />}
          color="bg-navy"
        />
        <StatCard 
          title="Total Keys" 
          value={stats.totalKeys}
          icon={<Key className="h-4 w-4 text-white" />}
          color="bg-navy-lighter"
        />
        <StatCard 
          title="Available Keys" 
          value={stats.availableKeys}
          icon={<ShieldCheck className="h-4 w-4 text-white" />}
          color="bg-keyStatus-available"
        />
        <StatCard 
          title="Issued Keys" 
          value={stats.issuedKeys}
          icon={<AlertCircle className="h-4 w-4 text-white" />}
          color="bg-keyStatus-issued"
        />
        <StatCard 
          title="Missing Keys" 
          value={stats.missingKeys}
          icon={<AlertTriangle className="h-4 w-4 text-white" />}
          color="bg-keyStatus-missing"
        />
      </div>
      
      {/* Key Status Overview */}
      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Keys Overview</CardTitle>
            <CardDescription>Recent key activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recentCars.flatMap(car => 
                car.keys.slice(0, 1).map(key => (
                  <KeyStatusCard 
                    key={key.id} 
                    carKey={key} 
                    carId={car.id} 
                    carRegNumber={car.regNumber} 
                  />
                ))
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link to="/cars">View All Cars</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alert Section */}
      {stats.missingKeys > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Missing Keys Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              There are currently <span className="font-bold">{stats.missingKeys}</span> missing keys in the system that require attention.
            </p>
            <Button variant="destructive" className="mt-4" asChild>
              <Link to="/missing-keys">View Missing Keys</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
