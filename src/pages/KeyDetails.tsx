
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useKeyManagement } from "@/contexts/KeyManagementContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { ArrowLeft, Key as KeyIcon } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import TransactionTable from "@/components/TransactionTable";

const KeyDetails: React.FC = () => {
  const { carId, keyId } = useParams<{ carId: string; keyId: string }>();
  const { 
    getCar, 
    getKey, 
    purposes, 
    issueKey, 
    returnKey, 
    markKeyMissing, 
    markKeyRecovered 
  } = useKeyManagement();
  
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isMissingDialogOpen, setIsMissingDialogOpen] = useState(false);
  const [isRecoveredDialogOpen, setIsRecoveredDialogOpen] = useState(false);
  
  const [issueFormData, setIssueFormData] = useState({
    issuedTo: "",
    purposeId: "",
    notes: ""
  });
  
  const [returnFormData, setReturnFormData] = useState({
    location: "",
    notes: ""
  });
  
  const [missingFormData, setMissingFormData] = useState({
    notes: ""
  });
  
  const [recoveredFormData, setRecoveredFormData] = useState({
    location: "",
    notes: ""
  });
  
  const car = getCar(carId ?? "");
  const key = getKey(keyId ?? "");
  
  if (!car || !key) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Key not found</h2>
        <p className="mb-4">The key you are looking for does not exist.</p>
        <Button asChild>
          <Link to="/cars">Back to Cars</Link>
        </Button>
      </div>
    );
  }
  
  const handleIssueKey = () => {
    if (!issueFormData.issuedTo || !issueFormData.purposeId) {
      return;
    }
    
    issueKey(
      car.id,
      key.id,
      issueFormData.issuedTo,
      issueFormData.purposeId,
      issueFormData.notes
    );
    
    setIssueFormData({ issuedTo: "", purposeId: "", notes: "" });
    setIsIssueDialogOpen(false);
  };
  
  const handleReturnKey = () => {
    if (!returnFormData.location) {
      return;
    }
    
    returnKey(
      car.id,
      key.id,
      returnFormData.location,
      returnFormData.notes
    );
    
    setReturnFormData({ location: "", notes: "" });
    setIsReturnDialogOpen(false);
  };
  
  const handleMarkMissing = () => {
    markKeyMissing(
      car.id,
      key.id,
      missingFormData.notes
    );
    
    setMissingFormData({ notes: "" });
    setIsMissingDialogOpen(false);
  };
  
  const handleMarkRecovered = () => {
    if (!recoveredFormData.location) {
      return;
    }
    
    markKeyRecovered(
      car.id,
      key.id,
      recoveredFormData.location,
      recoveredFormData.notes
    );
    
    setRecoveredFormData({ location: "", notes: "" });
    setIsRecoveredDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/cars/${car.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5 text-navy" />
            <h1 className="text-3xl font-bold">Key #{key.keyNumber}</h1>
            <StatusBadge status={key.status} />
          </div>
          <p className="text-muted-foreground">{car.regNumber} - {car.model}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Key Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm">{key.status}</p>
            </div>
            {key.status === 'issued' && (
              <>
                <div>
                  <p className="text-sm font-medium">Issued To</p>
                  <p className="text-sm">{key.issuedTo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Purpose</p>
                  <p className="text-sm">{key.purpose}</p>
                </div>
              </>
            )}
            {key.status === 'available' && (
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm">{key.location}</p>
              </div>
            )}
            
            <div className="pt-4 space-y-2">
              {key.status === 'available' && (
                <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Issue Key</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Key</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label htmlFor="issuedTo" className="text-sm font-medium block mb-1">
                          Issued To
                        </label>
                        <Input
                          id="issuedTo"
                          value={issueFormData.issuedTo}
                          onChange={(e) => setIssueFormData({...issueFormData, issuedTo: e.target.value})}
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label htmlFor="purpose" className="text-sm font-medium block mb-1">
                          Purpose
                        </label>
                        <Select 
                          value={issueFormData.purposeId} 
                          onValueChange={(value) => setIssueFormData({...issueFormData, purposeId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            {purposes.map((purpose) => (
                              <SelectItem key={purpose.id} value={purpose.id}>
                                {purpose.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="notes" className="text-sm font-medium block mb-1">
                          Notes (Optional)
                        </label>
                        <Textarea
                          id="notes"
                          value={issueFormData.notes}
                          onChange={(e) => setIssueFormData({...issueFormData, notes: e.target.value})}
                          placeholder="Any additional notes"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleIssueKey}>Issue Key</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {key.status === 'issued' && (
                <>
                  <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Return Key</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Return Key</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label htmlFor="location" className="text-sm font-medium block mb-1">
                            Location
                          </label>
                          <Input
                            id="location"
                            value={returnFormData.location}
                            onChange={(e) => setReturnFormData({...returnFormData, location: e.target.value})}
                            placeholder="Where is the key stored"
                          />
                        </div>
                        <div>
                          <label htmlFor="notes" className="text-sm font-medium block mb-1">
                            Notes (Optional)
                          </label>
                          <Textarea
                            id="notes"
                            value={returnFormData.notes}
                            onChange={(e) => setReturnFormData({...returnFormData, notes: e.target.value})}
                            placeholder="Any additional notes"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleReturnKey}>Return Key</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isMissingDialogOpen} onOpenChange={setIsMissingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">Mark as Missing</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Mark Key as Missing</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label htmlFor="notes" className="text-sm font-medium block mb-1">
                            Notes (Optional)
                          </label>
                          <Textarea
                            id="notes"
                            value={missingFormData.notes}
                            onChange={(e) => setMissingFormData({...missingFormData, notes: e.target.value})}
                            placeholder="Any additional information about the missing key"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsMissingDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleMarkMissing}>
                          Mark as Missing
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              {key.status === 'missing' && (
                <Dialog open={isRecoveredDialogOpen} onOpenChange={setIsRecoveredDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Mark as Recovered</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Key as Recovered</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label htmlFor="location" className="text-sm font-medium block mb-1">
                          Location
                        </label>
                        <Input
                          id="location"
                          value={recoveredFormData.location}
                          onChange={(e) => setRecoveredFormData({...recoveredFormData, location: e.target.value})}
                          placeholder="Where is the key stored"
                        />
                      </div>
                      <div>
                        <label htmlFor="notes" className="text-sm font-medium block mb-1">
                          Notes (Optional)
                        </label>
                        <Textarea
                          id="notes"
                          value={recoveredFormData.notes}
                          onChange={(e) => setRecoveredFormData({...recoveredFormData, notes: e.target.value})}
                          placeholder="Any additional notes"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRecoveredDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleMarkRecovered}>Mark as Recovered</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {key.status === 'available' && (
                <Dialog open={isMissingDialogOpen} onOpenChange={setIsMissingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Mark as Missing</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Key as Missing</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <label htmlFor="notes" className="text-sm font-medium block mb-1">
                          Notes (Optional)
                        </label>
                        <Textarea
                          id="notes"
                          value={missingFormData.notes}
                          onChange={(e) => setMissingFormData({...missingFormData, notes: e.target.value})}
                          placeholder="Any additional information about the missing key"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsMissingDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleMarkMissing}>
                        Mark as Missing
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Complete history of all key transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={key.transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyDetails;
