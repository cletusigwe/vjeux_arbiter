import { Arena } from "@/lib/consts";
import Image from "next/image";
import Markdown from "react-markdown";

function extractRepoName(url: string) {
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split("/");
  return pathSegments[pathSegments.length - 1];
}

interface Props {
  arena: Arena;
}
const ViewArena = ({ arena }: Props) => {
  return (
    <a
      href={`/judge/${extractRepoName(arena.url)}`}
      target="_blank"
      className="bg-black w-full p-3 flex gap-3"
    >
      <div className="flex-grow">
        <div className="flex flex-col justify-between items-center h-full gap-3">
          <div className="flex items-center w-full">
            <div className="flex items-center gap-2">
              <p className="bg-grey px-2 py-1 text-sm font-bold text-orange flex justify-center items-center rounded-sm">
                Week {arena.week}
              </p>
              <span
                className={`${
                  arena.judged
                    ? "bg-green-600 text-black"
                    : "bg-red-900 text-neutral-200"
                } p-1 h-fit  text-[10px] font-semibold rounded-sm`}
              >
                {arena.judged ? "winners published" : "winners not published"}
              </span>
            </div>
            <div className="flex-grow flex justify-center gap-5">
              <h3 className="text-sm italic font-semibold border-b-2 border-b-orange h-fit w-fit">
                {arena.name}
              </h3>
              <span className="text-sm font-semibold text-neutral-400 text-opacity-70">
                {arena.submissionCount} submissions
              </span>
            </div>
          </div>
          <h5 className="markdownContent ">
            <Markdown>{arena.description}</Markdown>
          </h5>
          <div className="w-full flex justify-between items-end">
            <span className="text-sm text-neutral-400 flex gap-3">
              <span>
                First Prize:{" "}
                <span className="text-neutral-200">${arena.prizes[0]}</span>{" "}
              </span>
              <span>
                Second Prize:{" "}
                <span className="text-neutral-200">${arena.prizes[1]}</span>
              </span>
              <span>
                Third Prize:{" "}
                <span className="text-neutral-200">${arena.prizes[2]}</span>
              </span>
            </span>
            <span className="text-sm font-semibold text-neutral-500">
              Deadline is{" "}
              <span className="text-neutral-300">{arena.deadline}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="size-20 float-right rounded-sm flex justify-center items-center">
          <Image
            src={arena.imgUrl}
            width={100}
            height={100}
            alt={`${arena.name}'s image`}
            className="h-30 bg-grey"
          />
        </div>
        <a
          href={arena.url}
          target="_blank"
          className="text-xs text-markdown_blue border-b border-b-markdown_blue"
        >
          view on github
        </a>
      </div>
    </a>
  );
};

export default ViewArena;
