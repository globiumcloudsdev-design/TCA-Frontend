'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/services/supportService';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useUIStore } from '@/store/uiStore';
import TextareaField from '@/components/common/TextareaField';

export default function TicketDetailsPage() {
  const { type, ticketId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState('');
  const chatEndRef = useRef(null);

  const { data: ticketResponse, isLoading } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => supportService.getTicketDetails(ticketId),
    enabled: !!ticketId
  });

  const replyMutation = useMutation({
    mutationFn: (msg) => supportService.addReply(ticketId, msg),
    onSuccess: () => {
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reply')
  });

  const ticket = ticketResponse?.data?.data || ticketResponse?.data;
  const setBreadcrumbLabel = useUIStore((state) => state.setBreadcrumbLabel);

  useEffect(() => {
    if (ticket?.subject) {
      setBreadcrumbLabel(ticket.subject);
    }
    return () => setBreadcrumbLabel(null);
  }, [ticket?.subject, setBreadcrumbLabel]);

  useEffect(() => {
    if (ticket?.messages?.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket?.messages?.length]);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found</div>;

  const isClosed = ['CLOSED', 'RESOLVED'].includes(ticket.status);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/${type}/support`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-3">
            {ticket.subject}
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide ${
              isClosed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ticket ID: <span className="font-mono">{ticket.id.split('-')[0]}</span> • Created {format(new Date(ticket.created_at), 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
          {/* Original Request (First Message) */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="font-bold text-slate-600 text-xs">ME</span>
            </div>
            <div className="flex-1 bg-white border shadow-sm rounded-2xl rounded-tl-none p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">You (Original Request)</span>
                <span className="text-xs text-muted-foreground">{format(new Date(ticket.created_at), 'hh:mm a, dd MMM')}</span>
              </div>
              <div className="text-slate-700 text-sm tiptap-content whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </div>
          </div>

          {/* Replies */}
          {ticket.messages?.map((msg) => {
            const isMe = msg.sender_type === 'INSTITUTE';
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isMe ? 'bg-slate-200' : 'bg-primary/10'
                }`}>
                  <span className={`font-bold text-xs ${isMe ? 'text-slate-600' : 'text-primary'}`}>
                    {isMe ? 'ME' : 'TCA'}
                  </span>
                </div>
                <div className={`max-w-[80%] border shadow-sm rounded-2xl p-4 ${
                  isMe ? 'bg-white rounded-tl-none' : 'bg-primary/5 border-primary/10 rounded-tr-none'
                }`}>
                  <div className="flex justify-between items-center mb-2 gap-4">
                    <span className="font-semibold text-sm">{isMe ? 'You' : 'The Clouds Academy Support'}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.created_at), 'hh:mm a, dd MMM')}</span>
                  </div>
                  <div className="text-slate-700 text-sm tiptap-content whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.message }} />
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Reply Box */}
        <div className="p-4 bg-white border-t shrink-0">
          {isClosed && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-800">This ticket has been marked as <b>{ticket.status}</b>. Replying will reopen it.</p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <TextareaField
              className="w-full"
              isTiptap={true}
              content={replyMessage}
              onContentChange={setReplyMessage}
              placeholder="Type your reply here..."
            />
            <div className="flex justify-end">
              <Button 
                className="px-6" 
                disabled={!replyMessage.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate(replyMessage)}
              >
                {replyMutation.isPending ? (
                  <><Clock className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Reply</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
