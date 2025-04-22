"use client";

import type React from "react";

import { useState } from "react";
import { getContract } from "@/lib/contract";
import { useWallet } from "@/lib/useWallet";
import { useRole } from "@/lib/useRole";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Loader2,
  School,
  CreditCard,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

export default function CreateEventPage() {
  const { address } = useWallet();
  const role = useRole(address);
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const contract = await getContract();
      await contract.createEvent(clubName, title, description, Number(amount));
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
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
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">
                Propose New Event
              </CardTitle>
            </div>
            <CardDescription>
              Create a new event proposal for approval by the chain of
              authorities
            </CardDescription>
          </CardHeader>

          {role === "Mentor" || role === "Dean" || role === "VC" ? (
            <div className="px-6">
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You are logged in as{" "}
                  <Badge className="ml-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
                    {role}
                  </Badge>
                  . You can still create events, but only Clubs normally do
                  this.
                </AlertDescription>
              </Alert>
            </div>
          ) : null}

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="clubName" className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-gray-500" />
                    Club Name
                  </div>
                </Label>
                <Input
                  id="clubName"
                  placeholder="Enter your club or organization name"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Event Title
                  </div>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Event Description
                  </div>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about your event"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    Requested Amount (₹)
                  </div>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter the amount needed"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-gray-300 focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 text-red-800 border-red-200"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Proposal...
                </>
              ) : (
                "Submit Proposal"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
