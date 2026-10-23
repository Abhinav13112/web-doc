import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCode,
  FileArchive,
  FileQuestion,
  Presentation,
  FileCheck
} from 'lucide-react';

export function FileIcon({ category, ext, className = "w-6 h-6" }) {
  const normalizedCategory = category?.toLowerCase();
  const normalizedExt = ext?.toLowerCase()?.replace('.', '');

  switch (normalizedCategory) {
    case 'pdf':
      return <FileText className={`${className} text-rose-500`} />;
    case 'word':
      return <FileText className={`${className} text-blue-500`} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={`${className} text-emerald-500`} />;
    case 'presentation':
      return <Presentation className={`${className} text-amber-500`} />;
    case 'image':
      return <FileImage className={`${className} text-purple-500`} />;
    case 'text':
      return <FileCode className={`${className} text-cyan-500`} />;
    case 'archive':
      return <FileArchive className={`${className} text-yellow-500`} />;
    default:
      if (['doc', 'docx'].includes(normalizedExt)) {
        return <FileText className={`${className} text-blue-500`} />;
      }
      if (['xls', 'xlsx', 'csv'].includes(normalizedExt)) {
        return <FileSpreadsheet className={`${className} text-emerald-500`} />;
      }
      return <FileQuestion className={`${className} text-slate-400`} />;
  }
}

export default FileIcon;
