"use client";

import { useEffect, useState } from "react";
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
import {
  Wallet,
  Plus,
  Clock,
  CheckCircle,
  School,
  CreditCard,
  ThumbsUp,
} from "lucide-react";

type Event = {
  id: number;
  clubName: string;
  title: string;
  description: string;
  requestedAmount: number;
  createdBy: string;
  isFinalApproved: boolean;
  approvals: number;
};
export default function HomePage() {
  const { address, connect } = useWallet();
  const role = useRole(address);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const [approvalContract, budgetContract] = await getContract();
        const count = await approvalContract.eventCount();
        const results: Event[] = [];
        for (let i = 0; i < count; i++) {
          const result = await approvalContract.fetchEvent(i);
          const clubName = result[0];
          const title = result[1];
          const description = result[2];
          const requestedAmount = Number(result[3]);
          const createdBy = result[4];
          const isFinalApproved = result[5];
          const approvals = Number(result[6]);

          results.push({
            id: i,
            clubName,
            title,
            description,
            createdBy,
            requestedAmount: Number(requestedAmount),
            isFinalApproved,
            approvals: Number(approvals),
          });
        }

        setEvents(results);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <School className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Approval Chain Dashboard
              </h1>
            </div>

            {address ? (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 px-3 py-1 font-medium"
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  {address.substring(0, 6)}...
                  {address.substring(address.length - 4)}
                </Badge>
                {role && (
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    {role}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-gray-600 max-w-2xl">
              Manage and approve event proposals from various clubs and
              organizations.
            </p>

            {address ? (
              <Link href="/create">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Propose New Event
                </Button>
              </Link>
            ) : (
              <Button
                onClick={connect}
                className="bg-gray-800 hover:bg-gray-900"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </header>

        <Separator className="my-6" />

        {!address ? (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Connect your wallet to view and interact with event proposals
              </p>
              <Button
                onClick={connect}
                className="bg-gray-800 hover:bg-gray-900"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 p-3 rounded-full mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No Events Yet
                  </h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    No events have been proposed yet. Be the first to create an
                    event proposal!
                  </p>
                  <Link href="/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Propose New Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md"
                >
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
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center bg-gray-50 p-2 rounded-md">
                        <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Requested Amount
                          </p>
                          <p className="font-medium">
                            ₹{event.requestedAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 p-2 rounded-md">
                        <ThumbsUp className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Approval Status
                          </p>
                          <div className="flex items-center">
                            <div className="flex space-x-1">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-6 rounded-sm ${
                                    i < event.approvals
                                      ? "bg-purple-600"
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 flex flex-wrap gap-2 text-xs text-gray-700">
                              {["Mentor", "HOD", "Dean", "Honourable VC"].map(
                                (role, idx) => (
                                  <span
                                    key={role}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                                      event.approvals > idx
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {role}
                                    {event.approvals > idx ? " ✅" : " ⏳"}
                                  </span>
                                ),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {(role === "Mentor" ||
                    role === "HOD" ||
                    role === "Dean" ||
                    role === "VC") &&
                    !event.isFinalApproved &&
                    event.approvals < 4 && (
                      <CardFooter className="bg-gray-50 border-t">
                        <Link href={`/approve/${event.id}`} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Approve Event
                          </Button>
                        </Link>
                      </CardFooter>
                    )}
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
