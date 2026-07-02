import React from 'react';
import { Briefcase, Building, MapPin, Clock, Calendar, CheckCircle, Upload, MessageSquare, ChevronRight, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const CandidateWorkspace: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden w-full items-center p-8">
      
      <div className="w-full max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Application</h1>
            <p className="text-sm text-slate-500 mt-1">Track your progress and communicate with the AI Recruiter.</p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-700">RS</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold text-slate-800">Rahul Sharma</p>
              <p className="text-xs text-slate-500">Candidate</p>
            </div>
          </div>
        </div>

        {/* Job Details Card */}
        <Card className="p-6 border-none shadow-sm bg-white">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border">
                <Building className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Senior Java Developer</h2>
                <p className="text-sm text-slate-500 font-medium">Acme Corp Ltd.</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                    <MapPin className="w-3 h-3" /> Bangalore
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                    <Briefcase className="w-3 h-3" /> Full-time
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> Applied 2 days ago
                  </span>
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200">
              Active
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          
          {/* Main Track - Application Flow */}
          <div className="col-span-2 space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Application Timeline</h3>
            
            <Card className="p-6 border-none shadow-sm bg-white">
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-0 md:before:translate-x-[1.125rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-slate-200 before:to-transparent">
                
                {/* Step 1: Applied */}
                <div className="relative flex gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow-sm z-10 shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-slate-800">Application Submitted</h4>
                    <p className="text-sm text-slate-500 mt-1">Your resume and portfolio were successfully received.</p>
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Upload className="w-4 h-4" />
                        <span className="font-medium text-slate-700">rahul_resume_2024.pdf</span>
                      </div>
                      <span className="text-xs text-slate-400">View</span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Technical Assessment */}
                <div className="relative flex gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow-sm z-10 shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-slate-800">Technical Assessment</h4>
                    <p className="text-sm text-slate-500 mt-1">Completed online coding challenge.</p>
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Score: 92% (Passed)
                    </div>
                  </div>
                </div>

                {/* Step 3: Interview (Current) */}
                <div className="relative flex gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#5c22ff] text-white shadow-sm z-10 shrink-0 ring-4 ring-[#5c22ff]/20">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-slate-800">Final Interview</h4>
                    <p className="text-sm text-slate-500 mt-1">Schedule your final interview with the engineering team.</p>
                    
                    <div className="mt-4 bg-[#5c22ff]/5 border border-[#5c22ff]/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-slate-800 mb-3">Available Slots</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-xs">Tomorrow, 10:00 AM</Button>
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-xs">Tomorrow, 2:00 PM</Button>
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-xs">Oct 24, 11:30 AM</Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: Offer (Pending) */}
                <div className="relative flex gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-400 shadow-sm z-10 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-semibold text-slate-400">Offer</h4>
                    <p className="text-sm text-slate-400 mt-1">Awaiting interview completion.</p>
                  </div>
                </div>

              </div>
            </Card>
          </div>

          {/* Sidebar - AI Recruiter Chat */}
          <div className="col-span-1 space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">AI Recruiter Chat</h3>
            
            <Card className="flex flex-col h-[500px] border-none shadow-sm bg-white overflow-hidden">
              <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#5c22ff] text-white"><Sparkles className="w-4 h-4"/></AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Chatr AI</h4>
                  <p className="text-[10px] text-emerald-600 font-medium">Online</p>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-2 max-w-[85%]">
                  <Avatar className="w-6 h-6 shrink-0 mt-1">
                    <AvatarFallback className="bg-[#5c22ff] text-white"><Sparkles className="w-3 h-3"/></AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 p-3 rounded-xl rounded-tl-sm text-sm text-slate-700">
                    Hi Rahul! Congratulations on passing the technical assessment with a stellar 92%. The hiring manager is impressed.
                  </div>
                </div>
                <div className="flex gap-2 max-w-[85%]">
                  <Avatar className="w-6 h-6 shrink-0 mt-1">
                    <AvatarFallback className="bg-[#5c22ff] text-white"><Sparkles className="w-3 h-3"/></AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 p-3 rounded-xl rounded-tl-sm text-sm text-slate-700">
                    Please select a slot from the timeline for your final interview. If you need preparation materials, just ask!
                  </div>
                </div>
              </div>

              <div className="p-3 border-t bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5c22ff]/50"
                  />
                  <button className="absolute right-2 top-1.5 w-7 h-7 bg-[#5c22ff] text-white rounded-full flex items-center justify-center hover:bg-[#4b1ac4]">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};
