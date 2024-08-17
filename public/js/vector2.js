class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }
    addSelf(vector) {
        this.x + vector.x;
        this.y + vector.y;
        return this;
    }
    sub(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }
    subSelf(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    flip() {
        return new Vector2(this.y, this.x);
    }
    flipSelf() {
        const temp = this.x;
        this.x = this.y;
        this.y = temp;
        return this;
    }
    static zero() {
        return new Vector2(0, 0);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
}
export default Vector2;
