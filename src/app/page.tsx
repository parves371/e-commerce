import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <Button variant={"eleveted"}>
          <span>Click me</span>
        </Button>
      </div>
      <div>
        <Input placeholder="Type something..." />
      </div>
      <div>
        <Progress value={75} />
      </div>
      <div>
        <Textarea placeholder="o aamsdnwmj" />
      </div>
      <div>
        <Checkbox />
      </div>
    </div>
  );
}
