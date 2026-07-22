'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterAdminSupportService } from '@/services/masterAdminSupportService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useUIStore } from '@/store/uiStore';
import SelectField from '@/components/common/SelectField';
import TextareaField from '@/components/common/TextareaField';

export default function MasterAdminTicketDetailsPage() {
  const { ticketId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState('');
  const chatEndRef = useRef(null);

  const { data: ticketResponse, isLoading } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => masterAdminSupportService.getTicketDetails(ticketId),
    enabled: !!ticketId
  });

  const replyMutation = useMutation({
    mutationFn: (msg) => masterAdminSupportService.addReply(ticketId, msg),
    onSuccess: () => {
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reply')
  });

  const statusMutation = useMutation({
    mutationFn: (status) => masterAdminSupportService.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status')
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
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      {/* Left Chat Area */}
      <div className="flex-1 bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="p-4 border-b bg-slate-50 flex items-center gap-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => router.push('/master-admin/support')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-3">
              {ticket.subject}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ticket ID: <span className="font-mono">{ticket.id.split('-')[0]}</span>
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
          {/* Original Request (First Message) */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="font-bold text-slate-600 text-[10px]">INST</span>
            </div>
            <div className="flex-1 bg-white border shadow-sm rounded-2xl rounded-tl-none p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">{ticket.creator?.first_name} {ticket.creator?.last_name} (Institute)</span>
                <span className="text-xs text-muted-foreground">{format(new Date(ticket.created_at), 'hh:mm a, dd MMM')}</span>
              </div>
              <div className="text-slate-700 text-sm tiptap-content whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </div>
          </div>

          {/* Replies */}
          {ticket.messages?.map((msg) => {
            const isMe = msg.sender_type === 'MASTER_ADMIN';
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isMe ? 'bg-primary/10' : 'bg-slate-200'
                }`}>
                  <span className={`font-bold text-[10px] ${isMe ? 'text-primary' : 'text-slate-600'}`}>
                    {isMe ? 'ME' : 'INST'}
                  </span>
                </div>
                <div className={`max-w-[80%] border shadow-sm rounded-2xl p-4 ${
                  isMe ? 'bg-primary/5 border-primary/10 rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}>
                  <div className="flex justify-between items-center mb-2 gap-4">
                    <span className="font-semibold text-sm">{isMe ? 'You (Master Admin)' : `${msg.sender_name} (Institute)`}</span>
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

      {/* Right Sidebar */}
      <div className="w-full md:w-80 bg-white border rounded-xl shadow-sm p-5 space-y-6 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Ticket Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <SelectField 
                value={ticket.status} 
                onChange={(val) => statusMutation.mutate(val)}
                options={[
                  { value: 'OPEN', label: 'OPEN' },
                  { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
                  { value: 'RESOLVED', label: 'RESOLVED' },
                  { value: 'CLOSED', label: 'CLOSED' }
                ]}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority</span>
              <span className="font-medium">{ticket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-medium">{ticket.category.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="font-medium">{format(new Date(ticket.created_at), 'dd MMM yyyy')}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Institute Details</h3>
          <div className="flex items-center gap-3 mb-3">
            {ticket.Institute?.institute_logo_url ? (
              <img src={ticket.Institute.institute_logo_url} className="w-10 h-10 rounded border object-contain" />
            ) : (
              <div className="w-10 h-10 rounded border bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                {ticket.Institute?.institute_name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{ticket.Institute?.institute_name}</p>
              <p className="text-xs text-slate-500">{ticket.Institute?.institute_code}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>{ticket.Institute?.institute_email}</p>
            <p>{ticket.Institute?.institute_contact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
