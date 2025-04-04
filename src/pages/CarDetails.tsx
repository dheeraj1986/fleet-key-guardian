
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useKeyManagement } from "@/contexts/KeyManagementContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Car as CarIcon, ArrowLeft, Plus } from "lucide-react";
import KeyStatusCard from "@/components/KeyStatusCard";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const CarDetails: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const { getCar, addNewKey } = useKeyManagement();
  const { toast } = useToast();
  const [newKeyNumber, setNewKeyNumber] = React.useState<number>(0);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  const car = getCar(carId ?? "");
  
  if (!car) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Car not found</h2>
        <p className="mb-4">The car you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/cars">Back to Cars</Link>
        </Button>
      </div>
    );
  }
  
  const handleAddNewKey = () => {
    if (newKeyNumber <= 0) {
      toast({
        title: "Invalid key number",
        description: "Please enter a valid key number.",
        variant: "destructive"
      });
      return;
    }
    
    addNewKey(car.id, newKeyNumber);
    setNewKeyNumber(0);
    setDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/cars">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center">
              <CarIcon className="h-5 w-5 text-navy mr-2" />
              <h1 className="text-3xl font-bold">{car.regNumber}</h1>
            </div>
            <p className="text-muted-foreground">{car.model}</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Key</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label htmlFor="keyNumber" className="block text-sm font-medium mb-1">
                Key Number
              </label>
              <Input
                id="keyNumber"
                type="number"
                min={1}
                value={newKeyNumber || ""}
                onChange={(e) => setNewKeyNumber(Number(e.target.value))}
                placeholder="Enter key number"
              />
              <p className="text-sm text-gray-500 mt-1">
                Existing keys: {car.keys.map(k => k.keyNumber).join(", ")}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewKey}>
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">All Keys</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="issued">Issued</TabsTrigger>
          <TabsTrigger value="missing">Missing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.keys.map(key => (
                  <KeyStatusCard 
                    key={key.id} 
                    carKey={key} 
                    carId={car.id} 
                    carRegNumber={car.regNumber} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="available">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.keys
                  .filter(key => key.status === 'available')
                  .map(key => (
                    <KeyStatusCard 
                      key={key.id} 
                      carKey={key} 
                      carId={car.id} 
                      carRegNumber={car.regNumber} 
                    />
                  ))
                }
              </div>
              
              {car.keys.filter(key => key.status === 'available').length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No available keys found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issued">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.keys
                  .filter(key => key.status === 'issued')
                  .map(key => (
                    <KeyStatusCard 
                      key={key.id} 
                      carKey={key} 
                      carId={car.id} 
                      carRegNumber={car.regNumber} 
                    />
                  ))
                }
              </div>
              
              {car.keys.filter(key => key.status === 'issued').length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No issued keys found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="missing">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {car.keys
                  .filter(key => key.status === 'missing')
                  .map(key => (
                    <KeyStatusCard 
                      key={key.id} 
                      carKey={key} 
                      carId={car.id} 
                      carRegNumber={car.regNumber} 
                    />
                  ))
                }
              </div>
              
              {car.keys.filter(key => key.status === 'missing').length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No missing keys found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarDetails;
