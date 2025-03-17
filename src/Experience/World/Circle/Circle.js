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
        geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

        this.line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
        this.experience.scene.add(this.line);
    }
    updatePositionOfDebugNormalMesh(point, n){
        if(this.line){
            const positions = this.line.geometry.attributes.position;
            positions.setXYZ(0, point.x, point.y, point.z);
            positions.setXYZ(1, point.x + n.x * 10, point.y + n.y * 10, point.z + n.z * 10);
            positions.needsUpdate = true;
        }
    }
    setGeometry()
    {
        // Outer ring
        this.outerGeometry = new THREE.RingGeometry(0.08, 0.12, 64);

        // Inner ring (smaller)
        this.innerGeometry = new THREE.RingGeometry(0.05, 0.07, 64);
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
        this.outerMaterial = new THREE.MeshBasicMaterial({ color: "brown",transparent:true,opacity:0.8 });
        this.innerMaterial = new THREE.MeshBasicMaterial({ color: "brown", });
    }

    setMesh()
    {
        // Outer ring mesh
        this.outerMesh = new THREE.Mesh(this.outerGeometry, this.outerMaterial);
        // this.outerMesh.scale.set(2, 2, 2);
        this.outerMesh.rotation.x = -Math.PI / 2;

        // Inner ring mesh
        this.innerMesh = new THREE.Mesh(this.innerGeometry, this.innerMaterial);
        // this.innerMesh.scale.set(2, 2, 2);
        this.innerMesh.rotation.x = -Math.PI / 2;

        // Add both rings to the scene
        this.scene.add(this.outerMesh);
        this.scene.add(this.innerMesh);
    }
    updatePositionAndRotation(position, quaternion){
        this.outerMesh.position.copy(position).add(this.circlePosOffset)
        this.outerMesh.quaternion.copy(quaternion)

        this.innerMesh.position.copy(position).add(this.circlePosOffset)
        this.innerMesh.quaternion.copy(quaternion)
    }

    disableCircle(){
        this.outerMesh.visible = false;
        this.innerMesh.visible = false;
    }
    enableCircle(){
        this.outerMesh.visible = true;
        this.innerMesh.visible = true;
    }

    setHoverColor(){

    }
}
