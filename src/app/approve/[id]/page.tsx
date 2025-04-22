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
  AlertTriangle,
  User,
} from "lucide-react";

type EventDetails = {
  clubName: string;
  title: string;
  description: string;
  requestedAmount: number;
  createdBy: string;
  isFinalApproved: boolean;
  approvalCount: number;
  approvals: Array<{ signer: string; role: string; timestamp: number }>;
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

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const contract = await getContract();
        const data = await contract.fetchEvent(Number(id));
        const approvals = await contract.getApprovals(Number(id));

        const parsed = {
          clubName: data[0],
          title: data[1],
          description: data[2],
          requestedAmount: Number(data[3]),
          createdBy: data[4],
          isFinalApproved: data[5],
          approvalCount: Number(data[6]),
          approvals,
        };

        setEvent(parsed);

        const alreadySigned = approvals.some(
          (a: any) => a.signer.toLowerCase() === address?.toLowerCase(),
        );
        setAlreadyApproved(alreadySigned);
      } catch (err: any) {
        setError(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    }

    if (address) {
      fetchEventDetails();
    }
  }, [address, id]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      const contract = await getContract();
      const tx = await contract.approveEvent(Number(id));
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
      (role === "Dean" && event.approvalCount === 1) ||
      (role === "VC" && event.approvalCount === 2));

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
              <div className="flex items-center bg-gray-50 p-3 rounded-md">
                <ThumbsUp className="h-4 w-4 text-gray-500 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Approval Status</p>
                  <div className="flex items-center">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-6 rounded-sm ${i < event.approvalCount ? "bg-purple-600" : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {event.approvalCount}/3
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Approval Chain
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      event.approvalCount > 0
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mentor</p>
                    {event.approvals &&
                      event.approvals.length > 0 &&
                      event.approvals[0] && (
                        <p className="text-xs text-gray-500">
                          {event.approvals[0].signer.substring(0, 6)}...
                          {event.approvals[0].signer.substring(
                            event.approvals[0].signer.length - 4,
                          )}
                        </p>
                      )}
                  </div>
                  {event.approvalCount > 0 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      event.approvalCount > 1
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dean</p>
                    {event.approvals &&
                      event.approvals.length > 1 &&
                      event.approvals[1] && (
                        <p className="text-xs text-gray-500">
                          {event.approvals[1].signer.substring(0, 6)}...
                          {event.approvals[1].signer.substring(
                            event.approvals[1].signer.length - 4,
                          )}
                        </p>
                      )}
                  </div>
                  {event.approvalCount > 1 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>

                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      event.approvalCount > 2
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vice Chancellor</p>
                    {event.approvals &&
                      event.approvals.length > 2 &&
                      event.approvals[2] && (
                        <p className="text-xs text-gray-500">
                          {event.approvals[2].signer.substring(0, 6)}...
                          {event.approvals[2].signer.substring(
                            event.approvals[2].signer.length - 4,
                          )}
                        </p>
                      )}
                  </div>
                  {event.approvalCount > 2 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {alreadyApproved && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You've already approved this event
                </AlertDescription>
              </Alert>
            )}

            {!event.isFinalApproved &&
              !canApprove &&
              role !== "Club" &&
              !alreadyApproved && (
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You are not the next approver in the sequence. The current
                    approval stage requires{" "}
                    {event.approvalCount === 0
                      ? "Mentor"
                      : event.approvalCount === 1
                        ? "Dean"
                        : "Vice Chancellor"}{" "}
                    approval.
                  </AlertDescription>
                </Alert>
              )}
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
