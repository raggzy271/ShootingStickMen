import { RefObject, useEffect } from 'react';
import { Camera, Mesh, Raycaster, Vector2, Vector3 } from 'three';

export const useMouseFollow = (meshRef: RefObject<Mesh>, camera: Camera) => {
    useEffect(() => {
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        const targetPosition = new Vector3();
        const plane = new Vector3(0, 0, 1);

        const onMouseMove = (event: MouseEvent) => {
            if (!meshRef.current) return;

            // Calculate mouse position in normalized device coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // Calculate the point where the ray intersects with the horizontal plane
            const distance = -raycaster.ray.origin.y / raycaster.ray.direction.y;
            targetPosition.copy(raycaster.ray.origin).add(raycaster.ray.direction.multiplyScalar(distance));

            // Update cylinder position
            meshRef.current.position.x = targetPosition.x;
            meshRef.current.position.z = targetPosition.z;

            // Calculate rotation to face the camera
            const direction = new Vector3().subVectors(camera.position, meshRef.current.position);
            direction.y = 0; // Keep cylinder vertical
            meshRef.current.lookAt(direction.add(meshRef.current.position));
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, [meshRef, camera]);
}; 