"use client";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateNewChallenge from "@/components/CreateNewChallenge";

export default function NewChallenge() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="bg-grey p-5 lg:px-0 lg:grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
        <div className="grid grid-rows-6 gap-5 p-3 h-screen w-full">
          <Skeleton className="w-full h-full rounded-sm bg-black" />
          <Skeleton className="w-full h-full rounded-sm bg-black" />
          <Skeleton className="w-full h-full rounded-sm bg-black" />
          <Skeleton className="w-full h-full rounded-sm bg-black" />
          <Skeleton className="w-full h-full rounded-sm bg-black" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-grey min-h-screen p-5 lg:px-0 grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
      <div className="w-full lg:max-w-[70%] lg:mx-auto flex flex-col gap-5">
        <CreateNewChallenge />
      </div>
    </main>
  );
}
