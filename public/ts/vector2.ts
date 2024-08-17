class Vector2 
{
    x: number;
    y: number;

    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }

    add(vector: Vector2): Vector2
    {
        return new Vector2(this.x+vector.x, this.y+vector.y)
    }

    addSelf(vector: Vector2): Vector2
    {
        this.x + vector.x;
        this.y + vector.y;
        return this;
    }

    sub(vector: Vector2): Vector2
    {
        return new Vector2(this.x-vector.x, this.y-vector.y)
    }

    subSelf(vector: Vector2): Vector2
    {
        this.x -= vector.x
        this.y -= vector.y
        return this
    }

    flip(): Vector2
    {
        return new Vector2(this.y, this.x);
    }

    flipSelf(): Vector2
    {
        const temp: number = this.x;
        this.x = this.y;
        this.y = temp;
        return this;
    }

    static zero(): Vector2
    {
        return new Vector2(0, 0);
    }

    clone()
    {
        return new Vector2(this.x, this.y);
    }
}

export default Vector2