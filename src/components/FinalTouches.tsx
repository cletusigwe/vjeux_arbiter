import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { judgeChallengeSchema } from "@/lib/consts";

interface Props {
  formRef: UseFormReturn<z.infer<typeof judgeChallengeSchema>>;
  onSubmit: (values: z.infer<typeof judgeChallengeSchema>) => void;
}

const FinalTouches = ({ formRef, onSubmit }: Props) => {
  return (
    <div className="flex gap-5">
      <Button
        type="submit"
        variant="outline"
        className="bg-transparent"
        onClick={() => {
          console.log("previewing announcement in new tab");
          // onSubmit(formRef.getValues());
        }}
      >
        Preview Announcement
      </Button>
      <Button
        type="submit"
        onClick={() => {
          console.log("publishing announcements");
          onSubmit(formRef.getValues());
        }}
        className="bg-orange hover:bg-orange hover:bg-opacity-75"
      >
        Publish Announcement
      </Button>
    </div>
  );
};

export default FinalTouches;
