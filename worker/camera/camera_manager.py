from camera.camera_processor import CameraProcessor


class CameraManager:

    def __init__(self):
        self.running_cameras = {}


    def start_camera(
        self,
        camera_id,
        rtsp_url
    ):

        if camera_id in self.running_cameras:
            return False

        processor = CameraProcessor(
            camera_id,
            rtsp_url
        )

        processor.start()

        self.running_cameras[
            camera_id
        ] = processor

        return True


    def stop_camera(
        self,
        camera_id

    ):

        if camera_id not in self.running_cameras:
            return False


        processor = self.running_cameras[
            camera_id
        ]

        processor.stop()

        del self.running_cameras[
            camera_id
        ]

        return True


    def get_running_cameras(
        self
    ):

        return list(
            self.running_cameras.keys()
        )