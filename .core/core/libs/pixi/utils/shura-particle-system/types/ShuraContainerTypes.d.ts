interface ShuraContainerSettings {
    lifetime?: number;
    autoDestroyAfterLifetime?: boolean;
}


interface ShuraSystemFrameState {
    spawnCount: 0,
}

export type NumberOrRange = number | [number, number];