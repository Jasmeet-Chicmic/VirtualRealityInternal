import * as THREE from 'three';
import Experience from '../Experience';

export default class VideoPlayer3D {
    constructor(scene) {
        this.scene = scene;
        this.experience = new Experience()
        this.videoPlayers = new Map(); // Store videos by ID
    }

    /**
     * Create a video player with a unique ID.
     * @param {string} videoID - Unique identifier for this video.
     * @param {string} videoSrc - Path to the video file.
     * @param {THREE.Vector3} position - Position of the video.
     */
    createVideoPlayer(videoID, videoSrc, position = new THREE.Vector3(0, 0, 0)) {
        const videoGroup = new THREE.Group();

        // Create video element
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.setAttribute('playsinline', ''); // Support for mobile
      

        // Create video texture
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;
        videoTexture.needsUpdate = true;

        // Video material & mesh
        const videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.DoubleSide,
            transparent: true,
        });

        const videoGeometry = new THREE.PlaneGeometry(15, 10);
        const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
       
        videoMesh.position.copy(position);
        videoMesh.rotation.y = THREE.MathUtils.degToRad(90);
        videoGroup.add(videoMesh);

        // Create play/pause button
        const buttonGeometry = new THREE.BoxGeometry(3, 1.5, 0.3);
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff,transparent:true });
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.position.set(position.x, position.y - 6, position.z);
        buttonMesh.rotation.y = THREE.MathUtils.degToRad(90);
        buttonMesh.userData.videoID = videoID; // Store video ID in button
        videoGroup.add(buttonMesh);
        this.experience.interactionObjects.push(buttonMesh)
        // Store video data
        this.videoPlayers.set(videoID, { video, videoMesh, buttonMesh, group: videoGroup });
        videoGroup.renderOrder = 3;
        // Add to scene
        this.scene.add(videoGroup);

        return videoGroup;
    }

    /**
     * Toggle play/pause for a specific video.
     * @param {string} videoID - The ID of the video to toggle.
     */
    toggleVideo(videoID) {
        const videoData = this.videoPlayers.get(videoID);
        if (videoData) {
            const { video } = videoData;
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }
}
