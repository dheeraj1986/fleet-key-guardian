
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, User, Calendar, MapPin, AlertCircle } from "lucide-react";
import { CarKey } from "@/types";
import StatusBadge from "./StatusBadge";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface KeyStatusCardProps {
  carKey: CarKey;
  carId: string;
  carRegNumber: string;
}

const KeyStatusCard: React.FC<KeyStatusCardProps> = ({ carKey, carId, carRegNumber }) => {
  const { status, keyNumber, issuedTo, purpose, location, transactions } = carKey;

  const lastTransaction = transactions.length > 0 
    ? transactions[transactions.length - 1] 
    : null;
  
  const lastTransactionTime = lastTransaction 
    ? formatDistanceToNow(new Date(lastTransaction.timestamp), { addSuffix: true }) 
    : "N/A";
  
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${status === 'available' ? 'bg-green-100' : status === 'issued' ? 'bg-amber-100' : 'bg-red-100'}`}>
              <Key className={`h-5 w-5 ${status === 'available' ? 'text-green-600' : status === 'issued' ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium">Key #{keyNumber}</h3>
              <p className="text-sm text-gray-500">Car: {carRegNumber}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-3">
          {issuedTo && (
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Issued to:</span>
              <span className="ml-1">{issuedTo}</span>
            </div>
          )}
          
          {purpose && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Purpose:</span>
              <span className="ml-1">{purpose}</span>
            </div>
          )}
          
          {status === 'available' && location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-gray-700 font-medium">Location:</span>
              <span className="ml-1">{location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-700 font-medium">Last activity:</span>
            <span className="ml-1">{lastTransactionTime}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" className="w-full" asChild>
          <Link to={`/cars/${carId}/keys/${carKey.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KeyStatusCard;
