import React from 'react';
import { Paperclip, AlertCircle, FileText, CheckCircle } from 'lucide-react';

const AttachmentPanel = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 border-b pb-4 mb-4">
        <Paperclip className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Attachment Analysis</h2>
      </div>

      <div className="space-y-4">
        {attachments.map((attachment, index) => {
          const isDangerous = attachment.risk === 'dangerous';
          const isSuspicious = attachment.risk === 'suspicious';
          
          let badgeColor = 'bg-emerald-100 text-emerald-800';
          let Icon = FileText;

          if (isDangerous) {
            badgeColor = 'bg-rose-100 text-rose-800';
            Icon = AlertCircle;
          } else if (isSuspicious) {
            badgeColor = 'bg-amber-100 text-amber-800';
            Icon = AlertCircle;
          }

          return (
            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-shrink-0 mt-1">
                <Icon className={`h-5 w-5 ${isDangerous ? 'text-rose-500' : isSuspicious ? 'text-amber-500' : 'text-emerald-500'}`} />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">{attachment.filename || 'Unknown File'}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badgeColor}`}>
                    {attachment.risk || 'safe'}
                  </span>
                </div>
                {attachment.detail && (
                  <p className="mt-1 text-sm text-gray-600">{attachment.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentPanel;
