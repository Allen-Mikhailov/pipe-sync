const floating_parent: Element = document.body

const BORDER_WIDTH: number = 2
const HALF_BORDER: number = BORDER_WIDTH/2;

interface Vector2 {
    x: number,
    y: number
}

function flip_vector2(vec: Vector2)
{
    const temp: number = vec.x;
    vec.x = vec.y;
    vec.y = temp;
}

enum ChildType
{
    Child1,
    Child2,
    None
}

class SizableElement
{
    parent: BarsDockerContainer | null = null; // If no parent then is floating
    element: HTMLElement;

    child_type: ChildType = ChildType.None;

    pos: Vector2 = { x: 0, y: 0};
    size: Vector2 = { x: 100, y: 100 };

    constructor(element: HTMLElement)
    {
        this.element = element;
    }

    setPosition(pos: Vector2)
    {
        this.pos = pos;

        this.element.style.left = `${this.pos.x}px`;
        this.element.style.top = `${this.pos.y}px`;
    }

    setSize(size: Vector2)
    {
        this.size = size;

        this.element.style.width = `${this.size.x}px`;
        this.element.style.height = `${this.size.y}px`;
    }

    setParent(parent: BarsDockerContainer | null, child_type: ChildType)
    {
        this.child_type = child_type;

        if (this.element == null) {return;} // Should never occur

        if (this.parent == null && this.element.parentElement == floating_parent)
        {
            floating_parent.removeChild(this.element);
        }

        if (parent)
        {
            parent.element.appendChild(this.element);
        }

        this.parent = parent;
    }
    
    free()
    {

    }
}

enum ContainerType {
    Horizontal,
    Vertical,
    Undefined
}

class BarsDockerContainer extends SizableElement
{
    container_type: ContainerType = ContainerType.Undefined;

    child1:  SizableElement | null = null;
    child2:  SizableElement | null = null;

    spliter_element: HTMLElement;

    split_position: number = 0.5;

    constructor()
    {
        const element = document.createElement("div")
        element.classList.add("BarsDockerContainer")

        super(element);

        const spliter_element = document.createElement("div");
        spliter_element.classList.add("BarsDockerContainerSplitter")
        element.appendChild(spliter_element)
        this.spliter_element = spliter_element;
    }

    updateContainerType(container_type: ContainerType)
    {

        this.container_type = container_type;

        this.spliter_element.classList.remove("horizontal")
        this.spliter_element.classList.remove("vertical")

        if (container_type == ContainerType.Horizontal)
            this.spliter_element.classList.add("horizontal")
        else
        this.spliter_element.classList.add("vertical")

        this.updateChildrenStates()
    }

    updateChildrenStates()
    {
        if (!this.child1 || !this.child2) {return}

        const split_pos = Math.floor((this.getMajorAxis()-BORDER_WIDTH)*this.split_position);

        const child1_pos = {x: 0, y: 0}
        const child2_pos = {x: split_pos+BORDER_WIDTH, y: 0}

        const child1_size = {x: split_pos, y: this.getMinorAxis()}
        const child2_size = {x: this.getMajorAxis()-split_pos-BORDER_WIDTH, y: this.getMinorAxis()}

        if (this.container_type == ContainerType.Horizontal)
        {
            this.spliter_element.style.left = `${split_pos}px`
            this.spliter_element.style.top = "0px"
        } else if (this.container_type == ContainerType.Vertical) {

            flip_vector2(child1_pos);
            flip_vector2(child2_pos);
            flip_vector2(child1_size);
            flip_vector2(child2_size);

            this.spliter_element.style.top = `${split_pos}px`
            this.spliter_element.style.left = "0px"
        }

        this.child1.setSize(child1_size);
        this.child1.setPosition(child1_pos);

        this.child2.setSize(child2_size)
        this.child2.setPosition(child2_pos);
    }

    setChildren(child1:  SizableElement, child2:  SizableElement, container_type: ContainerType)
    {
        this.child1 = child1;
        child1.setParent(this, ChildType.Child1) ;
        

        this.child2 = child2;
        child2.setParent(this, ChildType.Child2) 

        this.updateContainerType(container_type); // Also updates child states
    }

    setSize(size: Vector2): void {
        super.setSize(size);
        this.updateChildrenStates()
    }

    getMajorAxis()
    {
        return this.container_type==ContainerType.Horizontal?this.size.x:this.size.y;
    }

    getMinorAxis()
    {
        return this.container_type==ContainerType.Horizontal?this.size.y:this.size.x;
    }
}

class BarsDockerWindow extends SizableElement
{

    constructor()
    {
        const element = document.createElement("div")
        element.classList.add("BarsDockerWindow")

        super(element);
        this.element.classList.add("BarsDockerContainer")
    }
}

/*

*/

class BarsDocker extends BarsDockerContainer
{
    root: HTMLElement;

    size_update()
    {
        this.setSize({x: this.root.clientWidth, y: this.root.clientHeight})
    }

    constructor(root: HTMLElement)
    {
        super();
        this.root = root;

        this.root.appendChild(this.element);

        root.onresize = () => this.size_update()
        this.size_update()
    }
}

export { BarsDocker, BarsDockerContainer, BarsDockerWindow, ChildType, Vector2, ContainerType }