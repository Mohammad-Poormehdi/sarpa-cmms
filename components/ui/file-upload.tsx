"use client";
 
import { useState, useRef, DragEvent, ChangeEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import {
  UploadCloud,
  File as FileIcon,
  Trash2,
  Loader,
  CheckCircle,
} from "lucide-react";
 
interface FileWithPreview {
  id: string;
  preview: string;
  progress: number;
  name: string;
  size: number;
  type: string;
  lastModified?: number;
  file?: File;
}

interface FileUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  description?: string;
  multiple?: boolean;
}
 
export default function FileUpload({ 
  value, 
  onChange, 
  label = "آپلود فایل", 
  description = "پشتیبانی از تصاویر، اسناد، ویدیوها و موارد دیگر", 
  multiple = false 
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedValueRef = useRef<string | undefined>(undefined);

  // Initialize files array from value if present
  useEffect(() => {
    if (value && value !== processedValueRef.current && !files.some(f => f.preview === value)) {
      processedValueRef.current = value;
      setTimeout(() => {
        setFiles(currentFiles => {
          // Double-check we haven't already added this file
          if (currentFiles.some(f => f.preview === value)) {
            return currentFiles;
          }
          return [{
            id: `${value}-${Date.now()}`,
            preview: value,
            progress: 100,
            name: value.split('/').pop() || 'image',
            size: 0,
            type: 'image/*'
          }];
        });
      }, 0);
    }
  }, [value]);
 
  // Process dropped or selected files
  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: `${URL.createObjectURL(file)}-${Date.now()}`,
      preview: URL.createObjectURL(file),
      progress: 0,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      file,
    }));
    
    // If not multiple, replace existing files
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    
    // Start upload simulation for each new file
    newFiles.forEach((f) => simulateUpload(f.id));
  };
 
  // Simulate upload progress
  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      setFiles((prev) => {
        const updatedFiles = prev.map((f) => {
          if (f.id === id) {
            return { ...f, progress: Math.min(progress, 100) };
          }
          return f;
        });
        
        // When upload completes, trigger onChange with the URL in the next tick
        if (progress >= 100 && onChange && !multiple) {
          const file = updatedFiles.find(f => f.id === id);
          if (file) {
            setTimeout(() => {
              onChange(file.preview);
            }, 0);
          }
        }
        
        return updatedFiles;
      });
      
      if (progress >= 100) {
        clearInterval(interval);
        if (navigator.vibrate) navigator.vibrate(100);
      }
    }, 300);
  };

  // Delete file handler
  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((f) => f.id !== fileId);
      // If we deleted the last file or the currently selected file
      if (onChange && (updatedFiles.length === 0 || prev.some(f => f.id === fileId && f.preview === value))) {
        setTimeout(() => {
          onChange('');
        }, 0);
      }
      return updatedFiles;
    });
  };
 
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };
 
  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
 
  const onDragLeave = () => setIsDragging(false);
 
  const onSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };
 
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 بایت";
    const k = 1024;
    const sizes = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
 
  return (
    <div className="w-full">
      {/* Drop zone */}
      <motion.div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        initial={false}
        animate={{
          borderColor: isDragging ? "#3b82f6" : "#ffffff10",
          scale: isDragging ? 1.02 : 1,
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          "relative rounded-md p-4 md:p-6 text-center cursor-pointer bg-secondary/50 border border-primary/10 shadow-sm hover:shadow-md backdrop-blur group",
          isDragging && "ring-4 ring-blue-400/30 border-blue-500",
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ y: isDragging ? [-5, 0, -5] : 0 }}
            transition={{
              duration: 1.5,
              repeat: isDragging ? Infinity : 0,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <motion.div
              animate={{
                opacity: isDragging ? [0.5, 1, 0.5] : 1,
                scale: isDragging ? [0.95, 1.05, 0.95] : 1,
              }}
              transition={{
                duration: 2,
                repeat: isDragging ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="absolute -inset-4 bg-blue-400/10 rounded-full blur-md"
              style={{ display: isDragging ? "block" : "none" }}
            />
            <UploadCloud
              className={clsx(
                "w-10 h-10 md:w-12 md:h-12 drop-shadow-sm",
                isDragging
                  ? "text-blue-500"
                  : "text-zinc-700 dark:text-zinc-300 group-hover:text-blue-500 transition-colors duration-300",
              )}
            />
          </motion.div>
 
          <div className="space-y-1">
            <h3 className="text-base md:text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {isDragging
                ? "فایل را اینجا رها کنید"
                : files.length && !multiple
                  ? "جایگزینی فایل"
                  : label}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base mx-auto">
              {isDragging ? (
                <span className="font-medium text-blue-500">
                  برای آپلود رها کنید
                </span>
              ) : (
                <>
                  فایل را اینجا بکشید و رها کنید، یا{" "}
                  <span className="text-blue-500 font-medium">انتخاب کنید</span>
                </>
              )}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
 
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            hidden
            onChange={onSelect}
            accept="image/*,application/pdf,video/*,audio/*,text/*,application/zip"
          />
        </div>
      </motion.div>
 
      {/* Uploaded files list */}
      <div className="mt-4">
        <AnimatePresence>
          {files.length > 0 && multiple && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center mb-2 px-1"
            >
              <h3 className="font-semibold text-sm md:text-base text-zinc-800 dark:text-zinc-200">
                فایل‌های آپلود شده ({files.length})
              </h3>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    if (onChange) onChange('');
                  }}
                  className="text-xs font-medium px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded-md text-zinc-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 transition-colors duration-200"
                >
                  پاک کردن همه
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
 
        <div
          className={clsx(
            "flex flex-col gap-2 overflow-y-auto pr-1",
            files.length > 3 && multiple &&
              "max-h-60 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent",
          )}
        >
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="px-3 py-2 flex items-start gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 shadow hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  {file.type.startsWith("image/") || file.preview.startsWith("http") || file.preview.startsWith("blob") ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border dark:border-zinc-700 shadow-sm"
                    />
                  ) : file.type.startsWith("video/") ? (
                    <video
                      src={file.preview}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border dark:border-zinc-700 shadow-sm"
                      controls={false}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center bg-zinc-200 dark:bg-zinc-700">
                      <FileIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                    </div>
                  )}
                  {file.progress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -right-1 -bottom-1 bg-white dark:bg-zinc-800 rounded-full shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </motion.div>
                  )}
                </div>
 
                {/* File info & progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5 w-full">
                    {/* Filename */}
                    <div className="flex items-center gap-1 min-w-0">
                      <h4
                        className="font-medium text-sm md:text-base truncate text-zinc-800 dark:text-zinc-200 text-right"
                        title={file.name}
                      >
                        {file.name}
                      </h4>
                    </div>
 
                    {/* Details & remove/loading */}
                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="text-xs">
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium text-xs">
                          {Math.round(file.progress)}%
                        </span>
                        {file.progress < 100 ? (
                          <Loader className="w-3 h-3 animate-spin text-blue-500" />
                        ) : (
                          <Trash2
                            className="w-3 h-3 cursor-pointer text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                            aria-label="حذف فایل"
                          />
                        )}
                      </span>
                    </div>
                  </div>
 
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mt-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 100,
                        ease: "easeOut",
                      }}
                      className={clsx(
                        "h-full rounded-full shadow-inner",
                        file.progress < 100 ? "bg-blue-500" : "bg-emerald-500",
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}