
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from "@/types";
import { Car as CarIcon, Key } from "lucide-react";
import { Link } from "react-router-dom";

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { id, regNumber, model, keys } = car;
  
  const availableKeys = keys.filter(key => key.status === 'available').length;
  const issuedKeys = keys.filter(key => key.status === 'issued').length;
  const missingKeys = keys.filter(key => key.status === 'missing').length;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center">
            <CarIcon className="h-5 w-5 text-navy mr-2" />
            <CardTitle className="text-lg">{regNumber}</CardTitle>
          </div>
        </div>
        <p className="text-sm text-gray-500">{model}</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded">
            <p className="text-xs text-gray-500">Available</p>
            <p className="font-bold text-keyStatus-available">{availableKeys}</p>
          </div>
          <div className="bg-amber-50 p-2 rounded">
            <p className="text-xs text-gray-500">Issued</p>
            <p className="font-bold text-keyStatus-issued">{issuedKeys}</p>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs text-gray-500">Missing</p>
            <p className="font-bold text-keyStatus-missing">{missingKeys}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to={`/cars/${id}`}>
            <Key className="h-4 w-4 mr-1" /> View Keys
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarCard;
