"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Arena } from "@/lib/consts";
import ViewAllArenas from "@/components/ViewAllArenas";
import CreateNewChallenge from "@/components/CreateNewChallenge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Home() {
  const perPage = 4; // Number of items per page
  const [loading, setLoading] = useState(true);
  const [allArenas, setAllArenas] = useState<Arena[] | null>(null);
  const totalPages = Math.ceil((allArenas?.length ?? 0) / perPage);
  const [currentPage, setCurrentPage] = useState(1); // Start from page 1
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false);
  const [isThreadsAuthenticated, setIsThreadsAuthenticated] = useState(false);
  const [isGithubAuthenticated, setIsGithubAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuthentications() {
      try {
        const response = await fetch("/api/active_apps");
        if (!response.ok) {
          throw new Error("Failed to check authentication");
        }
        const { twitterAuth, threadsAuth, githubAuth } = await response.json();
        setIsTwitterAuthenticated(twitterAuth);
        setIsThreadsAuthenticated(threadsAuth);
        setIsGithubAuthenticated(githubAuth);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    }

    checkAuthentications();
    async function fetchArenas() {
      setLoading(true);
      try {
        const response = await fetch(`/api/get_arenas`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to get arenas");
        }

        const { arenas } = await response.json();

        setAllArenas(arenas);
      } catch (error) {
        console.error("Error fetching arena data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArenas();
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

  if (!allArenas) {
    return (
      <main className="bg-grey p-5 lg:px-0 lg:grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
        <div className="flex flex-col justify-center gap-2 items-center p-3 h-screen w-full text-white font-semibold text-sm">
          <span>
            Could not load all algorithm-arena challenges from GitHub API.
          </span>
          <span>
            Are you sure your network connection is good and api.github.com is
            not blocked?
          </span>
        </div>
      </main>
    );
  }

  // Calculate visible pagination links
  const paginationLinks = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    paginationLinks.push(
      <PaginationItem key={1}>
        <PaginationLink
          className={`cursor-pointer rounded-sm hover:bg-neutral-800 hover:text-neutral-200 ${
            currentPage === 1
              ? "border-orange border-2 border-opacity-50 bg-neutral-800"
              : ""
          }`}
          onClick={() => setCurrentPage(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (startPage > 2) {
      paginationLinks.push(
        <PaginationItem key="ellipsis-start">...</PaginationItem>
      );
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationLinks.push(
      <PaginationItem key={i}>
        <PaginationLink
          className={`cursor-pointer rounded-sm hover:bg-neutral-800 hover:text-neutral-200 ${
            currentPage === i
              ? "border-orange border-2 border-opacity-50 bg-neutral-800"
              : ""
          }`}
          isActive={currentPage === i}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationLinks.push(
        <PaginationItem key="ellipsis-end">...</PaginationItem>
      );
    }

    paginationLinks.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          className={`cursor-pointer rounded-sm hover:bg-neutral-800 hover:text-neutral-200 ${
            currentPage === totalPages
              ? "border-orange border-2 border-opacity-50 bg-neutral-800"
              : ""
          }`}
          isActive={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <main className="bg-grey min-h-screen p-5 lg:px-0 grid lg:grid-cols-12 lg:*:col-start-2 lg:*:col-span-10">
      <div className="w-full lg:max-w-[70%] lg:mx-auto flex flex-col gap-5">
        <div className="border-2 border-neutral-800 p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-white">Arbiter</h1>
            <a
              href="https://cletusigwe.com/"
              className="text-xs text-orange border-b border-b-orange w-fit"
            >
              by cletusigwe
            </a>
          </div>
          <div className="flex items-center gap-5 ">
            <div className="flex gap-3">
              <a
                href="/api/twitter/auth"
                className="text-sm text-markdown_blue border-b border-b-markdown_blue"
              >
                {isTwitterAuthenticated && "re"}authenticate X/twitter
              </a>

              <a
                href="/api/threads/auth"
                className="text-sm text-markdown_blue border-b border-b-markdown_blue"
              >
                {isThreadsAuthenticated && "re"}authenticate Meta Threads
              </a>

              {/* {!isGithubAuthenticated && (
                <a
                  href="/api/github/auth"
                  className="text-sm text-markdown_blue border-b border-b-markdown_blue"
                >
                  authenticate Github
                </a>
              )} */}
            </div>
            <a
              href="/new"
              target="_blank"
              className="bg-orange rounded-sm hover:bg-orange hover:bg-opacity-80 p-2 text-sm font-semibold"
            >
              Create New Challenge
            </a>
          </div>
        </div>
        <Pagination className="w-full flex flex-col gap-5">
          <ViewAllArenas
            arenas={allArenas}
            startIndex={(currentPage - 1) * perPage}
            endIndex={(currentPage - 1) * perPage + perPage}
          />
          <div className="border-2 border-neutral-800 p-3 flex justify-center">
            <PaginationContent className="gap-5">
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    className="bg-neutral-800 cursor-pointer hover:bg-neutral-800 hover:bg-opacity-80 text-neutral-300 hover:text-neutral-300 rounded-sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                </PaginationItem>
              )}
              {paginationLinks}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    className="bg-neutral-800 cursor-pointer hover:bg-neutral-800 hover:bg-opacity-80 text-neutral-300 hover:text-neutral-300 rounded-sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </div>
        </Pagination>
      </div>
    </main>
  );
}
