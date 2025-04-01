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
        this.prevTexture = {tex:null,displacementTexture:null}
        if(this.debug.active)
            {
                this.debugFolder = this.debug.ui.addFolder('Sphere')
               
            }
        this.setGeometry()
        this.setMaterial()
        this.setMesh();
      
    }

    setGeometry() {
        this.geometry = new THREE.SphereGeometry(100, 32, 32)
    }

    setMaterial() {
        this.skyShaders = {
            uniforms: {
                uProgress: { type: "f", value: 0 }, // Used for both blending and displacement scaling
                uOpacity: { type: "f", value: 1 },
                uMap0: { value: null, type: "t" },
                uMap1: { value: null, type: "t" },
                uDisplacementMap0: { value: null, type: "t" }, 
                uDisplacementMap1: { value: null, type: "t" }
            },
            vertexShader: `
                varying vec2 vUv;
                varying float vDisplacement;
                
                uniform sampler2D uDisplacementMap0;
                uniform sampler2D uDisplacementMap1;
                uniform float uProgress;
                
                void main() {
                    vUv = uv;
    
                    // Sample displacement maps
                    float disp0 = texture2D(uDisplacementMap0, vUv).r;
                    float disp1 = texture2D(uDisplacementMap1, vUv).r;
    
                    // Blend displacement maps using uProgress
                    float blendedDisp = mix(disp0, disp1, uProgress);
    
                    // Use uProgress directly to scale displacement
                    vDisplacement = blendedDisp * uProgress;
    
                    // Offset vertex position
                    vec3 displacedPosition = position + normal * vDisplacement;
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
    
                uniform float uProgress;
                uniform float uOpacity;
                uniform sampler2D uMap0;
                uniform sampler2D uMap1;
                
                void main() {
                    // Scale texture coordinates dynamically based on uProgress
                    vec2 scaledUV = vUv * (1.0 + uProgress * 0.5);
    
                    vec4 colorFromMap0 = texture2D(uMap0, scaledUV);
                    vec4 colorFromMap1 = texture2D(uMap1, vUv);
                    vec3 color = mix(colorFromMap0.xyz, colorFromMap1.xyz, uProgress);
    
                    gl_FragColor = vec4(color, uOpacity);
                }
            `
        };
    
        // ✅ Set Up Shader Material
        this.skyMaterial = new THREE.ShaderMaterial({
            vertexShader: this.skyShaders.vertexShader,
            fragmentShader: this.skyShaders.fragmentShader,
            side: THREE.BackSide,
            transparent: true,
            uniforms: THREE.UniformsUtils.clone(this.skyShaders.uniforms)
        });
    }
    
    setMesh(){
        this.sphere = new THREE.Mesh(this.geometry, this.skyMaterial);
        this.sphere.scale.set(EXPERIENCE.SKYBOX_SCALE,EXPERIENCE.SKYBOX_SCALE,EXPERIENCE.SKYBOX_SCALE)
        // Place new sphere at the same position
        this.scene.add(this.sphere);
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
    async loadNewTexture(textureUrl, displacementUrl) {
        this.experience.loader.showLoader();
        
        try {
            // Load both textures in parallel
            const [newTexture, displacementTexture] = await Promise.all([
                this.loadTexture(textureUrl),
                this.loadTexture(displacementUrl)
            ]);
    
            this.experience.loader.hideLoader();
    
            // Apply texture settings
            const maxAnisotropy = this.experience.renderer.instance.capabilities.getMaxAnisotropy();
            
            newTexture.anisotropy = maxAnisotropy;
            newTexture.wrapS = THREE.RepeatWrapping;
            newTexture.encoding = THREE.sRGBEncoding;
            newTexture.needsUpdate = true;
            newTexture.repeat.x = -1;
    
            displacementTexture.anisotropy = maxAnisotropy;
            displacementTexture.wrapS = THREE.RepeatWrapping;
            displacementTexture.needsUpdate = true;
    
            return { newTexture, displacementTexture };
        } catch (error) {
            this.experience.loader.hideLoader();
            console.error("Error loading textures:", error);
            return { newTexture: null, displacementTexture: null };
        }
    }
    
    
    changeTexture(textures,destinationPos = {x:0,y:0,z:0}) {
        if (!textures.tex) return;
    
        // if (!this.currentSphere) {
        //     this.currentSphere = this.createSphere(newTexture, 1,destinationPos);
        //     console.log("this.currentsphere",this.currentSphere);
            
        //     // Create first sphere
        //     return;
        // }
    
        // Create a new sphere with the new texture, start with opacity 0
       
    
        // Animate transition: old sphere fades out, new sphere fades in
        // gsap.to(this.experience.camera.instance, {
        //     fov: this.experience.camera.instance.fov, // Simulate depth zoom in
        //     duration: EXPERIENCE.CAMERA_MOVEMENT_SPEED_FOR_WEB,
        //     onUpdate: () => {
        //         this.experience.camera.instance.updateProjectionMatrix();
        //     },
        //     onComplete:()=>{
        //        this.experience.camera.resetFov()
        //         this.experience.camera.instance.updateProjectionMatrix();
        //         this.scene.remove(this.currentSphere)
        //         this.currentSphere.geometry.dispose();
        //         this.currentSphere.material.dispose();
        //         this.currentSphere = newSphere;
        //     },
        //     ease: "power2.out",
        // });
      // Fade in new sphere
      console.log("this.sphere.material.uniforms.uProgress",this.sphere.material.uniforms.uProgress);
      this.addNewTexAndUpdatePos(textures, 0,destinationPos);
gsap.to(this.sphere.material.uniforms.uProgress, {
    value: 1.0, // Target opacity
    duration: EXPERIENCE.CAMERA_MOVEMENT_SPEED_FOR_WEB,
   
    onComplete:()=>{
        this.sphere.material.uniforms.uMap0.value = this.sphere.material.uniforms.uMap1.value;
        this.sphere.material.uniforms.uProgress.value =0;
        
    }
    ,
    ease: "power2.out"
});

// Fade out old sphere
// gsap.to(this.currentSphere.material.uniforms.uOpacity, {
//     value: 0, // Fully transparent
//     duration: EXPERIENCE.CAMERA_MOVEMENT_SPEED_FOR_WEB,
//     ease: "power2.out",
//     onStart:()=>{
//         this.currentSphere
//     },
//     onComplete: () => {
//         this.scene.remove(this.currentSphere);
//         this.currentSphere.geometry.dispose();
//         this.currentSphere.material.dispose();
//         this.currentSphere = newSphere;
        
//     }
// });

        
        // Fade in new sphere
        
    }
    changeTextureForVR(textures,destinationPos = {x:0,y:0,z:0}){
        if (!textures.tex) return;
    
        // if (!this.currentSphere) {
        //     this.currentSphere = this.createSphere(newTexture, 1,destinationPos); // Create first sphere
        //     return;
        // }
    
        // Create a new sphere with the new texture, start with opacity 0
    this.addNewTexAndUpdatePos(textures, 1,destinationPos);
    this.sphere.material.uniforms.uMap0.value = this.sphere.material.uniforms.uMap1.value;
        // this.currentSphere.geometry.dispose();
        // this.currentSphere.material.dispose();
        // this.scene.remove(this.currentSphere)
        // this.currentSphere = newSphere;
    
    }
    
    disableSphereForVR(){
        this.currentSphere.visible = false;
    }
    /**
     * Creates a new sphere with a given texture and opacity.
     */
    addNewTexAndUpdatePos(textures, initialOpacity,destinationPos) {
        const texture = textures.tex
        if(this.prevTexture.tex){
            this.skyMaterial.uniforms.uMap0.value = this.prevTexture.tex;
            this.skyMaterial.uniforms.uDisplacementMap0.value = this.prevTexture.displacementTexture;

        }else{
            this.skyMaterial.uniforms.uMap0.value = texture
            this.skyMaterial.uniforms.uDisplacementMap0.value = textures.displacementTexture;
        }
        // ✅ Set Uniforms
        this.skyMaterial.uniforms.uMap1.value = texture;
        this.skyMaterial.uniforms.uDisplacementMap1.value = textures.displacementTexture;
        
        this.prevTexture = {tex:texture,displacementTexture:textures.displacementTexture};
        this.sphere.position.set(destinationPos.x,destinationPos.y+EXPERIENCE.HEIGHT_OF_CAMERA,destinationPos.z);
        
        
        // const material = new THREE.MeshBasicMaterial({
        //     map: texture,
        //     side: THREE.BackSide,
        //     transparent: true,
        //     opacity: initialOpacity,
            
            
        // });
    
       
     
        
        // sphere.visible = false
      
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
        console.log("Load texture called");
        return new Promise((resolve,rej) => {
            const loader = new THREE.TextureLoader()
            loader.load(url, (texture) => {
                texture.needsUpdate = true
                console.log("texture loaded",texture);
                
                resolve(texture)
            },()=>{
                rej("Error loading texture")
            })
        })
    }
}
