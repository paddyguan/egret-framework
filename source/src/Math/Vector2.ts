module es {
    /** 2d 向量 */
    export class Vector2 {
        private static readonly unitYVector = new Vector2(0, 1);
        private static readonly unitXVector = new Vector2(1, 0);
        private static readonly unitVector2 = new Vector2(1, 1);
        private static readonly zeroVector2 = new Vector2(0, 0);
        public x: number = 0;
        public y: number = 0;

        /**
         * 从两个值构造一个带有X和Y的二维向量。
         * @param x 二维空间中的x坐标
         * @param y 二维空间的y坐标
         */
        constructor(x?: number, y?: number) {
            this.x = x ? x : 0;
            this.y = y != undefined ? y : this.x;
        }

        public static get zero() {
            return Vector2.zeroVector2;
        }

        public static get one() {
            return Vector2.unitVector2;
        }

        public static get unitX() {
            return Vector2.unitXVector;
        }

        public static get unitY() {
            return Vector2.unitYVector;
        }

        /**
         *
         * @param value1
         * @param value2
         */
        public static add(value1: Vector2, value2: Vector2) {
            let result: Vector2 = new Vector2(0, 0);
            result.x = value1.x + value2.x;
            result.y = value1.y + value2.y;
            return result;
        }

        /**
         *
         * @param value1
         * @param value2
         */
        public static divide(value1: Vector2, value2: Vector2) {
            let result: Vector2 = new Vector2(0, 0);
            result.x = value1.x / value2.x;
            result.y = value1.y / value2.y;
            return result;
        }

        /**
         *
         * @param value1
         * @param value2
         */
        public static multiply(value1: Vector2, value2: Vector2) {
            let result: Vector2 = new Vector2(0, 0);
            result.x = value1.x * value2.x;
            result.y = value1.y * value2.y;
            return result;
        }

        /**
         *
         * @param value1
         * @param value2
         */
        public static subtract(value1: Vector2, value2: Vector2) {
            let result: Vector2 = new Vector2(0, 0);
            result.x = value1.x - value2.x;
            result.y = value1.y - value2.y;
            return result;
        }

        /**
         * 创建一个新的Vector2
         * 它包含来自另一个向量的标准化值。
         * @param value
         */
        public static normalize(value: Vector2) {
            let nValue = new Vector2(value.x, value.y);
            let val = 1 / Math.sqrt((nValue.x * nValue.x) + (nValue.y * nValue.y));
            nValue.x *= val;
            nValue.y *= val;
            return nValue;
        }

        /**
         * 返回两个向量的点积
         * @param value1
         * @param value2
         */
        public static dot(value1: Vector2, value2: Vector2): number {
            return (value1.x * value2.x) + (value1.y * value2.y);
        }

        /**
         * 返回两个向量之间距离的平方
         * @param value1
         * @param value2
         */
        public static distanceSquared(value1: Vector2, value2: Vector2) {
            let v1 = value1.x - value2.x, v2 = value1.y - value2.y;
            return (v1 * v1) + (v2 * v2);
        }

        /**
         *
         * @param value1
         * @param min
         * @param max
         */
        public static clamp(value1: Vector2, min: Vector2, max: Vector2) {
            return new Vector2(MathHelper.clamp(value1.x, min.x, max.x),
                MathHelper.clamp(value1.y, min.y, max.y));
        }

        /**
         * 包含指定向量的线性插值
         * @param value1 第一个向量
         * @param value2 第二个向量
         * @param amount 权重值(0.0到1.0之间)
         */
        public static lerp(value1: Vector2, value2: Vector2, amount: number) {
            return new Vector2(MathHelper.lerp(value1.x, value2.x, amount), MathHelper.lerp(value1.y, value2.y, amount));
        }

        /**
         *
         * @param position
         * @param matrix
         */
        public static transform(position: Vector2, matrix: Matrix2D) {
            return new Vector2((position.x * matrix.m11) + (position.y * matrix.m21) + matrix.m31,
                (position.x * matrix.m12) + (position.y * matrix.m22) + matrix.m32);
        }

        /**
         * 返回两个向量之间的距离
         * @param value1
         * @param value2
         */
        public static distance(value1: Vector2, value2: Vector2) {
            let v1 = value1.x - value2.x, v2 = value1.y - value2.y;
            return Math.sqrt((v1 * v1) + (v2 * v2));
        }

        /**
         * 返回两个向量之间的角度，单位是度数
         * @param from
         * @param to
         */
        public static angle(from: Vector2, to: Vector2): number{
            from = Vector2.normalize(from);
            to = Vector2.normalize(to);
            return Math.acos(MathHelper.clamp(Vector2.dot(from, to), -1, 1)) * MathHelper.Rad2Deg;
        }

        /**
         * 矢量反演的结果
         * @param value
         */
        public static negate(value: Vector2) {
            let result: Vector2 = new Vector2();
            result.x = -value.x;
            result.y = -value.y;

            return result;
        }

        /**
         *
         * @param value
         */
        public add(value: Vector2): Vector2 {
            this.x += value.x;
            this.y += value.y;
            return this;
        }

        /**
         *
         * @param value
         */
        public divide(value: Vector2): Vector2 {
            this.x /= value.x;
            this.y /= value.y;
            return this;
        }

        /**
         *
         * @param value
         */
        public multiply(value: Vector2): Vector2 {
            this.x *= value.x;
            this.y *= value.y;
            return this;
        }

        /**
         *
         * @param value
         */
        public subtract(value: Vector2) {
            this.x -= value.x;
            this.y -= value.y;
            return this;
        }

        /** 变成一个方向相同的单位向量 */
        public normalize() {
            let val = 1 / Math.sqrt((this.x * this.x) + (this.y * this.y));
            this.x *= val;
            this.y *= val;
        }

        /** 返回它的长度 */
        public length() {
            return Math.sqrt((this.x * this.x) + (this.y * this.y));
        }

        /**
         * 返回其长度的平方
         */
        public lengthSquared(): number {
            return (this.x * this.x) + (this.y * this.y);
        }

        /** 对x和y值四舍五入 */
        public round(): Vector2 {
            return new Vector2(Math.round(this.x), Math.round(this.y));
        }

        public equals(other: Vector2) {
            return other.x == this.x && other.y == this.y;
        }
    }
}
