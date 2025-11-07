import React from "react";

type ExcelUploaderProps = {
  onBase64Loaded?: (fileName: string, base64: string) => void;
};

const ExcelUploader2: React.FC<ExcelUploaderProps> = ({ onBase64Loaded }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      // Convert ArrayBuffer → Base64
      const base64 = btoa(
        new Uint8Array(data as ArrayBuffer).reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        )
      );

      console.log("📂 File:", file.name);
      console.log("🔑 Base64:", base64);

      // Send back to parent
      onBase64Loaded(file.name, base64);
    };

    reader.readAsArrayBuffer(file); // 👈 safer than readAsBinaryString
  };

  return (
    <label className="toolbar-btn">
      <span>📂</span> Upload Excel
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </label>
  );
};

export default ExcelUploader2;
