import { Arena } from "@/lib/consts";
import ViewArena from "./ViewArena";

interface Props {
  arenas: Arena[];
  startIndex: number;
  endIndex: number;
}

const ViewAllArenas = ({ arenas, startIndex, endIndex }: Props) => {
  const visibleArenas = arenas.slice(startIndex, endIndex);

  return (
    <div className="size-full p-3 grid grid-rows-4 gap-12 border-2 border-neutral-800">
      {visibleArenas.map((arena, index) => (
        <ViewArena arena={arena} key={index + startIndex} />
      ))}
    </div>
  );
};

export default ViewAllArenas;
