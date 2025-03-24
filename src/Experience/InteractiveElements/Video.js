import * as THREE from 'three';
import { Vector3 } from 'three';

export function add3DVideoPlayer(scene) {
   
    const video = document.createElement('video');
    video.src = 'interactiveAssets/video.mp4'; 
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true; 
   
    video.play();

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;

 
    const videoMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture,
        side: THREE.DoubleSide,
        transparent:true
    });

    
    const geometry = new THREE.PlaneGeometry(15, 10); 
    const videoMesh = new THREE.Mesh(geometry, videoMaterial);
    videoMesh.renderOrder = 3
  
    videoMesh.position.set(
       -50,
       15,
        -98
    
    ); 
    const rotation = new Vector3(0,90,0)
    videoMesh.rotation.set(
        THREE.MathUtils.degToRad(rotation.x),
        THREE.MathUtils.degToRad(rotation.y),
        THREE.MathUtils.degToRad(rotation.z)
    );
    
    scene.add(videoMesh);
}
