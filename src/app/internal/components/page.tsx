"use client";

import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { FileUpload, FilePreviewModal } from "@/components/ui/file-upload";
import type { FileUploadFile } from "@/components/ui/file-upload";
import { Input, Textarea } from "@/components/ui/input";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { RichEditor } from "@/components/ui/rich-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Stepper } from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  Pagination,
} from "@/components/ui/table";

export default function InternalComponentsPage() {
  const [previewFile, setPreviewFile] = useState<FileUploadFile | null>(null);

  return (
    <div className="min-h-screen bg-neutral-50 p-8 text-neutral-900">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Component Library
          </h1>
          <p className="mt-2 text-neutral-600">
            Internal design system — hanya tampil di development.
          </p>
        </div>

        {/* ==================== COLOR PALETTE ==================== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Color Palette
          </h2>

          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">
              Brand (Primary)
            </h3>
            <p className="text-sm text-neutral-600">
              Warna identitas brand. Untuk rebranding, ganti section BRAND COLOR
              PALETTE di <code className="text-primary-700 bg-primary-50 px-1 rounded">globals.css</code>.
            </p>
            <div className="grid grid-cols-11 gap-2">
              <ColorSwatch color="bg-brand-50" label="50" hex="#EAF4F9" />
              <ColorSwatch color="bg-brand-100" label="100" hex="#D6E8F3" />
              <ColorSwatch color="bg-brand-200" label="200" hex="#ACD1E8" />
              <ColorSwatch color="bg-brand-300" label="300" hex="#83BADC" />
              <ColorSwatch color="bg-brand-400" label="400" hex="#59A3D1" />
              <ColorSwatch color="bg-brand-500" label="500" hex="#308CC5" primary />
              <ColorSwatch color="bg-brand-600" label="600" hex="#26709E" dark />
              <ColorSwatch color="bg-brand-700" label="700" hex="#1D5476" dark />
              <ColorSwatch color="bg-brand-800" label="800" hex="#13384F" dark />
              <ColorSwatch color="bg-brand-900" label="900" hex="#0A1C27" dark />
              <ColorSwatch color="bg-brand-950" label="950" hex="#050E14" dark />
            </div>
          </div>

          {/* Neutral */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Neutral</h3>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-neutral-50" label="50" hex="#F8F9FA" />
              <ColorSwatch color="bg-neutral-100" label="100" hex="#F1F3F5" />
              <ColorSwatch color="bg-neutral-200" label="200" hex="#E9ECEF" />
              <ColorSwatch color="bg-neutral-300" label="300" hex="#DEE2E6" />
              <ColorSwatch color="bg-neutral-400" label="400" hex="#CED4DA" />
              <ColorSwatch color="bg-neutral-500" label="500" hex="#ADB5BD" />
              <ColorSwatch color="bg-neutral-600" label="600" hex="#868E96" dark />
              <ColorSwatch color="bg-neutral-700" label="700" hex="#495057" dark />
              <ColorSwatch color="bg-neutral-800" label="800" hex="#343A40" dark />
              <ColorSwatch color="bg-neutral-900" label="900" hex="#212529" dark />
            </div>
          </div>

          {/* Success */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Success</h3>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-success-50" label="50" hex="#E6F9F0" />
              <ColorSwatch color="bg-success-100" label="100" hex="#C3F0DA" />
              <ColorSwatch color="bg-success-200" label="200" hex="#86E0B5" />
              <ColorSwatch color="bg-success-300" label="300" hex="#4CD19B" />
              <ColorSwatch color="bg-success-400" label="400" hex="#2EBD85" />
              <ColorSwatch color="bg-success-500" label="500" hex="#12B76A" dark />
              <ColorSwatch color="bg-success-600" label="600" hex="#0E9956" dark />
              <ColorSwatch color="bg-success-700" label="700" hex="#0A7B42" dark />
              <ColorSwatch color="bg-success-800" label="800" hex="#065C30" dark />
              <ColorSwatch color="bg-success-900" label="900" hex="#033D1F" dark />
            </div>
          </div>

          {/* Warning */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Warning</h3>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-warning-50" label="50" hex="#FFFBE6" />
              <ColorSwatch color="bg-warning-100" label="100" hex="#FFF3B3" />
              <ColorSwatch color="bg-warning-200" label="200" hex="#FFEB80" />
              <ColorSwatch color="bg-warning-300" label="300" hex="#FFE04D" />
              <ColorSwatch color="bg-warning-400" label="400" hex="#FFD426" />
              <ColorSwatch color="bg-warning-500" label="500" hex="#F5C400" />
              <ColorSwatch color="bg-warning-600" label="600" hex="#CCA300" dark />
              <ColorSwatch color="bg-warning-700" label="700" hex="#997A00" dark />
              <ColorSwatch color="bg-warning-800" label="800" hex="#665200" dark />
              <ColorSwatch color="bg-warning-900" label="900" hex="#332900" dark />
            </div>
          </div>

          {/* Error */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Error</h3>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-error-50" label="50" hex="#FEF2F2" />
              <ColorSwatch color="bg-error-100" label="100" hex="#FEE2E2" />
              <ColorSwatch color="bg-error-200" label="200" hex="#FECACA" />
              <ColorSwatch color="bg-error-300" label="300" hex="#FCA5A5" />
              <ColorSwatch color="bg-error-400" label="400" hex="#F87171" />
              <ColorSwatch color="bg-error-500" label="500" hex="#EF4444" dark />
              <ColorSwatch color="bg-error-600" label="600" hex="#DC2626" dark />
              <ColorSwatch color="bg-error-700" label="700" hex="#B91C1C" dark />
              <ColorSwatch color="bg-error-800" label="800" hex="#991B1B" dark />
              <ColorSwatch color="bg-error-900" label="900" hex="#7F1D1D" dark />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Info</h3>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-info-50" label="50" hex="#E5FAFE" />
              <ColorSwatch color="bg-info-100" label="100" hex="#B3F0FC" />
              <ColorSwatch color="bg-info-200" label="200" hex="#80E6FA" />
              <ColorSwatch color="bg-info-300" label="300" hex="#4DDCF7" />
              <ColorSwatch color="bg-info-400" label="400" hex="#26D4F5" />
              <ColorSwatch color="bg-info-500" label="500" hex="#06B6D4" dark />
              <ColorSwatch color="bg-info-600" label="600" hex="#0597B0" dark />
              <ColorSwatch color="bg-info-700" label="700" hex="#04788C" dark />
              <ColorSwatch color="bg-info-800" label="800" hex="#035A69" dark />
              <ColorSwatch color="bg-info-900" label="900" hex="#023B45" dark />
            </div>
          </div>

          {/* Extended */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">
              Extended (Orange, Purple, Pink, Teal)
            </h3>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-orange-50" label="O-50" hex="#FFF4E6" />
              <ColorSwatch color="bg-orange-200" label="O-200" hex="#FFCC80" />
              <ColorSwatch color="bg-orange-500" label="O-500" hex="#FF9800" />
              <ColorSwatch color="bg-orange-700" label="O-700" hex="#CC7A00" dark />
              <ColorSwatch color="bg-orange-900" label="O-900" hex="#663D00" dark />
              <ColorSwatch color="bg-purple-50" label="P-50" hex="#F3E8FF" />
              <ColorSwatch color="bg-purple-200" label="P-200" hex="#C9A3FF" />
              <ColorSwatch color="bg-purple-500" label="P-500" hex="#8B5CF6" dark />
              <ColorSwatch color="bg-purple-700" label="P-700" hex="#6D28D9" dark />
              <ColorSwatch color="bg-purple-900" label="P-900" hex="#4C1D95" dark />
            </div>
            <div className="grid grid-cols-10 gap-2">
              <ColorSwatch color="bg-pink-50" label="Pk-50" hex="#FDF2F8" />
              <ColorSwatch color="bg-pink-200" label="Pk-200" hex="#FBCFE8" />
              <ColorSwatch color="bg-pink-500" label="Pk-500" hex="#EC4899" dark />
              <ColorSwatch color="bg-pink-700" label="Pk-700" hex="#BE185D" dark />
              <ColorSwatch color="bg-pink-900" label="Pk-900" hex="#831843" dark />
              <ColorSwatch color="bg-teal-50" label="T-50" hex="#E6FFFA" />
              <ColorSwatch color="bg-teal-200" label="T-200" hex="#81E6D9" />
              <ColorSwatch color="bg-teal-500" label="T-500" hex="#2DD4BF" />
              <ColorSwatch color="bg-teal-700" label="T-700" hex="#0F766E" dark />
              <ColorSwatch color="bg-teal-900" label="T-900" hex="#134E4A" dark />
            </div>
          </div>
        </section>

        {/* ==================== TYPOGRAPHY ==================== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Typography — Onest
          </h2>

          <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">
              Font Family: Onest (Google Fonts)
            </p>
            <div className="space-y-3">
              <p className="text-4xl font-bold text-neutral-900">Heading 1 — Bold 36px</p>
              <p className="text-3xl font-semibold text-neutral-900">Heading 2 — Semibold 30px</p>
              <p className="text-2xl font-semibold text-neutral-900">Heading 3 — Semibold 24px</p>
              <p className="text-xl font-medium text-neutral-800">Heading 4 — Medium 20px</p>
              <p className="text-lg font-medium text-neutral-800">Heading 5 — Medium 18px</p>
              <p className="text-base text-neutral-700">Body — Regular 16px</p>
              <p className="text-sm text-neutral-700">Small — Regular 14px</p>
              <p className="text-xs text-neutral-700">Caption — Regular 12px</p>
            </div>
            <div className="mt-4 border-t border-neutral-200 pt-4 space-y-2">
              <p className="text-sm text-neutral-600">Font weights:</p>
              <p className="font-light text-neutral-900">Light (300)</p>
              <p className="font-normal text-neutral-900">Regular (400)</p>
              <p className="font-medium text-neutral-900">Medium (500)</p>
              <p className="font-semibold text-neutral-900">Semibold (600)</p>
              <p className="font-bold text-neutral-900">Bold (700)</p>
              <p className="font-extrabold text-neutral-900">Extrabold (800)</p>
            </div>
          </div>
        </section>

        {/* ==================== COMPONENTS ==================== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Components</h2>

          {/* Accordion */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Accordion</h3>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
              <p className="text-sm text-neutral-500 mb-4">
                Type: <code>single</code> (satu item terbuka) atau <code>multiple</code> (banyak item terbuka)
              </p>

              <div className="rounded-lg border border-neutral-200">
                <Accordion type="single" defaultValue={["item-2"]}>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Apa itu Boiraa?</AccordionTrigger>
                    <AccordionContent>
                      Boiraa adalah boilerplate Next.js dengan arsitektur
                      berlapis, design system, dan aturan agent yang siap pakai.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Bagaimana cara mendaftar?</AccordionTrigger>
                    <AccordionContent>
                      Answer the frequently asked question in a simple sentence, a
                      longish paragraph, or even in a list.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Apakah ada biaya?</AccordionTrigger>
                    <AccordionContent>
                      Tidak, platform ini gratis untuk semua peserta yang terdaftar
                      melalui program pemerintah.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Badge</h3>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-6">
              <Badge variant="brand">Label</Badge>
              <Badge variant="warning">Label</Badge>
              <Badge variant="info">Label</Badge>
              <Badge variant="default">Label</Badge>
              <Badge variant="error">Label</Badge>
            </div>
          </div>

          {/* Checkbox */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Checkbox</h3>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-6">
              {/* Fill variant */}
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Fill</p>
                <div className="flex items-center gap-6">
                  <Checkbox variant="fill" checked="checked" label="Checked" />
                  <Checkbox variant="fill" checked="unchecked" label="Unchecked" />
                  <Checkbox variant="fill" checked="indeterminate" label="Indeterminate" />
                </div>
                <div className="flex items-center gap-6">
                  <Checkbox variant="fill" checked="checked" disabled label="Disabled checked" />
                  <Checkbox variant="fill" checked="unchecked" disabled label="Disabled unchecked" />
                  <Checkbox variant="fill" checked="indeterminate" disabled label="Disabled indeterminate" />
                </div>
              </div>
              {/* Outline variant */}
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Outline</p>
                <div className="flex items-center gap-6">
                  <Checkbox variant="outline" checked="checked" label="Checked" />
                  <Checkbox variant="outline" checked="unchecked" label="Unchecked" />
                  <Checkbox variant="outline" checked="indeterminate" label="Indeterminate" />
                </div>
                <div className="flex items-center gap-6">
                  <Checkbox variant="outline" checked="checked" disabled label="Disabled checked" />
                  <Checkbox variant="outline" checked="unchecked" disabled label="Disabled unchecked" />
                  <Checkbox variant="outline" checked="indeterminate" disabled label="Disabled indeterminate" />
                </div>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Radio</h3>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Enable</p>
                <div className="flex items-center gap-6">
                  <Radio checked label="Checked" />
                  <Radio checked={false} label="Unchecked" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Disabled</p>
                <div className="flex items-center gap-6">
                  <Radio checked disabled label="Checked" />
                  <Radio checked={false} disabled label="Unchecked" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Radio Group</p>
                <RadioGroup
                  direction="horizontal"
                  value="mastercard"
                  options={[
                    { label: "Mastercard", value: "mastercard" },
                    { label: "Visa", value: "visa" },
                    { label: "PayPal", value: "paypal" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Switch */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Switch</h3>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Fill</p>
                <div className="flex items-center gap-6">
                  <Switch variant="fill" checked label="Checked" />
                  <Switch variant="fill" checked={false} label="Unchecked" />
                </div>
                <div className="flex items-center gap-6">
                  <Switch variant="fill" checked disabled label="Disabled on" />
                  <Switch variant="fill" checked={false} disabled label="Disabled off" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Outline</p>
                <div className="flex items-center gap-6">
                  <Switch variant="outline" checked label="Checked" />
                  <Switch variant="outline" checked={false} label="Unchecked" />
                </div>
                <div className="flex items-center gap-6">
                  <Switch variant="outline" checked disabled label="Disabled on" />
                  <Switch variant="outline" checked={false} disabled label="Disabled off" />
                </div>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Input & Textarea</h3>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white p-6 md:grid-cols-2">
              <Input label="Nama Lengkap" placeholder="Masukkan nama" id="demo-name" />
              <Input label="Email" placeholder="email@contoh.com" type="email" id="demo-email" hint="Gunakan email aktif" />
              <Input label="Password" placeholder="••••••••" type="password" id="demo-pass" error="Password minimal 8 karakter" />
              <Input label="Disabled" placeholder="Tidak bisa diisi" disabled id="demo-disabled" />
              <div className="md:col-span-2">
                <Textarea label="Deskripsi" placeholder="Tulis deskripsi..." id="demo-desc" rows={3} maxLength={50} />
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Rich Text Editor</h3>
            <div className="space-y-6 rounded-xl border border-neutral-200 bg-white p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <RichEditor
                  label="Default"
                  placeholder="Tulis konten di sini..."
                />
                <RichEditor
                  label="Error"
                  placeholder="Tulis konten di sini..."
                  error="Konten wajib diisi"
                />
              </div>
              <RichEditor
                label="Disabled"
                placeholder="Editor tidak aktif"
                disabled
              />
            </div>
          </div>

          {/* Card */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Card</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardDescription>
                  Ini adalah contoh card dengan header dan deskripsi. Digunakan untuk
                  menampilkan konten yang terstruktur.
                </CardDescription>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Statistik</CardTitle>
                </CardHeader>
                <p className="text-3xl font-bold text-primary-600">1,234</p>
                <p className="text-sm text-neutral-500 mt-1">Total peserta aktif</p>
              </Card>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Date Picker</h3>
            <div className="flex flex-wrap gap-6 rounded-xl border border-neutral-200 bg-white p-6">
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Single Date</p>
                <DatePicker
                  mode="single"
                  size="sm"
                  value={new Date(2024, 11, 7)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Range Date</p>
                <DatePicker
                  mode="range"
                  size="sm"
                  startDate={new Date(2024, 11, 7)}
                  endDate={new Date(2024, 11, 10)}
                />
              </div>
            </div>
          </div>

          {/* File Format Icons */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">File Format Icons</h3>
            <p className="text-sm text-neutral-600">
              Icon dari <code className="bg-neutral-100 px-1 rounded text-xs">public/icon/</code> — digunakan di FileUpload sebagai thumbnail berdasarkan ekstensi file.
            </p>
            <div className="flex flex-wrap gap-6 rounded-xl border border-neutral-200 bg-white p-6">
              {[
                { name: "XLS", src: "/icon/xls.svg" },
                { name: "JPG", src: "/icon/jpg.svg" },
                { name: "URL", src: "/icon/url.svg" },
                { name: "PDF", src: "/icon/pdf.svg" },
                { name: "TXT", src: "/icon/txt.svg" },
                { name: "DOCX", src: "/icon/docx.svg" },
                { name: "CSV", src: "/icon/csv.svg" },
                { name: "PNG", src: "/icon/png.svg" },
              ].map((icon) => (
                <div key={icon.name} className="flex flex-col items-center gap-2">
                  {/* SVG in /public — next/image would require dangerouslyAllowSVG */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon.src} alt={icon.name} className="h-10 w-8 object-contain" />
                  <span className="text-xs font-medium text-neutral-600">{icon.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">File Upload</h3>
            <div className="grid grid-cols-1 gap-6 rounded-xl border border-neutral-200 bg-white p-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Single File (Image)</p>
                <FileUpload
                  label="Foto Profil"
                  accept="image/jpeg,image/png,image/webp"
                  maxSize={1 * 1024 * 1024}
                  onPreview={(file) => setPreviewFile(file)}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Multiple Files</p>
                <FileUpload
                  label="Dokumen Pendukung"
                  multiple
                  maxFiles={3}
                  accept="image/jpeg,image/png,.pdf"
                  maxSize={5 * 1024 * 1024}
                  description="JPEG, PNG, PDF maksimal 5 MB (maks 3 file)"
                  onPreview={(file) => setPreviewFile(file)}
                />
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">
              Loading Indicator
            </h3>
            <div className="flex items-center gap-6 rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex flex-col items-center gap-2">
                <LoadingIndicator size="sm" />
                <span className="text-xs text-neutral-500">Small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingIndicator size="md" />
                <span className="text-xs text-neutral-500">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <LoadingIndicator size="lg" />
                <span className="text-xs text-neutral-500">Large</span>
              </div>
            </div>
          </div>

          {/* Skeleton */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Skeleton</h3>
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
          </div>

          {/* Table & Pagination */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Table & Pagination</h3>
            <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
              <Table className="rounded-none border-0">
                <TableHead>
                  <TableRow>
                    <TableHeadCell>ID</TableHeadCell>
                    <TableHeadCell>Judul</TableHeadCell>
                    <TableHeadCell>Tipe</TableHeadCell>
                    <TableHeadCell>Parameter</TableHeadCell>
                    <TableHeadCell>Batas Kelulusan</TableHeadCell>
                    <TableHeadCell>Penggunaan</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>TGS-CE-01</TableCell>
                    <TableCell>Action Plan Korda</TableCell>
                    <TableCell>Tugas</TableCell>
                    <TableCell>15 Soal (45 Menit)</TableCell>
                    <TableCell>Skor Minimal 80 pt</TableCell>
                    <TableCell>4 Pelatihan</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TS-CE-01</TableCell>
                    <TableCell>Rencana Aksi Bisnis</TableCell>
                    <TableCell>Tugas</TableCell>
                    <TableCell>15 Soal (45 Menit)</TableCell>
                    <TableCell>Skor Minimal 80 pt</TableCell>
                    <TableCell>4 Pelatihan</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TS-CTD-01</TableCell>
                    <TableCell>Pembuatan Portofoli...</TableCell>
                    <TableCell>Tugas</TableCell>
                    <TableCell>15 Soal (45 Menit)</TableCell>
                    <TableCell>Skor Minimal 80 pt</TableCell>
                    <TableCell>4 Pelatihan</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Pagination
                page={1}
                lastPage={2}
                total={200}
                perPage={5}
              />
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">Stepper</h3>
            <div className="space-y-8 rounded-xl border border-neutral-200 bg-white p-6">
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Step 1 aktif (awal)</p>
                <Stepper
                  currentStep={0}
                  steps={[
                    { title: "Data Diri", caption: "Informasi pribadi" },
                    { title: "Dokumen", caption: "Upload berkas" },
                    { title: "Konfirmasi", caption: "Review data" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Step 2 aktif (tengah)</p>
                <Stepper
                  currentStep={1}
                  steps={[
                    { title: "Data Diri", caption: "Informasi pribadi" },
                    { title: "Dokumen", caption: "Upload berkas" },
                    { title: "Konfirmasi", caption: "Review data" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-500">Step 3 aktif (selesai semua)</p>
                <Stepper
                  currentStep={2}
                  steps={[
                    { title: "Data Diri", caption: "Informasi pribadi" },
                    { title: "Dokumen", caption: "Upload berkas" },
                    { title: "Konfirmasi", caption: "Review data" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Buttons (showcase tanpa component, pakai native) */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-neutral-800">
              Button Styles (Tailwind)
            </h3>
            <div className="flex flex-wrap gap-3 rounded-xl border border-neutral-200 bg-white p-6">
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-colors">
                Primary
              </button>
              <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-primary-100 transition-colors">
                Secondary
              </button>
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                Outline
              </button>
              <button className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-error-700 transition-colors">
                Destructive
              </button>
              <button className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-success-foreground hover:bg-success-600 transition-colors">
                Success
              </button>
              <button className="rounded-lg px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors">
                Ghost
              </button>
              <button className="rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-500 cursor-not-allowed" disabled>
                Disabled
              </button>
            </div>
          </div>
        </section>

        {/* ==================== SEMANTIC TOKENS ==================== */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Semantic Tokens
          </h2>
          <p className="text-sm text-neutral-600">
            Token-token ini reference ke brand palette. Ganti brand = semua ikut berubah.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <SemanticSwatch label="primary" bgClass="bg-primary" textClass="text-primary-foreground" />
            <SemanticSwatch label="primary-light" bgClass="bg-primary-light" textClass="text-white" />
            <SemanticSwatch label="primary-dark" bgClass="bg-primary-dark" textClass="text-white" />
            <SemanticSwatch label="secondary" bgClass="bg-secondary" textClass="text-secondary-foreground" />
            <SemanticSwatch label="accent" bgClass="bg-accent" textClass="text-accent-foreground" />
            <SemanticSwatch label="muted" bgClass="bg-muted" textClass="text-muted-foreground" />
            <SemanticSwatch label="destructive" bgClass="bg-destructive" textClass="text-destructive-foreground" />
            <SemanticSwatch label="success" bgClass="bg-success" textClass="text-success-foreground" />
            <SemanticSwatch label="warning" bgClass="bg-warning" textClass="text-warning-foreground" />
            <SemanticSwatch label="info" bgClass="bg-info" textClass="text-info-foreground" />
            <SemanticSwatch label="card" bgClass="bg-card" textClass="text-card-foreground" border />
            <SemanticSwatch label="sidebar" bgClass="bg-sidebar" textClass="text-sidebar-foreground" border />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
          <p>🔒 Page ini hanya tersedia di <code>NODE_ENV=development</code></p>
          <p className="mt-1">
            Akses: <code>http://localhost:3000/internal/components</code>
          </p>
        </footer>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

/* ==================== HELPER COMPONENTS ==================== */

function ColorSwatch({
  color,
  label,
  hex,
  dark = false,
  primary = false,
}: {
  color: string;
  label: string;
  hex: string;
  dark?: boolean;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${color} h-12 w-full rounded-lg ${primary ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`}
      />
      <span className={`text-[10px] font-medium ${dark ? "text-neutral-700" : "text-neutral-500"}`}>
        {label}
      </span>
      <span className="text-[9px] text-neutral-400 font-mono">{hex}</span>
    </div>
  );
}

function SemanticSwatch({
  label,
  bgClass,
  textClass,
  border = false,
}: {
  label: string;
  bgClass: string;
  textClass: string;
  border?: boolean;
}) {
  return (
    <div
      className={`${bgClass} ${textClass} ${border ? "border border-neutral-200" : ""} rounded-lg px-3 py-4 text-center`}
    >
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}
