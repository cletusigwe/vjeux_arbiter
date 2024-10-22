import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Props {
  username: string;
  comment: string;
  setComment: (value: string) => void;
}
const AddComment = ({ username, comment, setComment }: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <MessageSquareText className="size-5 text-neutral-300" />
      </DialogTrigger>
      <DialogContent className="bg-grey">
        <DialogHeader>
          <DialogTitle className="border-b-2 w-fit mx-auto border-b-orange">
            Comment on {username}'s submission
          </DialogTitle>
          {/* <DialogDescription>Nice Work Bro</DialogDescription> */}
        </DialogHeader>
      
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={`comment_on_${username}`}>
            Comment and Remarks On Submission
          </Label>
          <Textarea
            id={`comment_on_${username}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
            placeholder="Insane how in 1099 bytes he got a fully working minigolf with physics and 52 levels! Using randomly generated circles for obstacles is so clever"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            vjeux's short comment on {username}'s submission
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddComment;
