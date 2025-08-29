import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import styles from "./ImageUploader.module.css";

interface ImageUploaderProps {
  multiple?: boolean;
  initialFiles?: File[];
  onChange: (files: File[]) => void;
}

const ImageUploader = ({
  multiple = false,
  initialFiles = [],
  onChange,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [previews, setPreviews] = useState<string[]>([]);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  useEffect(() => {
    const objectUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);

    let updatedFiles: File[];

    if (replaceIndex !== null) {
      // Reemplazo de un archivo
      updatedFiles = [...files];
      updatedFiles[replaceIndex] = newFiles[0];
      setReplaceIndex(null); // Resetear el índice de reemplazo
    } else {
      // Agregado de nuevos archivos
      updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    }

    setFiles(updatedFiles);
    onChange(updatedFiles);

    // Limpia el input para permitir volver a subir el mismo archivo
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
    onChange(updated);
  };

  const handleReplace = (index: number) => {
    setReplaceIndex(index);
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.wrapper}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple && replaceIndex === null}
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      <button
        type="button"
        onClick={() => {
          setReplaceIndex(null); // modo: añadir
          fileInputRef.current?.click();
        }}
        className={styles.uploadButton}
      >
        {multiple ? "Add Images" : files.length ? "Change Image" : "Upload Image"}
      </button>
      <div className={styles.wrapper}>
        <div className={styles.previewContainer}>
          {previews.map((url, index) => (
            <div key={index} className={styles.imageBox}>
              <img src={url} alt={`preview-${index}`} className={styles.image} />
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemove(index)}
                >
                  <X size={14} />
                </button>
                {multiple && (
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => handleReplace(index)}
                  >
                    ✎
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {files.length === 0 && (
          <div className={styles.emptyMessage}>
            No images selected.
          </div>
        )}
      </div>
    </div>
  );
};


export default ImageUploader;
