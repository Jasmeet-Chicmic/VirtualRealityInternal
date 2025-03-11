import * as THREE from 'three'
import Experience from '../../Experience'
import gsap from 'gsap'

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
        this.geometry = new THREE.SphereGeometry(600, 64, 64)
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
    
    changeTexture(newTexture) {
        if (!newTexture) return;
    
        if (!this.currentSphere) {
            this.currentSphere = this.createSphere(newTexture, 1); // Create first sphere
            return;
        }
    
        // Create a new sphere with the new texture, start with opacity 0
        const newSphere = this.createSphere(newTexture, 0);
    
        // Animate transition: old sphere fades out, new sphere fades in
        gsap.to(this.experience.camera.instance, {
            fov: this.experience.camera.instance.fov * 0.9, // Simulate depth zoom in
            duration: 2,
            onUpdate: () => {
                this.experience.camera.instance.updateProjectionMatrix();
            },
            onComplete:()=>{
               this.experience.camera.resetFov()
                this.experience.camera.instance.updateProjectionMatrix();
                this.currentSphere.geometry.dispose();
                this.currentSphere.material.dispose();
                this.currentSphere = newSphere;
            },
            ease: "power2.out",
        });
        gsap.to(newSphere.material, {
           
            opacity: 1,
            duration: 2,
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
    changeTextureForVR(newTexture){
        if (!newTexture) return;
    
        if (!this.currentSphere) {
            this.currentSphere = this.createSphere(newTexture, 1); // Create first sphere
            return;
        }
    
        // Create a new sphere with the new texture, start with opacity 0
        const newSphere = this.createSphere(newTexture, 1);
        this.currentSphere.geometry.dispose();
        this.currentSphere.material.dispose();
        this.currentSphere = newSphere;
    
    }
    
    
    /**
     * Creates a new sphere with a given texture and opacity.
     */
    createSphere(texture, initialOpacity) {
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            opacity: initialOpacity,
            
            
        });
    
        const sphere = new THREE.Mesh(this.geometry, material);
        sphere.position.set(0,0,0); // Place new sphere at the same position
        this.scene.add(sphere);
      
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
