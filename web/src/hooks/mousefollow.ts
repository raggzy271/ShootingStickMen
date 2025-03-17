import { RefObject, useEffect } from 'react';
import { Camera, Mesh, Raycaster, Vector2, Vector3 } from 'three';

export const useMouseFollow = (meshRef: RefObject<Mesh>, camera: Camera) => {
    useEffect(() => {
        const raycaster = new Raycaster();
        const mouse = new Vector2();
        const targetPosition = new Vector3();
        const fixedPosition = new Vector3(0, 1, 5); // Fixed position for the gun
        const upVector = new Vector3(0, 1, 0);

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

            // Keep the cylinder at fixed position
            meshRef.current.position.copy(fixedPosition);

            // Calculate direction to target
            const direction = new Vector3().subVectors(targetPosition, fixedPosition);
            direction.y = 0; // Keep rotation horizontal only
            direction.normalize();

            // Calculate the angle between the current forward direction and target direction
            const forward = new Vector3(1, 0, 0);
            const angle = Math.atan2(direction.z, direction.x);

            // Apply rotation around the Y axis (vertical axis)
            meshRef.current.rotation.y = angle;
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, [meshRef, camera]);
}; 