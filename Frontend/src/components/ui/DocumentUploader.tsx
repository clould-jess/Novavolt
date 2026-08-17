import React, { useCallback, useRef, useState } from 'react';
import { FileUpIcon, Loader2Icon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface DocumentUploaderProps {
  id: string;
  onUpload: (fileName: string) => void;
  accept?: string;
  className?: string;
}

/** Drag-and-drop uploader. Files are handed to the API layer — nothing is kept in the browser. */
export function DocumentUploader({ id, onUpload, accept = '.pdf,.jpg,.jpeg,.png', className }: DocumentUploaderProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setUploading(true);
      window.setTimeout(() => {
        setUploading(false);
        onUpload(file.name);
      }, 900);
    },
    [onUpload]
  );

  return (
    <div
      className={cn(
        'rounded-card border-2 border-dashed p-6 text-center transition-colors duration-200 ease-signature',
        dragging ? 'border-action bg-sky-50' : 'border-line bg-soft',
        className
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}>
      
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-action shadow-xs" aria-hidden="true">
        {uploading ? <Loader2Icon className="h-5 w-5 animate-spin-slow" /> : <FileUpIcon className="h-5 w-5" />}
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{uploading ? t('portal.uploading') : t('portal.uploadTitle')}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-2xs leading-relaxed text-muted">{t('portal.uploadBody')}</p>
      <div className="mt-4">
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} loading={uploading}>
          {t('portal.uploadCta')}
        </Button>
      </div>
      <label htmlFor={id} className="sr-only">
        {t('portal.uploadCta')}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)} />
      
    </div>);

}