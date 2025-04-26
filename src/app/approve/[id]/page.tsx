"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getContract } from "@/lib/contract";
import { useWallet } from "@/lib/useWallet";
import { useRole } from "@/lib/useRole";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  School,
  ThumbsUp,
} from "lucide-react";

type EventDetails = {
  clubName: string;
  title: string;
  description: string;
  requestedAmount: number;
  createdBy: string;
  isFinalApproved: boolean;
  approvalCount: number;
  department: number; // department added here
};

export default function ApproveEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { address } = useWallet();
  const role = useRole(address);

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [departmentBalance, setDepartmentBalance] = useState(0);

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const [approvalContract, budgetContract] = await getContract();
        console.log("got contracts");
        const data = await approvalContract.fetchEvent(Number(id));
        console.log(data);
        const approvals = await approvalContract.getApprovals(Number(id));
        console.log(approvals);

        const parsed = {
          clubName: data[0],
          title: data[1],
          description: data[2],
          requestedAmount: Number(data[3]),
          createdBy: data[4],
          isFinalApproved: data[5],
          approvalCount: Number(data[6]),
          department: data[7], // assuming department is stored at index 7
        };

        setEvent(parsed);
        if (role == "Mentor" && parsed.approvalCount > 0) {
          setAlreadyApproved(true);
        } else if (role == "HOD" && parsed.approvalCount > 1) {
          setAlreadyApproved(true);
        } else if (role == "Dean" && parsed.approvalCount > 2) {
          setAlreadyApproved(true);
        } else if (role == "VC" && parsed.approvalCount > 3) {
          setAlreadyApproved(true);
        }
        // Fetch department balance for HOD
        if (role === "HOD") {
          const balance = await budgetContract.getDepartmentBalance(
            parsed.department,
          );
          setDepartmentBalance(balance);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchEventDetails();
    }
  }, [address, id, role]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      const [approvalContract, budgetContract] = await getContract();

      if (role === "HOD") {
        // If role is HOD, approve the event and subtract from department's budget
        const tx = await budgetContract.approveEvent(
          event!.department,
          event!.requestedAmount,
        );
        await tx.wait();
      }

      const tx = await approvalContract.approveEvent(Number(id));
      await tx.wait();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const canApprove =
    event &&
    !event.isFinalApproved &&
    !alreadyApproved &&
    ((role === "Mentor" && event.approvalCount === 0) ||
      (role === "HOD" && event.approvalCount === 1) ||
      (role === "Dean" && event.approvalCount === 2) ||
      (role === "VC" && event.approvalCount === 3));

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <Alert
            variant="destructive"
            className="bg-red-50 text-red-800 border-red-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </main>
    );
  }

  if (!event) return null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <School className="h-3.5 w-3.5 mr-1 text-gray-500" />
                  {event.clubName}
                </CardDescription>
              </div>
              <Badge
                className={
                  event.isFinalApproved
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                }
              >
                {event.isFinalApproved ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approved
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </div>
                )}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700">{event.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center bg-gray-50 p-3 rounded-md">
                <CreditCard className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Requested Amount</p>
                  <p className="font-medium">
                    ₹{event.requestedAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              {role === "HOD" && (
                <div className="flex items-center bg-gray-50 p-3 rounded-md">
                  <CreditCard className="h-4 w-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Remaining Budget for Department
                    </p>
                    <p className="font-medium">
                      ₹{departmentBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          {canApprove && (
            <CardFooter className="bg-gray-50 border-t">
              <Button
                onClick={handleApprove}
                disabled={approving}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {approving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving Event...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve Event
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
