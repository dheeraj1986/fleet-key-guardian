
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { KeyTransaction } from "@/types";
import { format } from "date-fns";

interface TransactionTableProps {
  transactions: KeyTransaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const getTransactionDetails = (transaction: KeyTransaction) => {
    switch (transaction.type) {
      case "issue":
        return {
          tag: "Issued",
          tagClass: "bg-blue-100 text-blue-800",
          details: `Issued to ${transaction.issuedTo} for ${transaction.purpose}`
        };
      case "return":
        return {
          tag: "Returned",
          tagClass: "bg-green-100 text-green-800",
          details: `Returned to ${transaction.location}`
        };
      case "mark-missing":
        return {
          tag: "Missing",
          tagClass: "bg-red-100 text-red-800",
          details: transaction.notes || "Key marked as missing"
        };
      case "mark-recovered":
        return {
          tag: "Recovered",
          tagClass: "bg-purple-100 text-purple-800",
          details: `Recovered at ${transaction.location}`
        };
      case "add-new":
        return {
          tag: "Added",
          tagClass: "bg-gray-100 text-gray-800",
          details: "New key added"
        };
      default:
        return {
          tag: transaction.type,
          tagClass: "bg-gray-100 text-gray-800",
          details: transaction.notes || ""
        };
    }
  };
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTransactions.map((transaction) => {
            const { tag, tagClass, details } = getTransactionDetails(transaction);
            return (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.timestamp), "dd MMM yyyy, HH:mm")}
                </TableCell>
                <TableCell>
                  <span className={`rounded px-2 py-1 text-xs font-medium ${tagClass}`}>
                    {tag}
                  </span>
                </TableCell>
                <TableCell>{details}</TableCell>
                <TableCell>{transaction.notes}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
