"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, RefreshCw, Sparkles, CheckCircle, AlertCircle, X, Image as ImageIcon } from "lucide-react";

interface ScanOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: { buyerName: string; tubesCount: number }) => void;
}

export function ScanOrderModal({ isOpen, onClose, onScanComplete }: ScanOrderModalProps) {
  const [tab, setTab] = useState<"camera" | "upload">("upload");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Results preview state
  const [extractedName, setExtractedName] = useState("");
  const [extractedCount, setExtractedCount] = useState<number | string>(1);
  const [hasScanned, setHasScanned] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when component unmounts or modal closes
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMsg("Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan atau gunakan opsi Unggah Berkas.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSelectedImage(dataUrl);
      
      // Convert dataUrl to File
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "captured-order.jpg", { type: "image/jpeg" });
          setImageFile(file);
        });

      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Harap pilih berkas gambar (.png, .jpg, .jpeg, .webp).");
        return;
      }
      setErrorMsg(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processScan = async () => {
    if (!selectedImage && !imageFile) {
      setErrorMsg("Harap ambil foto atau pilih gambar terlebih dahulu.");
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await fetch("/api/scan-order", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.success && json.data) {
        setExtractedName(json.data.buyer_name || "Pemesan Nota");
        setExtractedCount(json.data.tubes_count || 1);
        setHasScanned(true);
      } else {
        setErrorMsg(json.error || "Gagal memindai gambar.");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMsg("Terjadi kesalahan jaringan saat memproses scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    const finalCount = Number(extractedCount) || 1;
    onScanComplete({
      buyerName: extractedName || "Pemesan Nota",
      tubesCount: Math.max(1, finalCount),
    });
    onClose();
  };

  const resetState = () => {
    setSelectedImage(null);
    setImageFile(null);
    setIsScanning(false);
    setHasScanned(false);
    setExtractedName("");
    setExtractedCount(1);
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan Nota Pemesanan</h3>
              <p className="text-xs text-slate-500">Pindai foto nota/kertas pesanan secara otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!hasScanned && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
            <button
              onClick={() => {
                setTab("upload");
                stopCamera();
              }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === "upload"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Upload className="h-4 w-4" />
              Unggah Foto
            </button>
            <button
              onClick={() => {
                setTab("camera");
                startCamera();
              }}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === "camera"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Camera className="h-4 w-4" />
              Kamera Live
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!hasScanned ? (
            <>
              {tab === "camera" && (
                <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                  />
                  {!cameraActive && (
                    <div className="text-center p-6 space-y-3">
                      <Camera className="h-10 w-10 text-slate-500 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400">Menyiapkan Kamera...</p>
                      <Button size="sm" onClick={startCamera} variant="outline" className="text-xs">
                        Aktifkan Ulang Kamera
                      </Button>
                    </div>
                  )}
                  {cameraActive && (
                    <div className="absolute bottom-3 inset-x-0 flex justify-center">
                      <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 shadow-lg flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Ambil Foto
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {tab === "upload" && !selectedImage && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/20"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-500 mb-3">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Klik atau seret foto nota ke sini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Mendukung format PNG, JPG, JPEG, WEBP</p>
                </div>
              )}

              {selectedImage && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video flex items-center justify-center">
                  <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Scan Action Button */}
              {selectedImage && (
                <Button
                  onClick={processScan}
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md font-medium flex items-center justify-center gap-2 py-2.5 rounded-xl"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Memindai Gambar dengan AI Vision...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Proses & Scan Nota
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            /* Results Step */
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold">Hasil Pemindaian Otomatis Berhasil!</span>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-1.5">
                  <Label htmlFor="scan-buyer" className="text-xs text-slate-500">Nama Pembeli (Hasil OCR)</Label>
                  <Input
                    id="scan-buyer"
                    value={extractedName}
                    onChange={(e) => setExtractedName(e.target.value)}
                    placeholder="Nama Pembeli"
                    className="bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="scan-count" className="text-xs text-slate-500">Jumlah Tabung (Hasil OCR)</Label>
                  <Input
                    id="scan-count"
                    type="number"
                    min="1"
                    value={extractedCount}
                    onChange={(e) => setExtractedCount(e.target.value)}
                    className="bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setHasScanned(false)}
                  className="flex-1 text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Scan Ulang
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                >
                  Masukkan ke Form Penjualan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
