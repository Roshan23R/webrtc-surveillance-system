import axios from "axios";

const WORKER_URL = process.env.WORKER_URL;

export async function startWorkerCamera(cameraId: string, rtspUrl: string) {
  const response = await axios.post(
    `${WORKER_URL}/start`,

    {
      camera_id: cameraId,
      rtsp_url: rtspUrl,
    },
  );

  return response.data;
}

export async function stopWorkerCamera(cameraId: string) {
  const response = await axios.post(
    `${WORKER_URL}/stop`,

    {
      camera_id: cameraId,
    },
  );

  return response.data;
}

export async function negotiateOffer(cameraId: string, offerSdp: any) {
  const response = await axios.post(
    `${WORKER_URL}/cameras/${cameraId}/offer`,
    offerSdp,
  );
  return response.data;
}
