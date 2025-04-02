import Experience from "../Experience/Experience";
import * as THREE from 'three';
import gsap from 'gsap';
import { Vector3 } from "three";
import { GUI } from 'lil-gui';  // Import lil-gui
import { EVENTS, EXPERIENCE } from "../Constants";
import EventEmitter from "../Experience/Utils/EventEmitter";

export default class CameraAnimationManager extends EventEmitter {
    constructor() {
        super()
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.camera = this.experience.camera.instance;
        this.cameraGroup = this.experience.camera.cameraGroup;
        this.debug = this.experience.debug;
        
        // Define initial points for the camera path
        this.startPoint = new Vector3(-500, 300, 0);
        this.middlePoint = new Vector3(-278,60,-302);  // Middle point for curve
        this.endPoint = new Vector3(-189, 8+EXPERIENCE.HEIGHT_OF_CAMERA, -319);

        // Initialize the path and animation control
        this.initCameraPath(this.startPoint, this.middlePoint, this.endPoint);

        // Create the debug GUI interface for controlling the path
        if(this.debug.active)
        this.createGUI();
    }

    // Function to create a smooth path using Catmull-Rom Curve between start, middle, and end points
    initCameraPath(startPoint, middlePoint, endPoint) {
        this.curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
            new THREE.Vector3(middlePoint.x, middlePoint.y, middlePoint.z),
            new THREE.Vector3(endPoint.x, endPoint.y, endPoint.z)
        ]);

        // Visualize the path (optional)
        // const points = this.curve.getPoints(100);
        // const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        // this.curveObject = new THREE.Line(geometry, material);
        // this.scene.add(this.curveObject);

        // Set the initial position of the camera
        this.cameraGroup.position.copy(this.curve.points[0]);

        // Start the camera animation
        this.animateCameraAlongPath();
    }

    // Function to animate the camera along the path using GSAP
    animateCameraAlongPath() {
        const obj = { t: 0 };

        gsap.to(obj, {
            t: 1, // Animate from t=0 to t=1
            duration: EXPERIENCE.CAMERA_MOVEMENT_SPEED_FOR_WEB, // Duration for the animation
            ease: "power1.inOut", // Easing function
            onUpdate: () => {
                // Update the camera position along the curve
                const position = this.curve.getPoint(obj.t);
                this.cameraGroup.position.copy(position);
            
                // Compute the tangent to determine the correct facing direction
                const tangent = this.curve.getTangent(obj.t).normalize();
                
                // Create a target position ahead in the direction of the tangent
                const lookAtPosition = position.clone().add(tangent);
                
                // Make the camera look in the direction of movement
                this.camera.lookAt(lookAtPosition);
            }
,            
            onComplete:()=>{
                this.trigger(EVENTS.INITIAL_CAMERA_ANIMATION)
            }
        });
    }

    // Function to create the GUI interface for controlling the path
    createGUI() {
        // Initialize lil-gui if it doesn't exist
        this.gui = new GUI();

        // Create the GUI folder for path controls
        const pathFolder = this.gui.addFolder('Camera Path');
        pathFolder.open(); // Open the folder by default

        // Add GUI controls for the start point
        pathFolder.add(this.startPoint, 'x', -1000, 1000).name('Start X').onChange(() => this.updatePath());
        pathFolder.add(this.startPoint, 'y', -1000, 1000).name('Start Y').onChange(() => this.updatePath());
        pathFolder.add(this.startPoint, 'z', -1000, 1000).name('Start Z').onChange(() => this.updatePath());

        // Add GUI controls for the middle point
        pathFolder.add(this.middlePoint, 'x', -1000, 1000).name('Middle X').onChange(() => this.updatePath());
        pathFolder.add(this.middlePoint, 'y', -1000, 1000).name('Middle Y').onChange(() => this.updatePath());
        pathFolder.add(this.middlePoint, 'z', -1000, 1000).name('Middle Z').onChange(() => this.updatePath());

        // Add GUI controls for the end point
        pathFolder.add(this.endPoint, 'x', -1000, 1000).name('End X').onChange(() => this.updatePath());
        pathFolder.add(this.endPoint, 'y', -1000, 1000).name('End Y').onChange(() => this.updatePath());
        pathFolder.add(this.endPoint, 'z', -1000, 1000).name('End Z').onChange(() => this.updatePath());
    }

    // Function to update the camera path and re-render it
    updatePath() {
        // Remove the old curve from the scene
        this.scene.remove(this.curveObject);

        // Recreate the curve with updated control points
        this.initCameraPath(this.startPoint, this.middlePoint, this.endPoint);
    }

    // Additional method to stop the animation if needed
    stopCameraAnimation() {
        gsap.killTweensOf(this);
    }
}
