// components/PDFPreviewModal/PDFPreviewModal.jsx
import { useState } from 'react'
import './PDFPreviewModal.css'

export default function PDFPreviewModal({ isOpen, onClose, pdfUrl, title }) {
  const [loading, setLoading] = useState(true)

  if (!isOpen) return null

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = (title?.replace(/\s+/g, '_') || 'informe') + '.pdf'
      a.click()
    }
  }

  const handleIframeLoad = () => {
    setLoading(false)
  }

  return (
    <div className="pdf-modal-overlay" onClick={onClose}>
      <div className="pdf-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-modal-header">
          <h3>
            <i className="bi bi-file-earmark-pdf-fill"></i>
            {title || 'Previsualización del informe'}
          </h3>
          <div className="pdf-modal-actions">
            <button className="pdf-modal-btn pdf-modal-btn-download" onClick={handleDownload}>
              <i className="bi bi-download"></i> Descargar
            </button>
            <button className="pdf-modal-btn pdf-modal-btn-close" onClick={onClose}>
              <i className="bi bi-x-lg"></i> Cerrar
            </button>
          </div>
        </div>
        <div className="pdf-modal-body">
          {loading && (
            <div className="pdf-modal-loading">
              <div className="pdf-spinner"></div>
              <p>Cargando documento...</p>
            </div>
          )}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title="Vista previa del informe"
              className="pdf-iframe"
              onLoad={handleIframeLoad}
            />
          )}
        </div>
      </div>
    </div>
  )
}