import * as THREE from 'three'
import Experience from '../../Experience'
import { DoubleSide } from 'three'


export default class Circle
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.circlePosOffset = new THREE.Vector3(-0.01, 0.01, -0.01);
        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
        if(this.debug.active)
        this.setDebugNormalMesh()
    }
    setDebugNormalMesh(){
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );

        this.line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );
        this.experience.scene.add( this.line );
    }
    updatePositionOfDebugNormalMesh(point,n){
        if(this.line){
        const positions = this.line.geometry.attributes.position;
        positions.setXYZ(0, point.x, point.y, point.z);
        positions.setXYZ(1, point.x + n.x * 10, point.y + n.y * 10, point.z + n.z * 10);
        positions.needsUpdate = true;}
    }
    setGeometry()
    {
        this.geometry = new THREE.CircleGeometry(0.1, 32);
    }

    setTextures()
    {
        // this.textures = {}

        // this.textures.color = this.resources.items.grassColorTexture
        // this.textures.color.colorSpace = THREE.SRGBColorSpace
        // this.textures.color.repeat.set(1.5, 1.5)
        // this.textures.color.wrapS = THREE.RepeatWrapping
        // this.textures.color.wrapT = THREE.RepeatWrapping

        // this.textures.normal = this.resources.items.grassNormalTexture
        // this.textures.normal.repeat.set(1.5, 1.5)
        // this.textures.normal.wrapS = THREE.RepeatWrapping
        // this.textures.normal.wrapT = THREE.RepeatWrapping
    }

    setMaterial()
    {
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000,side:DoubleSide });
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
    
        this.mesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.mesh)
    }
    updatePositionAndRotation(position,quaternion){
       
        
        this.mesh.position.copy(position).add(this.circlePosOffset)
        this.mesh.quaternion.copy(quaternion)
    }

    disableCircle(){
        this.mesh.visible = false
    }
    enableCircle(){
        this.mesh.visible = true
    }

}