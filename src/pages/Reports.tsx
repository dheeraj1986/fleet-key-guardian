
import React from "react";
import { useKeyManagement } from "@/contexts/KeyManagementContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";

const Reports: React.FC = () => {
  const { stats, cars } = useKeyManagement();
  
  // Data for the status pie chart
  const statusData = [
    { name: "Available", value: stats.availableKeys, color: "#4CAF50" },
    { name: "Issued", value: stats.issuedKeys, color: "#FFA000" },
    { name: "Missing", value: stats.missingKeys, color: "#F44336" },
  ];
  
  // Get cars with the most missing keys
  const carsWithMissingKeys = [...cars]
    .map(car => ({
      id: car.id,
      regNumber: car.regNumber,
      model: car.model,
      missingKeys: car.keys.filter(key => key.status === 'missing').length,
    }))
    .filter(car => car.missingKeys > 0)
    .sort((a, b) => b.missingKeys - a.missingKeys)
    .slice(0, 10);
  
  // Get cars with the most issued keys
  const carsWithIssuedKeys = [...cars]
    .map(car => ({
      id: car.id,
      regNumber: car.regNumber,
      model: car.model,
      issuedKeys: car.keys.filter(key => key.status === 'issued').length,
    }))
    .filter(car => car.issuedKeys > 0)
    .sort((a, b) => b.issuedKeys - a.issuedKeys)
    .slice(0, 10);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Key management statistics and reports</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Status Distribution</CardTitle>
            <CardDescription>Breakdown of all keys by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} keys`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 p-2 rounded">
                <p className="text-xs text-gray-500">Available</p>
                <p className="font-bold text-keyStatus-available">{stats.availableKeys}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded">
                <p className="text-xs text-gray-500">Issued</p>
                <p className="font-bold text-keyStatus-issued">{stats.issuedKeys}</p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="text-xs text-gray-500">Missing</p>
                <p className="font-bold text-keyStatus-missing">{stats.missingKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cars with Missing Keys</CardTitle>
            <CardDescription>Top 10 cars with the most missing keys</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Missing Keys</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carsWithMissingKeys.length > 0 ? (
                  carsWithMissingKeys.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.regNumber}</TableCell>
                      <TableCell>{car.model}</TableCell>
                      <TableCell className="text-right font-bold text-keyStatus-missing">
                        {car.missingKeys}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No cars with missing keys
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cars with Issued Keys</CardTitle>
            <CardDescription>Top 10 cars with the most issued keys</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Issued Keys</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carsWithIssuedKeys.length > 0 ? (
                  carsWithIssuedKeys.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">{car.regNumber}</TableCell>
                      <TableCell>{car.model}</TableCell>
                      <TableCell className="text-right font-bold text-keyStatus-issued">
                        {car.issuedKeys}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No cars with issued keys
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Statistics</CardTitle>
            <CardDescription>Summary of key management metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Cars</TableCell>
                  <TableCell className="text-right">{stats.totalCars}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Keys</TableCell>
                  <TableCell className="text-right">{stats.totalKeys}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Keys per Car (avg)</TableCell>
                  <TableCell className="text-right">
                    {stats.totalCars > 0 ? (stats.totalKeys / stats.totalCars).toFixed(1) : 0}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Available Keys</TableCell>
                  <TableCell className="text-right">{stats.availableKeys}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Issued Keys</TableCell>
                  <TableCell className="text-right">{stats.issuedKeys}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Missing Keys</TableCell>
                  <TableCell className="text-right">{stats.missingKeys}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Availability Rate</TableCell>
                  <TableCell className="text-right">
                    {stats.totalKeys > 0 ? `${((stats.availableKeys / stats.totalKeys) * 100).toFixed(1)}%` : '0%'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
