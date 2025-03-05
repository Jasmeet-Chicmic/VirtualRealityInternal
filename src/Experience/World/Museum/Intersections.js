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
  }

  setUtils() {
    this.raycaster = this.experience.raycaster;
    this.pointerPos = this.experience.pointerPos;
    this.canvas = this.experience.canvas;
    this.debug = this.experience.debug;
    this.camera = this.experience.camera;
    this.id = 0;
    // document.body.style.cursor = "grab";
    this.isDragging = false;
    this.duration = null;
    this.isCameraIntersected = [];
  
  }

  removeCurrentCamera
  onClick() {
   

 
    if(this.isCameraIntersected.length > 0){
      console.log("OnClick",this.isCameraIntersected[0].object);
     
    
      
      if(this.currentCamera !=null ){

        this.experience.camerasToIntersect.push(this.currentCamera);
  
      }
      
      this.moveCamera(this.isCameraIntersected[0].point);
      
    }
    
  }
  setEvents(){
    this.canvas.addEventListener("touchend", (e) => {
      this.onClick(e);
    })
    this.canvas.addEventListener("mouseup", (e) => {
     this.onClick(e);
    })
    this.canvas.addEventListener("mousemove", (event) => {
      this.pointerPos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointerPos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    })
    this.canvas.addEventListener("touchmove", (event) => {
      this.pointerPos.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointerPos.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    })
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
  this.experience.world.sphere.changeTexture(path)
  }
  moveCamera(destinationPos) {
    if (this.isCameraIntersected.length > 0) {
        // Store the previous camera for re-adding later
       
        if (this.currentCamera) {
            this.prevCamera = this.currentCamera;
        }

        // Get the new camera to move to
        this.currentCamera = this.isCameraIntersected[0].object;
        const name =this.currentCamera.name.slice(this.currentCamera.name.length-4,this.currentCamera.name.length)
        this.addNewEnv(EXPERIENCE.RENDERS_FOLDER_BASE+ EXPERIENCE["3DRENDER_BASE_NAME"] +name+".jpeg")
        // Remove the current camera from intersections
        const index = this.experience.camerasToIntersect.indexOf(this.currentCamera);
        if (index > -1) {
      
            this.experience.camerasToIntersect.splice(index, 1);
          
            
        }
    }
   
    // Compute direction to look at smoothly
    const lookAtTarget = new THREE.Vector3(destinationPos.x, destinationPos.y, destinationPos.z);
    const startRotation = new THREE.Euler().copy(this.camera.instance.rotation);
    this.camera.instance.lookAt(lookAtTarget);
    const endQuaternion = new THREE.Quaternion().copy(this.camera.instance.quaternion);

    // Reset to original rotation before animating
    this.camera.instance.rotation.copy(startRotation);

    gsap.to(this.camera.instance.position, {
        duration: 2,
        x: destinationPos.x,
        y: destinationPos.y,
        z: destinationPos.z,
        onStart: () => {
            this.camera.controls.enabled = false;
        },
        onUpdate: () => {
            // Gradually update the lookAt target (rotation)
            this.camera.controls.target.lerp(lookAtTarget, 0.1);
            this.camera.controls.update();
        },
        onComplete: () => {
            this.camera.controls.enabled = true;
            this.camera.controls.target.copy(new Vector3(lookAtTarget.x+0.1,lookAtTarget.y,lookAtTarget.z));
            this.camera.controls.update();
            // this.experience.world.museum.material.opactity = 0.5;
            // this.camera.instance.layers.set(1);
        }
    });

    // Smoothly animate the rotation
    gsap.to(this.camera.instance.quaternion, {
        duration: 2,
        x: endQuaternion.x,
        y: endQuaternion.y,
        z: endQuaternion.z,
        w: endQuaternion.w,
        ease: "power2.out"
    });
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
 
    this.raycaster.setFromCamera(this.pointerPos, this.camera.instance);
    this.isCameraIntersected = this.raycaster.intersectObjects(
      this.experience.camerasToIntersect
    );
    
    
   
  }
}
