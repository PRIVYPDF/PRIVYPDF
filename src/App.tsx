import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { PdfEditor } from './pages/PdfEditor';
import { MergePdf } from './pages/MergePdf';
import { SplitPdf } from './pages/SplitPdf';
import { CompressPdf } from './pages/CompressPdf';
import { ImageToPdf } from './pages/ImageToPdf';
import { PdfToImage } from './pages/PdfToImage';
import { RotatePdf } from './pages/RotatePdf';
import { DeletePages } from './pages/DeletePages';
import { OrganizePdf } from './pages/OrganizePdf';
import { WatermarkPdf } from './pages/WatermarkPdf';
import { ProtectPdf } from './pages/ProtectPdf';
import { Privacy } from './pages/Privacy';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isWorkspace = location.pathname === '/pdf-editor';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pdf-editor" element={<PdfEditor />} />
          <Route path="/merge-pdf" element={<MergePdf />} />
          <Route path="/split-pdf" element={<SplitPdf />} />
          <Route path="/compress-pdf" element={<CompressPdf />} />
          <Route path="/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/pdf-to-image" element={<PdfToImage />} />
          <Route path="/rotate-pdf" element={<RotatePdf />} />
          <Route path="/delete-pdf-pages" element={<DeletePages />} />
          <Route path="/organize-pdf" element={<OrganizePdf />} />
          <Route path="/watermark-pdf" element={<WatermarkPdf />} />
          <Route path="/protect-pdf" element={<ProtectPdf />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isWorkspace && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
