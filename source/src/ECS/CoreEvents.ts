module es {
    export enum CoreEvents {
        /**
         * 在图形设备重置时触发。当这种情况发生时，任何渲染目标或其他内容的VRAM将被擦除，需要重新生成
         */
        GraphicsDeviceReset,
        /**
         * 当场景发生变化时触发
         */
        SceneChanged,
        /**
         * 当设备方向改变时触发
         */
        OrientationChanged,
    }
}
