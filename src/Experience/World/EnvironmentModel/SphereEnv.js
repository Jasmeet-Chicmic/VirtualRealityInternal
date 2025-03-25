import * as THREE from 'three'
import Experience from '../../Experience'
import gsap from 'gsap'
import { EXPERIENCE } from '../../../Constants'

export default class SphereEnv {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.textures = [] // Dynamic texture queue
        this.currentTexture = null
        this.loadingTexture = null
        if(this.debug.active)
            {
                this.debugFolder = this.debug.ui.addFolder('Sphere')
               
            }
        this.setGeometry()
        this.setMaterial()
      
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(100, 32, 32)
    }

    setMaterial() {
        this.material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0,
            
        })
    }


    addDebugProp(){
        if(this.debugFolder){
            this.prop = {
                scale:0
            }
        this.debugFolder.add(this.mesh.position, 'x').min(-1000).max(1000).step(2) 
        this.debugFolder.add(this.mesh.position, 'y').min(-1000).max(1000).step(1);
        this.debugFolder.add(this.mesh.position, 'z').min(-1000).max(1000).step(1);
        
        this.debugFolder.add(this.prop,'scale').min(0.1).max(100).step(0.01).onChange(()=>{
            this.mesh.scale.set(this.prop.scale,this.prop.scale,this.prop.scale)
        });
        this.debugFolder.add(this.material, 'opacity').min(0).max(1).step(0.01);}
        this.debugFolder.close()
    }

    /**
     * Loads a texture dynamically from a given URL and applies the transition
     */
    async loadNewTexture(textureUrl) {
        this.experience.loader.showLoader();
        try {
            const newTexture = await this.loadTexture(textureUrl);
            this.experience.loader.hideLoader();
    
            // Apply texture settings
            var maxAnisotropy = this.experience.renderer.instance.capabilities.getMaxAnisotropy();
            newTexture.anisotropy = maxAnisotropy;
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.encoding = THREE.sRGBEncoding;
            newTexture.needsUpdate = true;
            newTexture.repeat.x = -1;
    
            return newTexture;
        } catch (error) {
            this.experience.loader.hideLoader();
            console.error("Error loading texture:", error);
            return null;
        }
    }
    
    changeTexture(newTexture,destinationPos = {x:0,y:0,z:0}) {
        if (!newTexture) return;
    
        if (!this.currentSphere) {
            this.currentSphere = this.createSphere(newTexture, 1,destinationPos);
            console.log("this.currentsphere",this.currentSphere);
            
            this.currentSphere.scale.set(EXPERIENCE.SKYBOX_SCALE,EXPERIENCE.SKYBOX_SCALE,EXPERIENCE.SKYBOX_SCALE) // Create first sphere
            return;
        }
    
        // Create a new sphere with the new texture, start with opacity 0
        const newSphere = this.createSphere(newTexture, 0,destinationPos);
    
        // Animate transition: old sphere fades out, new sphere fades in
        gsap.to(this.experience.camera.instance, {
            fov: this.experience.camera.instance.fov, // Simulate depth zoom in
            duration: EXPERIENCE.CAMERA_MOVEMENT_SPEED_FOR_WEB,
            onUpdate: () => {
                this.experience.camera.instance.updateProjectionMatrix();
            },
            onComplete:()=>{
               this.experience.camera.resetFov()
                this.experience.camera.instance.updateProjectionMatrix();
                this.scene.remove(this.currentSphere)
                this.currentSphere.geometry.dispose();
                this.currentSphere.material.dispose();
                this.currentSphere = newSphere;
            },
            ease: "power2.out",
        });
        gsap.to(newSphere.material, {
           
            opacity: 1,
            duration:EXPERIENCE.CAMERA_MOVEMENT_SPEED_FOR_WEB,
            ease: "power2.out",
        });
        // Fade out old sphere
        // gsap.to(this.currentSphere.material, {
        //     opacity: 0,
        //     duration: 2,
        //     ease: "power2.out",
        //     onComplete: () => {
        //         this.scene.remove(this.currentSphere);
        //         this.currentSphere.geometry.dispose();
        //         this.currentSphere.material.dispose();
        //         this.currentSphere = newSphere;
        //     }
        // });
        
        // Fade in new sphere
        
    }
    changeTextureForVR(newTexture,destinationPos = {x:0,y:0,z:0}){
        if (!newTexture) return;
    
        if (!this.currentSphere) {
            this.currentSphere = this.createSphere(newTexture, 1,destinationPos); // Create first sphere
            return;
        }
    
        // Create a new sphere with the new texture, start with opacity 0
        const newSphere = this.createSphere(newTexture, 1,destinationPos);
        this.currentSphere.geometry.dispose();
        this.currentSphere.material.dispose();
        this.scene.remove(this.currentSphere)
        this.currentSphere = newSphere;
    
    }
    
    disableSphereForVR(){
        this.currentSphere.visible = false;
    }
    /**
     * Creates a new sphere with a given texture and opacity.
     */
    createSphere(texture, initialOpacity,destinationPos) {
        this.skyShaders = {
            uniforms: {
                progress: {
                    type: "f",
                    value: 0
                }
            },
            vertexShader: ["varying vec2 vUv;", "void main()", "{", "   vUv = uv;", "   vec4 worldPosition = modelMatrix * vec4( position, 1.0 );", "   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
            fragmentShader: ["varying vec2 vUv;", "uniform float uProgress;", "uniform sampler2D uMap0;", "uniform sampler2D uMap1;", "", "void main( void ) {", "", "   vec4 colorFromMap0 = texture2D(uMap0, vUv);", "   vec4 colorFromMap1 = texture2D(uMap1, vUv);", "   vec3 color = mix(colorFromMap0.xyz, colorFromMap1.xyz, uProgress);", "", "   gl_FragColor = vec4( color,  1.0 ); ", "}"].join("\n")
        }
        const skyMaterial = new THREE.ShaderMaterial({
            vertexShader:   this.skyShaders.vertexShader,
            fragmentShader: this.skyShaders.fragmentShader
        });
        skyMaterial.uniforms = {
            uProgress: {
                value: 0.0
            },
            uMap0: {
                value: texture,
                type: 't'
            },
            uMap1: {
                value: this.experience.resources.items["NewMuseumEnv"],
                type: 't'
            },
          
        };
        // const material = new THREE.MeshBasicMaterial({
        //     map: texture,
        //     side: THREE.BackSide,
        //     transparent: true,
        //     opacity: initialOpacity,
            
            
        // });
    
        const sphere = new THREE.Mesh(this.geometry, skyMaterial);
       
        sphere.position.set(destinationPos.x,destinationPos.y,destinationPos.z); // Place new sphere at the same position
        this.scene.add(sphere);
        console.log("this.scene",this.scene);
        
        // sphere.visible = false
        return sphere;
    }
    
    

    /**
     * Applies a new texture to the sphere
     */
    applyTexture(newTexture) {
        this.material.map = newTexture
        this.material.opacity = 1
        this.material.needsUpdate = true
        this.currentTexture = newTexture
    }

    /**
     * Dynamically loads a texture from a URL
     */
    loadTexture(url) {
        return new Promise((resolve,rej) => {
            const loader = new THREE.TextureLoader()
            loader.load(url, (texture) => {
                texture.needsUpdate = true
                resolve(texture)
            },()=>{
                rej("Error loading texture")
            })
        })
    }
}
