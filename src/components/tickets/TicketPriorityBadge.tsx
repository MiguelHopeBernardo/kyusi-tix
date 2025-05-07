
import { Badge } from "@/components/ui/badge";
import { TicketPriority } from "@/models";

export const getPriorityBadge = (priority: TicketPriority) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'high':
      return <Badge className="bg-orange-500">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500">Medium</Badge>;
    case 'low':
      return <Badge className="bg-green-500">Low</Badge>;
  }
};
