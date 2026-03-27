import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, FileText, ArrowRight } from "lucide-react";
import { cases as casesApi } from "@/services/api";

type CaseStatus = string;

interface Case {
  id: string;
  title: string;
  caseNumber: string;
  status: CaseStatus;
  date: string;
  type: string;
}

export function CaseList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const data = await casesApi.getCases();
        const mappedCases = data.eFiledCases.map((c: any) => ({
          id: c._id,
          title: c.case?.subject || c.litigant?.name || "Unknown Case",
          caseNumber: c.caseNumber || "Pending",
          status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Pending",
          date: c.filingDate || c.createdAt || new Date().toISOString(),
          type: c.case?.caseType || "Unknown"
        }));
        setCases(mappedCases);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
        setError("Failed to load cases.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: CaseStatus) => {
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "closed":
      case "rejected":
        return "bg-gray-500/10 text-gray-600 border-gray-200";
      case "archived":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading cases...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredCases.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No cases found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Case Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map((caseItem) => (
                <TableRow key={caseItem.id} className="hover-card cursor-pointer">
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>{caseItem.caseNumber}</TableCell>
                  <TableCell>{caseItem.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(caseItem.status)}`}>
                      {caseItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(caseItem.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/cases/${caseItem.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
