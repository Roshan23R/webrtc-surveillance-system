import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { AlertTable } from "../components/AlertTable";
import { useAlerts } from "../hooks/useAlerts";
import { useCameraStats } from "../hooks/useCameraStats";
import { useCameras } from "../hooks/useCameras";
import type { Camera } from "../types/camera";
import { CamerasSection } from "../components/CamerasSection";
import { CameraFormModal } from "../components/CameraFormModal";

interface DashboardPageProps {
  token: string | null;
  username: string;
  onLogout: () => void;
}

export function DashboardPage({
  token,
  username,
  onLogout,
}: DashboardPageProps) {
  const {
    cameras,
    camerasLoading,
    cameraError,
    getCameras,
    handleAddCamera,
    handleEditCamera,
    handleDeleteCamera,
    handleStartCamera,
    handleStopCamera,
  } = useCameras(token);

  const alerts = useAlerts();
  const cameraStats = useCameraStats();

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formRtspUrl, setFormRtspUrl] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Load cameras on mount and token change
  useEffect(() => {
    if (token) {
      getCameras();
    }
  }, [token, getCameras]);

  const handleAddCameraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRtspUrl) return;

    setIsFormLoading(true);
    try {
      await handleAddCamera({
        name: formName,
        rtspUrl: formRtspUrl,
        location: formLocation || undefined,
      });
      setIsAddModalOpen(false);
      setFormName("");
      setFormRtspUrl("");
      setFormLocation("");
    } catch (err: any) {
      alert("Failed to add camera: " + err.message);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditCameraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCamera || !formName || !formRtspUrl) return;

    setIsFormLoading(true);
    try {
      await handleEditCamera(selectedCamera.id, {
        name: formName,
        rtspUrl: formRtspUrl,
        location: formLocation || undefined,
      });
      setIsEditModalOpen(false);
      setSelectedCamera(null);
      setFormName("");
      setFormRtspUrl("");
      setFormLocation("");
    } catch (err: any) {
      alert("Failed to update camera: " + err.message);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteCameraClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this camera?")) return;

    try {
      await handleDeleteCamera(id);
    } catch (err: any) {
      alert("Failed to delete camera: " + err.message);
    }
  };

  const handleStartCameraClick = async (id: string) => {
    try {
      await handleStartCamera(id);
    } catch (err: any) {
      alert("Failed to start camera: " + err.message);
    }
  };

  const handleStopCameraClick = async (id: string) => {
    try {
      await handleStopCamera(id);
    } catch (err: any) {
      alert("Failed to stop camera: " + err.message);
    }
  };

  const openEditModal = (camera: Camera) => {
    setSelectedCamera(camera);
    setFormName(camera.name);
    setFormRtspUrl(camera.rtspUrl);
    setFormLocation(camera.location || "");
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCamera(null);
    setFormName("");
    setFormRtspUrl("");
    setFormLocation("");
  };

  // Stats Metrics
  const activeCamerasCount = cameras.filter(
    (c) => c.status === "running"
  ).length;
  const totalAlertsCount = alerts.length;
  const highConfidenceAlerts = alerts.filter(
    (a) => parseFloat(a.confidence) >= 0.8
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 font-sans transition-colors duration-300 pb-12 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Navbar
          onLogout={onLogout}
          username={username}
          totalCameras={cameras.length}
          activeStreams={activeCamerasCount}
          totalAlerts={totalAlertsCount}
          criticalIncidents={highConfidenceAlerts}
        />

        <main className="max-w-9xl mx-auto px-6 mt-12 space-y-8">
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <CamerasSection
            cameras={cameras}
            isLoading={camerasLoading}
            error={cameraError}
            cameraStats={cameraStats}
            onAddClick={() => setIsAddModalOpen(true)}
            onStart={handleStartCameraClick}
            onStop={handleStopCameraClick}
            onEdit={openEditModal}
            onDelete={handleDeleteCameraClick}
          />

          <div className="lg:col-span-1 space-y-6">
            <AlertTable cameras={cameras} />
          </div>
        </section>
      </main>

      <CameraFormModal
        isOpen={isAddModalOpen}
        isEdit={false}
        formName={formName}
        formRtspUrl={formRtspUrl}
        formLocation={formLocation}
        isLoading={isFormLoading}
        onNameChange={setFormName}
        onRtspUrlChange={setFormRtspUrl}
        onLocationChange={setFormLocation}
        onSubmit={handleAddCameraSubmit}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormName("");
          setFormRtspUrl("");
          setFormLocation("");
        }}
      />

      <CameraFormModal
        isOpen={isEditModalOpen}
        isEdit={true}
        formName={formName}
        formRtspUrl={formRtspUrl}
        formLocation={formLocation}
        isLoading={isFormLoading}
        onNameChange={setFormName}
        onRtspUrlChange={setFormRtspUrl}
        onLocationChange={setFormLocation}
        onSubmit={handleEditCameraSubmit}
        onClose={closeEditModal}
      />
      </div>
    </div>
  );
}
