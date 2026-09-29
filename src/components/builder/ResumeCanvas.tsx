import { useEffect, useRef, useState } from "react";
import type { ResumeData } from "../../lib/resume-model";
import { exportText } from "../../lib/resume-model";
import { LoaderCircle, AlertCircle } from "lucide-react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
let queue: Promise<unknown> = Promise.resolve();
export function renderPdf(data: ResumeData): Promise<Blob> {
  const job = queue
    .catch(() => {})
    .then(async () => {
      const { createResumePdfBlob } = await import(
        "../../vendor/reactive-resume/pdf/browser"
      );
      return createResumePdfBlob({ data });
    });
  queue = job;
  return job;
}
export default function ResumeCanvas({
  data,
  onBlob,
  onStatus,
}: {
  data: ResumeData;
  onBlob: (blob: Blob | null) => void;
  onStatus: (status: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const seq = useRef(0);
  const onBlobRef = useRef(onBlob);
  const onStatusRef = useRef(onStatus);
  onBlobRef.current = onBlob;
  onStatusRef.current = onStatus;
  useEffect(() => {
    const version = ++seq.current;
    let disposed = false;
    setBusy(true);
    setError("");
    onBlobRef.current(null);
    onStatusRef.current("Updating preview");
    let pdf: any;
    let loadingTask: any;
    const timeout = setTimeout(async () => {
      try {
        const blob = await renderPdf(structuredClone(data));
        if (disposed || version !== seq.current) return;
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        loadingTask = pdfjs.getDocument({
          data: await blob.arrayBuffer(),
          useSystemFonts: true,
        });
        pdf = await loadingTask.promise;
        const fragment = document.createDocumentFragment();
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          if (disposed) return;
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute("role", "img");
          canvas.setAttribute("aria-label", `Resume preview, page ${i}`);
          await page.render({ canvas, viewport }).promise;
          const wrap = document.createElement("div");
          wrap.className = "resume-sheet";
          wrap.append(canvas);
          const label = document.createElement("span");
          label.className = "sheet-page-number";
          label.textContent = `Page ${i} of ${pdf.numPages}`;
          wrap.append(label);
          fragment.append(wrap);
        }
        if (disposed || version !== seq.current) return;
        container.current?.replaceChildren(fragment);
        container.current?.setAttribute(
          "data-rendered-template",
          data.metadata.template,
        );
        onBlobRef.current(blob);
        onStatusRef.current(
          `${pdf.numPages} ${pdf.numPages === 1 ? "page" : "pages"}`,
        );
        setBusy(false);
      } catch (e) {
        if (disposed) return;
        console.error("Resume rendering failed", e);
        setError(
          "The preview could not be generated. Check your content or choose another template.",
        );
        onStatusRef.current("Preview unavailable");
        setBusy(false);
      } finally {
        if (loadingTask) void loadingTask.destroy();
      }
    }, 450);
    return () => {
      disposed = true;
      clearTimeout(timeout);
    };
  }, [data]);
  return (
    <>
      <div className="canvas-render-status" role="status">
        {busy && (
          <>
            <LoaderCircle size={14} className="spin" /> Updating preview…
          </>
        )}
      </div>
      {error && (
        <div className="render-error" role="alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      <div ref={container} className="pdf-pages" aria-busy={busy} />
      <div className="sr-only" aria-label="Resume text">
        {exportText(data)}
      </div>
    </>
  );
}
