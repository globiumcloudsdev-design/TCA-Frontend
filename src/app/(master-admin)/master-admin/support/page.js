'use client';
import { useState, useEffect } from 'react';
import { 
  LifeBuoy, MessageSquare, Phone, Ticket, Clock, CheckCircle, 
  AlertCircle, User, Building2, Send, Paperclip, Plus, Filter,
  Search, MoreVertical, X, CheckCircle2, AlertTriangle, ChevronLeft,
  Calendar, Hash, Smile
} from 'lucide-react';
import { 
  AppModal, InputField, TextareaField, FormSubmitButton, SelectField 
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SimpleTooltip } from '@/components/ui/SimpleTooltip';
import { Textarea } from '@/components/ui/textarea';

export default function SupportDeskPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [tickets, setTickets] = useState([
    { 
      id: '#T-1024', 
      subject: 'Login issue in Parent Portal', 
      institute: 'The City School', 
      status: 'Open', 
      priority: 'High', 
      time: '2 hours ago',
      lastMessage: 'Hello Support, I am unable to login...'
    },
    { 
      id: '#T-1025', 
      subject: 'Billing inquiry for April', 
      institute: 'Beaconhouse', 
      status: 'Pending', 
      priority: 'Medium', 
      time: '5 hours ago',
      lastMessage: 'Where can I download the invoice?'
    },
    { 
      id: '#T-1026', 
      subject: 'How to export attendance?', 
      institute: 'LGS', 
      status: 'Closed', 
      priority: 'Low', 
      time: '1 day ago',
      lastMessage: 'Got it, thank you!'
    },
  ]);

  useEffect(() => {
    setMounted(true);
    if (window.innerWidth >= 1024 && tickets.length > 0) {
      setSelectedTicket(tickets[0]);
    }
  }, []);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    toast.success('Ticket Created (Dummy)');
    setShowCreateModal(false);
  };

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Support Desk
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">Manage institute queries and support tickets.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="hidden lg:flex rounded-xl">
            <Phone className="w-4 h-4 mr-2 text-emerald-500" /> WhatsApp Settings
          </Button>
          <Button onClick={() => setShowCreateModal(true)} variant="default" className="flex-1 sm:flex-none shadow-lg shadow-primary/20 rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Open Ticket
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        {/* Tickets List */}
        <div className={`${selectedTicket ? 'hidden lg:flex' : 'flex'} w-full lg:w-[380px] bg-white rounded-3xl border border-slate-200 overflow-hidden flex-col shadow-sm transition-all duration-300`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
                <Ticket className="w-4 h-4 text-primary" />
                Active Tickets
              </h3>
              <Badge variant="secondary" className="bg-white border-slate-200 text-slate-600 text-[10px]">38 Total</Badge>
            </div>
            {/* Standard Search Bar using InputField */}
            <div className="relative">
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" /> */}
              <InputField 
                placeholder="Search tickets..." 
                className="w-full space-y-0"
                inputClassName="pl-10 rounded-xl bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-2xl transition-all border group relative ${
                  selectedTicket?.id === ticket.id 
                  ? 'border-primary bg-primary/[0.03] shadow-sm' 
                  : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {ticket.id.replace('#', '')}
                  </span>
                  <Badge className={
                    ticket.priority === 'High' ? 'bg-red-500 text-white border-none text-[10px] h-5' : 
                    ticket.priority === 'Medium' ? 'bg-amber-500 text-white border-none text-[10px] h-5' : 
                    'bg-slate-500 text-white border-none text-[10px] h-5'
                  }>
                    {ticket.priority}
                  </Badge>
                </div>
                <h5 className={`font-bold text-sm truncate ${selectedTicket?.id === ticket.id ? 'text-primary' : 'text-slate-900'}`}>
                  {ticket.subject}
                </h5>
                <p className="text-[11px] text-slate-500 truncate mt-1">{ticket.lastMessage}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium"><Building2 className="w-3 h-3" /> {ticket.institute}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{ticket.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation View */}
        <div className={`${selectedTicket ? 'flex' : 'hidden lg:flex'} flex-1 bg-white rounded-3xl border border-slate-200 overflow-hidden flex-col shadow-sm transition-all duration-300 relative`}>
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden rounded-full h-8 w-8 shrink-0"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-inner shrink-0">
                    {selectedTicket.id.split('-')[1][0]}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 text-xs md:text-sm truncate">
                      <span className="truncate">{selectedTicket.subject}</span>
                      <Badge variant="outline" className="hidden sm:inline-flex text-[9px] rounded-full border-primary text-primary bg-primary/5 px-1.5 h-4">{selectedTicket.status}</Badge>
                    </h4>
                    <p className="text-[9px] md:text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <User className="w-2.5 h-2.5 text-primary shrink-0" /> Ahmed Khan ({selectedTicket.institute})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                   <div className="hidden sm:flex gap-1 mr-1">
                     <Button variant="outline" size="sm" className="h-7 text-[9px] border-emerald-100 text-emerald-600 hover:bg-emerald-50 rounded-lg px-2">
                       <CheckCircle2 className="w-3 h-3 mr-1" /> Resolve
                     </Button>
                   </div>
                  <SimpleTooltip content="Ticket Actions">
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
                  </SimpleTooltip>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
                <div className="flex justify-center mb-2">
                  <span className="bg-white border border-slate-100 text-slate-400 text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">Today</span>
                </div>

                {/* User Message */}
                <div className="flex gap-3 max-w-[90%] md:max-w-xl animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shrink-0 flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase shadow-sm">AK</div>
                  <div className="space-y-1">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-xs text-slate-700 leading-relaxed">
                      {selectedTicket.lastMessage}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 ml-1">
                      <span>10:45 AM</span>
                    </div>
                  </div>
                </div>

                {/* HQ Reply */}
                <div className="flex flex-row-reverse gap-3 max-w-[90%] md:max-w-xl ml-auto text-right animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="w-7 h-7 rounded-full bg-primary shrink-0 flex items-center justify-center text-[9px] text-white font-bold shadow-md shadow-primary/20">HQ</div>
                  <div className="space-y-1">
                    <div className="bg-primary p-3 rounded-2xl rounded-tr-none text-white shadow-xl shadow-primary/10 text-xs leading-relaxed">
                      Hi Ahmed! We are looking into this. Please share the student GR number for reference. We will fix it ASAP.
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 mr-1 justify-end">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>11:12 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Input Area */}
              <div className="p-2 md:p-3 border-t border-slate-100 bg-white z-10 shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1 border border-slate-200 focus-within:border-primary/50 focus-within:bg-white transition-all">
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-primary h-9 w-9 shrink-0"><Paperclip className="w-4 h-4" /></Button>
                  
                  <div className="flex-1">
                    <Textarea 
                      placeholder="Type your message..." 
                      className="w-full bg-transparent border-none focus-visible:ring-0 text-xs p-2 min-h-[40px] max-h-[120px] resize-none text-slate-700 leading-tight shadow-none"
                      rows={1}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1 pr-1">
                    <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full text-slate-400 hover:text-primary h-8 w-8 shrink-0"><Smile className="w-4 h-4" /></Button>
                    <Button variant="default" className="h-9 w-9 rounded-xl shadow-lg shadow-primary/20 p-0 shrink-0 group">
                      <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-12 bg-slate-50/50">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-xl shadow-slate-200/50 border border-slate-100 relative">
                <Ticket className="w-8 h-8 text-slate-200" />
                <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Support Workspace</h3>
              <p className="text-slate-500 mt-1 max-w-sm text-xs">Select a ticket to start assisting our institutes.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- CREATE TICKET MODAL --- */}
      <AppModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Open Support Ticket"
        footer={
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <FormSubmitButton form="support-ticket-form" label="Create Ticket" className="flex-1 rounded-xl" />
          </div>
        }
      >
        <form id="support-ticket-form" onSubmit={handleCreateTicket} className="space-y-4">
          <SelectField 
            label="Institute" 
            required 
            options={[
              { label: 'The City School', value: '1' },
              { label: 'Beaconhouse', value: '2' },
              { label: 'LGS', value: '3' }
            ]} 
            placeholder="Select institute..."
          />
          <InputField label="Ticket Subject" required placeholder="e.g. Portal Login Error" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField 
              label="Priority" 
              defaultValue="medium"
              options={[
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' }
              ]} 
            />
             <SelectField 
              label="Assign To" 
              options={[
                { label: 'Unassigned', value: '' },
                { label: 'Support Team A', value: 'a' },
                { label: 'Technical Lead', value: 'tech' }
              ]} 
              placeholder="Select assignee..."
            />
          </div>
          <TextareaField label="Initial Message" required rows={4} placeholder="Describe the issue in detail..." />
        </form>
      </AppModal>
    </div>
  );
}
