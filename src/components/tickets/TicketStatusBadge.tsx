
import { Badge } from "@/components/ui/badge";
import { TicketStatus } from "@/models";

export const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="border-blue-500 text-blue-500">Open</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-500">In Progress</Badge>;
    case 'on_hold':
      return <Badge className="bg-yellow-500">On Hold</Badge>;
    case 'resolved':
      return <Badge className="bg-green-500">Resolved</Badge>;
    case 'closed':
      return <Badge variant="secondary">Closed</Badge>;
  }
};
