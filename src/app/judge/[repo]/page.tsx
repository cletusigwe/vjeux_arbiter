"use client";
import { useEffect, useState } from "react";
import JudgeChallenge from "@/components/JudgeChallenge";
import { useParams } from "next/navigation";
import type { IssueData, ChallengeResult } from "@/lib/consts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Judge() {
  const { repo } = useParams();
  const [submissions, setSubmissions] = useState<
    ChallengeResult["issuesData"] | null
  >(null);
  const [prizes, setPrizes] = useState<ChallengeResult["prizes"]>([0, 0, 0]);
  const [deadline, setDeadline] = useState<ChallengeResult["deadline"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssueData() {
      try {
        const response = await fetch("/api/get_issue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ repo }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch issue data");
        }

        const data: ChallengeResult = await response.json();
        setSubmissions(data.issuesData);
        setDeadline(data.deadline);
        setPrizes(data.prizes);
      } catch (error) {
        console.error("Error fetching issue data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (repo) {
      fetchIssueData();
    }
  }, [repo]);

  if (loading) {
    return (
      <main className="bg-grey p-5 lg:px-0 lg:grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
        <div className="flex flex-col gap-12 p-3 h-screen w-full">
          <Skeleton className="w-full h-full rounded-sm bg-black" />
          <Skeleton className="w-full h-full rounded-sm bg-black" />
          <Skeleton className="w-full h-full rounded-sm bg-black" />
        </div>
      </main>
    );
  }

  if (!submissions) {
    return (
      <main className="bg-grey p-5 lg:px-0 lg:grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
        <div className="flex flex-col gap-2 justify-center items-center p-3 h-screen w-full text-white font-semibold text-sm">
          <span>No Data For An Algorithm-Arena "{repo}" Found.</span>
          <span>Are you sure this is a valid algorithm arena challenge?</span>
          <span>
            Are you sure your network connection is good and api.github.com is
            not blocked?
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-grey min-h-screen p-5 lg:px-0 lg:grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
      <JudgeChallenge
        deadline={deadline}
        submissions={submissions}
        setSubmissions={setSubmissions}
        repo={repo as string}
        prizes={prizes}
      />
    </main>
  );
}
