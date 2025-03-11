import Experience from "../../Experience";
import gsap from "gsap";
import * as THREE from "three";
import EventEmitter from "../../Utils/EventEmitter";
import { EVENTS, EXPERIENCE } from "../../../Constants";
import { Vector3 } from "three";
export default class Intersections extends EventEmitter{
  constructor() {
    super()
    if (window.location.hash == "#add") {
      this.adminMode = true;
    }
    this.experience = new Experience();
    this.currentCamera = null
    this.prevCamera = null;
   
    // this.shipTooltip = document.getElementById("shipToolTip");
    this.setUtils();
    this.setEvents();
    this.initialAnimation()
    this.experience.renderer.on(EVENTS.XR_SESSION_START,()=>{this.initialAnimationForVr()},this)
  }
  initialAnimationForVr(){
 
    
    // this.moveCamera(this.experience.world.museum.firstCamera,this.experience.world.museum.firstCamera.position,true)
    this.moveCameraForVR(this.experience.world.museum.firstCamera,this.experience.world.museum.firstCamera.position,true)
  }
  initialAnimation(){
    this.moveCamera(this.experience.world.museum.firstCamera,this.experience.world.museum.firstCamera.position,true)
  }

  setUtils() {
    this.raycaster = this.experience.raycaster;
    this.pointerPos = this.experience.pointerPos;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;
    this.camera = this.experience.camera;
    this.circle = this.experience.world.circle
    this.muesumModelMesh = this.experience.world.museum.muesumModelMesh
    this.id = 0;
    this.previousMouseX = 0;
    this.previousMouseY = 0;
    // document.body.style.cursor = "grab";
    this.isDragging = false;
    this.duration = null;
    this.isCameraIntersected = [];
  
  }

  
  onClick() {
   

 
    if(this.isCameraIntersected.length > 0){

    
      
      this.moveCamera(this.isCameraIntersected[0].object,this.isCameraIntersected[0].point);
      
    }
    
  }
  setCirclePos(intersects) {
    if (intersects.length === 0) return;

    const point = intersects[0].point;
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.experience.world.museum.muesumModelMesh.matrixWorld);
    //fetching matrix of model to convert the normal vector to world coordinates, matrix means The transformation matrix that moves the model into the scene
    const n = intersects[0].face.normal.clone().applyNormalMatrix(normalMatrix);
    const up = new THREE.Vector3(0, 0, 1); 
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, n);
    this.circle.updatePositionAndRotation(point,quaternion)
   this.circle.updatePositionOfDebugNormalMesh(point,n)
}






  checkInterSections(){
    this.raycaster.setFromCamera(this.pointerPos, this.camera.instance);
    this.isCameraIntersected = this.raycaster.intersectObjects(
      this.experience.camerasToIntersect
    );

    const intersects = this.raycaster.intersectObject(this.experience.museumPartsToIntersect);

  if (intersects.length > 0) {
    // const point = intersects[0].point;
    this.setCirclePos(intersects)
  }
  }
  setEvents() {
    let pitchAngle = 0; // Track vertical rotation (in radians)

    const updatePointerPos = (x, y) => {
        this.pointerPos.x = (x / window.innerWidth) * 2 - 1;
        this.pointerPos.y = -(y / window.innerHeight) * 2 + 1;
        this.checkInterSections()
    };

    const startDragging = (x, y) => {
        this.isDragging = true;
        this.previousMouseX = x;
        this.previousMouseY = y;
    };

    const stopDragging = (event) => {
        this.onClick(event);
        this.isDragging = false;
    };

    const handleDrag = (x, y) => {
        if (!this.isDragging) return;

        const deltaX = x - this.previousMouseX;
        const deltaY = y - this.previousMouseY;

        const camera = this.experience.camera.instance;

        // Yaw (left/right) - Rotate around world Y-axis
        const yaw = new THREE.Quaternion();
        yaw.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX * 0.002);

        // Calculate new pitch angle
        let newPitchAngle = pitchAngle - deltaY * 0.002; // Adjust sensitivity
        newPitchAngle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newPitchAngle)); // Clamp between -90° and 90°

        // Pitch (up/down) - Rotate around local X-axis
        const pitch = new THREE.Quaternion();
        pitch.setFromAxisAngle(new THREE.Vector3(1, 0, 0), newPitchAngle - pitchAngle);

        // Apply rotations
        camera.quaternion.multiplyQuaternions(yaw, camera.quaternion);
        camera.quaternion.multiplyQuaternions(camera.quaternion, pitch);

        // Update stored pitch angle
        pitchAngle = newPitchAngle;

        this.previousMouseX = x;
        this.previousMouseY = y;
    };

    // // Mouse Events
    this.canvas.addEventListener("mousedown", (e) => startDragging(e.clientX, e.clientY));
    this.canvas.addEventListener("mouseup", stopDragging);
    this.canvas.addEventListener("mouseleave", stopDragging);
    this.canvas.addEventListener("mousemove", (e) => {
        updatePointerPos(e.clientX, e.clientY);
        handleDrag(e.clientX, e.clientY);
    });

    // Touch Events
    this.canvas.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        startDragging(touch.clientX, touch.clientY);
    });

    this.canvas.addEventListener("touchend", stopDragging);
    this.canvas.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        updatePointerPos(touch.clientX, touch.clientY);
        handleDrag(touch.clientX, touch.clientY);
    });

    // Scroll Event (Zoom)
    this.canvas.addEventListener("wheel", (e) => {
        const value= Math.max(EXPERIENCE.CAMERA_FOV.MIN_LIMIT, Math.min(EXPERIENCE.CAMERA_FOV.MAX_LIMIT, this.camera.instance.fov + e.deltaY * 0.005));
        this.camera.updateFov(value);
        
    });
}





  addNewEnv(path){
  
    
  //  this.experience.textureLoader.load(
  //     path,
  //     (file) =>
  //     {
  //       console.log("New Loaded",file);
        
  //         // this.experience.scene.background = file;
          
  //     }
  // )

  }
  async moveCamera(node,destinationPos,initialRotation=false) {
    if(this.currentCamera !=null ){

      this.experience.camerasToIntersect.push(this.currentCamera);

    }

        if(initialRotation){
          this.camera.setCameraLayer(1)
        }
        if (this.currentCamera) {
            this.prevCamera = this.currentCamera;
        }

        this.currentCamera = node;
        const name = this.currentCamera.name.slice(-4);
        console.log("gsap image loading");
        const tex = await this.experience.world.sphere.loadNewTexture(
            EXPERIENCE.RENDERS_FOLDER_BASE + EXPERIENCE["3DRENDER_BASE_NAME"] + name + ".jpeg"
        );
        console.log("gsap image loaded");

     
        const index = this.experience.camerasToIntersect.indexOf(this.currentCamera);
        if (index > -1) {
            this.experience.camerasToIntersect.splice(index, 1);
        }
        let endQuaternion = 0;
        if(initialRotation){
          
        const lookAtTarget = new THREE.Vector3(destinationPos.x, destinationPos.y, destinationPos.z);
        const startRotation = new THREE.Euler().copy(this.camera.cameraGroup.rotation);
        this.camera.cameraGroup.lookAt(lookAtTarget);
         endQuaternion = new THREE.Quaternion().copy(this.camera.cameraGroup.quaternion);
    
        // Reset to original rotation before animating
        this.camera.cameraGroup.rotation.copy(startRotation);
      }
    
      
      
      this.experience.world.sphere.changeTexture(tex);
      console.log("gsap before started");
    gsap.to(this.camera.cameraGroup.position, {
        duration: 2,
        x: destinationPos.x,
        y: destinationPos.y,
        z: destinationPos.z,
        onStart: () => {
          console.log("gsap started");
          
          this.experience.world.museum.enableMusuemMesh()
          this.experience.world.circle.disableCircle()
          this.experience.world.movementIndicators.disableAllIndicators()
        },
        onUpdate:()=>{
          // this.checkInterSections()
         
         
        },
        onComplete: () => {
          this.camera.setCameraLayer(0)
          this.experience.world.museum.disableMusuemMesh()
          this.experience.world.circle.enableCircle()
          this.experience.world.movementIndicators.enableAllIndicators()
        },
        ease: "power2.inout",
    });
    if(initialRotation){
    gsap.to(this.camera.instance.quaternion, {
      duration: 2,
      x: endQuaternion.x,
      y: endQuaternion.y,
      z: endQuaternion.z,
      w: endQuaternion.w,
      ease: "power2.out"
  });
}
}
async moveCameraForVR(node,destinationPos,initialRotation=false) {
  if(this.currentCamera !=null ){

    this.experience.camerasToIntersect.push(this.currentCamera);

  }
  if(initialRotation){
    this.camera.setCameraLayer(1)
  }
  if (this.currentCamera) {
      this.prevCamera = this.currentCamera;
  }

  this.currentCamera = node;
  const name = this.currentCamera.name.slice(-4);
  console.log("gsap image loading");
  const tex = await this.experience.world.sphere.loadNewTexture(
      EXPERIENCE.RENDERS_FOLDER_BASE + EXPERIENCE["3DRENDER_BASE_NAME"] + name + ".jpeg"
  );
  console.log("gsap image loaded");


  const index = this.experience.camerasToIntersect.indexOf(this.currentCamera);
  if (index > -1) {
      this.experience.camerasToIntersect.splice(index, 1);
  }
  let endQuaternion = 0;
  if(initialRotation){
    
  const lookAtTarget = new THREE.Vector3(destinationPos.x, destinationPos.y, destinationPos.z);
  const startRotation = new THREE.Euler().copy(this.camera.cameraGroup.rotation);
  this.camera.cameraGroup.lookAt(lookAtTarget);
   endQuaternion = new THREE.Quaternion().copy(this.camera.cameraGroup.quaternion);

  // Reset to original rotation before animating
  this.camera.cameraGroup.rotation.copy(startRotation);
}


this.experience.world.museum.enableMusuemMesh()
this.experience.world.circle.disableCircle()
this.experience.world.movementIndicators.disableAllIndicators()
this.experience.world.sphere.changeTextureForVR(tex);
this.camera.cameraGroup.position.set(destinationPos.x, destinationPos.y-1.0, destinationPos.z)

this.camera.setCameraLayer(0)
this.experience.world.museum.disableMusuemMesh()
this.experience.world.circle.enableCircle()
this.experience.world.movementIndicators.enableAllIndicators()
if(initialRotation){
gsap.to(this.camera.instance.quaternion, {
duration: 2,
x: endQuaternion.x,
y: endQuaternion.y,
z: endQuaternion.z,
w: endQuaternion.w,
ease: "power2.out"
});
}
}





  // /**
  //  * Callback Function which updates id
  //  * @param {*} id id of the country selected
  //  */

  // updateId = (id) => {
  //   this.id = id;
  // };

  // /**
  //  * Sets Click Events for Positioning the Character
  //  */

  // setEvents() {
  //   //For Windows
  //   if (this.adminMode) {
  //     this.canvas.addEventListener("mousemove", (e) => {
  //       this.testingCountry(this.isCountryIntersected, e);
  //     });
  //     this.canvas.addEventListener("mousedown", (e) => {
  //       this.selectPosition(this.isCountryIntersected, e);
  //     });
  //   } else {
  //     this.canvas.addEventListener("mousedown", (e) => {
  //       if (e.button === 0) {
  //         document.body.style.cursor = "grabbing";
  //         this.isDragging = true;
  //         this.checkIntersections(e);
  //       }
  //     });
  //     this.canvas.addEventListener("mouseup", () => {
  //       document.body.style.cursor = "grab";
  //       this.isDragging = false;
  //     });
  //     this.canvas.addEventListener("mousemove", (e) => {
  //       this.mousemove(e);
  //       this.touchmove = true;
  //     });

  //     //For Mobile Phones
  //     this.canvas.addEventListener("touchend", (e) => {
  //       this.checkIntersections(e);
  //     });
  //   }
  // }

  // /**
  //  * Setting the mouse position from center of the screen
  //  * @param {*} event mouse event
  //  */

  // mousemove = (event) => {
  //   this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  //   this.checkIntersections(event);
  // };

  // selectPosition(arr, event) {
  //   if (arr.length > 0) {
  //     let textToCopy = JSON.stringify(arr[0].point);
  //     textToCopy = textToCopy.slice(1, textToCopy.length - 1) + ",";
  //     navigator.clipboard
  //       .writeText(textToCopy)
  //       .then(() => {
  //         this.shipTooltip.innerHTML = "Text copied to clipboard";
  //         this.setPopup(event);
  //       })
  //       .catch((error) => {
  //         console.error("Unable to copy text: " + error);
  //       });
  //   }
  // }
  // testingCountry(arr, event) {
  //   if (arr.length > 0) {
  //     this.shipTooltip.innerHTML = "Click here to copy the position";
  //     this.setPopup(event);
  //   } else {
  //     this.isToolTipVisible && this.clearPopup();

  //     this.shipTooltip.innerHTML = "No country Available";
  //     this.setPopup(event);
  //   }
  // }

  // /**
  //  * Checks with which character or country has been the intersection done
  //  */

  // checkIntersections(eventType) {
  //   this.newcharacter = this.character;
  //   if (
  //     ((this.isCharacterIntersected.length > 0 ||
  //       this.ispointerIntersected.length > 0) &&
  //       eventType.type == "mousedown") ||
  //     eventType.type == "touchend"
  //   ) {
  //     this.checkIntersectedCountries(this.isCharacterIntersected);
  //     this.checkIntersectedCountries(this.ispointerIntersected);
  //     return;
  //   } else if (
  //     (this.isCharacterIntersected.length > 0 ||
  //       this.ispointerIntersected.length > 0) &&
  //     eventType.type == "mousemove"
  //   ) {
  //     this.checkIntersectedCountriesHover(
  //       this.isCharacterIntersected,
  //       eventType
  //     );
  //     this.checkIntersectedCountriesHover(this.ispointerIntersected, eventType);
  //     return;
  //   } else {
  //     this.clearPopup();
  //   }
  //   if (
  //     this.touchmove ||
  //     this.isCountryIntersected.length === 0 ||
  //     this.id === null
  //   ) {
  //     this.clearPopup();
  //     return;
  //   }
  //   if (eventType.type == "mousedown" || eventType.type == "touchend") {
  //     this.checkIntersectedCountries(this.isCharacterIntersected);
  //     this.checkIntersectedCountries(this.ispointerIntersected);
  //     return;
  //   } else if (eventType.type == "mousemove") {
  //     this.checkIntersectedCountriesHover(
  //       this.isCharacterIntersected,
  //       eventType
  //     );
  //     this.checkIntersectedCountriesHover(this.ispointerIntersected, eventType);
  //     return;
  //   }
  // }

  // checkIntersectedCountries(intersectedList) {
  //   for (const intersected of intersectedList) {
  //     const countryName =
  //       intersected.object.userData.countryName || intersected.object.name;
  //     const countryIndex = this.dataArray.findIndex(
  //       (country) => country.countryName === countryName
  //     );
  //     if (countryIndex !== -1) {
  //       this.updateId(countryIndex);
  //       this.cameraAnimation(this.newcharacter);
  //       return;
  //     }
  //   }
  // }
  // setPopup(event) {
  //   document.body.style.cursor = "pointer";
  //   this.isToolTipVisible = true;
  //   this.shipTooltip.style.display = "block";
  //   this.shipTooltip.style.position = "absolute";
  //   this.shipTooltip.style.left = event.clientX + 10 + "px";
  //   this.shipTooltip.style.top = event.clientY + 10 + "px";
  // }
  // clearPopup() {
  //   this.isToolTipVisible = false;
  //   document.body.style.cursor = "grab";
  //   this.shipTooltip.style.display = "none";
  //   this.shipTooltip.style.position = "relative";
  // }

  // checkIntersectedCountriesHover(intersectedList, event) {
  //   if (intersectedList[0]?.object?.userData?.countryName) {
  //     this.shipTooltip.innerHTML =
  //       intersectedList[0]?.object?.userData?.countryName;
  //     this.setPopup(event);
  //   }
  //   // for (const intersected of intersectedList) {
  //   //   const countryName =
  //   //     intersected.object.userData.countryName || intersected.object.name;
  //   //   const countryIndex = this.dataArray.findIndex(
  //   //     (country) => country.countryName === countryName
  //   //   );
  //   //   if (countryIndex != -1) {
  //   //     this.shipTooltip.innerHTML = countryName;
  //   //     if (!this.isToolTipVisible) {
  //   //       this.setPopup(event);
  //   //       return;
  //   //     }
  //   //   }
  //   // }
  // }

  // /**
  //  * Camera Animation when country is selected
  //  */

  // cameraAnimation(character, newData) {
  //   /**
  //    *
  //    *
  //    * if want to disable camera movement again and again with animation remove comment
  //    */
  //   // if (
  //   //   this.camera.controls.target.x === this.dataArray[this.id].x &&
  //   //   this.camera.controls.target.y === this.dataArray[this.id].y &&
  //   //   this.camera.controls.target.z === this.dataArray[this.id].z
  //   // ) {
  //   //   this.duration = 0.001;
  //   // }
  //   gsap
  //     .to(this.camera.instance.position, {
  //       duration: this.duration,
  //       onStart: () => {
  //         this.camera.controls.enabled = false;
  //       },
  //       x: this.dataArray[this.id].x,
  //       y: this.dataArray[this.id].y + 4,
  //       z: this.dataArray[this.id].z + 4,
  //     })
  //     .then(() => {
  //       if (!this.camera.controls.enabled) {
  //         this.camera.controls.enabled = true;
  //         this.camera.controls.target.set(
  //           this.dataArray[this.id].x,
  //           this.dataArray[this.id].y,
  //           this.dataArray[this.id].z
  //         );
  //         this.popup = new Popup(this.id, this.dataArray, character, (id) =>
  //           this.updateId(id)
  //         );
  //       }
  //     });
  // }

  // /**
  //  * Update function rendered on every next frame
  //  */

  update() {
 
   
    
    
   
  }
}
