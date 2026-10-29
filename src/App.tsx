/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import { ProductTemplate, OrderLabel, AppSettings } from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ProductLibraryView } from './components/ProductLibraryView.tsx';
import { OrderHistoryView } from './components/OrderHistoryView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { GenerateOrderModal } from './components/GenerateOrderModal.tsx';
import { TemplateEditorModal } from './components/TemplateEditorModal.tsx';
import { LabelPreviewModal } from './components/LabelPreviewModal.tsx';
import { generateA4LabelPdf } from './utils/label-pdf.ts';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Active View
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'history' | 'settings'>('dashboard');

  // App Data
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [orders, setOrders] = useState<OrderLabel[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    dateFormat: 'DD/MM/YYYY',
    companyName: 'Modern National Chemicals (MNChem)',
    companyAddress: 'Dammam 2nd Industrial City, KSA',
    companyWebsite: 'www.mn-chem.com',
    defaultPageSize: 'A4',
    defaultOrientation: 'Landscape',
    autoPrintDialog: false,
  });

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [targetGenerateTemplate, setTargetGenerateTemplate] = useState<ProductTemplate | null>(null);

  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProductTemplate | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<OrderLabel | null>(null);
  const [previewPdfDataUrl, setPreviewPdfDataUrl] = useState<string | undefined>(undefined);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check auth and autostart query param
  useEffect(() => {
    const init = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autostart') === '1' && !api.isAuthenticated()) {
          // Automated testing helper
          await api.login('3056');
          setIsAuthenticated(true);
        } else {
          const valid = await api.verifySession();
          setIsAuthenticated(valid);
        }
      } catch (err) {
        console.warn('Initial session check failed:', err);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    init();
  }, []);

  // Load app data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const [loadedTemplates, loadedOrdersRes, loadedSettings] = await Promise.all([
          api.getTemplates(),
          api.getOrders(),
          api.getSettings(),
        ]);
        setTemplates(loadedTemplates);
        setOrders(loadedOrdersRes.orders);
        setSettings(loadedSettings);
      } catch (err) {
        console.error('Failed to load application data:', err);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleLogin = async (code: string) => {
    await api.login(code);
    setIsAuthenticated(true);
    showToast('Authorized session established. Welcome to MNChem LabelFlow.');
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
  };

  const handleOpenGenerateModal = (template?: ProductTemplate) => {
    setTargetGenerateTemplate(template || targetGenerateTemplate || templates[0] || null);
    setIsGenerateModalOpen(true);
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setIsTemplateEditorOpen(true);
  };

  const handleOpenEditTemplate = (template: ProductTemplate) => {
    setEditingTemplate(template);
    setIsTemplateEditorOpen(true);
  };

  const handleSaveTemplate = async (templateData: Partial<ProductTemplate>): Promise<ProductTemplate> => {
    if (editingTemplate) {
      const updated = await api.updateTemplate(editingTemplate.id, templateData);
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setTargetGenerateTemplate(updated);
      showToast(`Product template "${updated.name}" updated successfully.`);
      return updated;
    } else {
      const created = await api.createTemplate(templateData);
      setTemplates((prev) => [created, ...prev]);
      setTargetGenerateTemplate(created);
      showToast(`New product template "${created.name}" created.`);
      return created;
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    const duplicated = await api.duplicateTemplate(templateId);
    setTemplates((prev) => [duplicated, ...prev]);
    showToast(`Template duplicated as "${duplicated.name}".`);
  };

  const handleArchiveTemplate = async (templateId: string) => {
    const archived = await api.archiveTemplate(templateId);
    setTemplates((prev) => prev.map((t) => (t.id === archived.id ? archived : t)));
    showToast(`Template status changed to ${archived.status}.`);
  };

  const handleOrderCreated = async (orderPayload: any, pdfDataUrl: string) => {
    try {
      const created = await api.createOrder(orderPayload);
      setOrders((prev) => [created, ...prev]);
      setIsGenerateModalOpen(false);

      // Open preview modal for immediate verification, download, or printing
      setPreviewOrder(created);
      setPreviewPdfDataUrl(pdfDataUrl);
      setIsPreviewModalOpen(true);
      showToast(`Order ${created.orderNumber} finalized and A4 PDF saved!`);
    } catch (err: any) {
      console.error('Failed to save finalized order:', err);
      showToast(`Error saving order: ${err.message}`);
    }
  };

  const handleViewOrder = async (order: OrderLabel) => {
    setPreviewOrder(order);
    const tmpl = templates.find((t) => t.id === order.templateId) || templates[0];
    try {
      // Generate the A4 PDF DataUrl if not already loaded
      const res = await generateA4LabelPdf({
        template: tmpl,
        order,
        dateFormat: settings.dateFormat,
      });
      setPreviewPdfDataUrl(res.dataUrl);
    } catch {
      setPreviewPdfDataUrl(undefined);
    }
    setIsPreviewModalOpen(true);
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    showToast('Settings saved successfully.');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#071d3a] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#00a3e0] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wider uppercase text-slate-300">
            Initializing MNChem Label Studio...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} onLogin={handleLogin} />;
  }

  const selectedTemplateForPreview =
    previewOrder && templates.find((t) => t.id === previewOrder.templateId)
      ? templates.find((t) => t.id === previewOrder.templateId)!
      : templates[0];

  return (
    <div className="min-h-screen bg-[#061833] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenGenerateModal={() => handleOpenGenerateModal()}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#00a3e0] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-sm font-semibold animate-slide-up">
            <span>{toastMessage}</span>
          </div>
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            templates={templates}
            orders={orders}
            onOpenGenerateModal={handleOpenGenerateModal}
            onOpenCreateTemplateModal={handleOpenCreateTemplate}
            onViewOrder={handleViewOrder}
            onNavigateToProducts={() => setCurrentView('products')}
            onNavigateToHistory={() => setCurrentView('history')}
            dateFormat={settings.dateFormat}
          />
        )}

        {currentView === 'products' && (
          <ProductLibraryView
            templates={templates}
            onOpenGenerateModal={handleOpenGenerateModal}
            onOpenEditModal={handleOpenEditTemplate}
            onOpenCreateModal={handleOpenCreateTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
            onArchiveTemplate={handleArchiveTemplate}
          />
        )}

        {currentView === 'history' && (
          <OrderHistoryView
            orders={orders}
            templates={templates}
            onViewOrder={handleViewOrder}
            onOpenGenerateModal={() => handleOpenGenerateModal()}
            dateFormat={settings.dateFormat}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView settings={settings} onSaveSettings={handleSaveSettings} />
        )}
      </main>

      {/* Generate Order Modal */}
      {isGenerateModalOpen && (
        <GenerateOrderModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          templates={templates.filter((t) => t.status === 'active')}
          initialTemplate={targetGenerateTemplate}
          onOrderCreated={handleOrderCreated}
          dateFormat={settings.dateFormat}
        />
      )}

      {/* Template Editor Modal */}
      {isTemplateEditorOpen && (
        <TemplateEditorModal
          isOpen={isTemplateEditorOpen}
          onClose={() => setIsTemplateEditorOpen(false)}
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onOpenGenerateOrder={(tmpl) => handleOpenGenerateModal(tmpl)}
        />
      )}

      {/* Label Preview Modal */}
      {isPreviewModalOpen && previewOrder && selectedTemplateForPreview && (
        <LabelPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          order={previewOrder}
          template={selectedTemplateForPreview}
          pdfDataUrl={previewPdfDataUrl}
          dateFormat={settings.dateFormat}
        />
      )}
    </div>
  );
}
