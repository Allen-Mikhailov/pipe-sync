import Vector2 from "./vector2.js";

const floating_parent: Element = document.body

const BORDER_WIDTH: number = 2;

const windows: { [key: string]: BarsDockerWindow } = {}

let is_dragging = false
let dragging_move_connection: (pos: Vector2) => void = (pos: Vector2) => {}
let dragging_end_connection: () => void = () => {}

document.body.onmousemove = function(e)
{
    if (is_dragging)
        dragging_move_connection(new Vector2(e.clientX, e.clientY));
}

document.body.onmouseup = function(e)
{
    if (is_dragging)
    {
        is_dragging = false
        dragging_end_connection()
    }
}

function createKey(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
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

    pos: Vector2 = new Vector2(0, 0);
    size: Vector2 = new Vector2(100, 100);

    id: string;

    constructor(element: HTMLElement)
    {
        this.element = element;
        this.id = createKey();
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
            this.element.classList.remove("floating")
        } else {
            floating_parent.appendChild(this.element)
            this.setPosition(this.pos)
            this.setSize(this.size)
            this.element.classList.add("floating")
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

    splitter_element: HTMLElement;
    splitter_handle: HTMLElement;

    split_position: number = 0.5;
    drag_start_split: number = 0;

    dragging: boolean = false;
    drag_start_x: number = 0;
    drag_start_y: number = 0;

    constructor()
    {
        const element = document.createElement("div")
        element.classList.add("BarsDockerContainer")

        super(element);

        const splitter_element = document.createElement("div");
        splitter_element.classList.add("bar")

        const splitter_handle = document.createElement("div")
        splitter_handle.classList.add("BarsDockerContainerSplitter")
        splitter_handle.draggable = true
        splitter_handle.appendChild(splitter_element)

        splitter_handle.ondragstart = (e) => {
            this.drag_start_x = e.clientX;
            this.drag_start_y = e.clientY;
            this.drag_start_split = this.split_position;
            this.splitter_handle.classList.add("dragging")
        }

        splitter_handle.ondragend = (e) => {
            this.splitter_handle.classList.remove("dragging")
        }

        splitter_handle.ondrag = (e) => {
            if (e.screenX === 0 || e.screenY === 0) {
                return;
            }

            const major_axis = this.getMajorAxis()
            const move_start = this.container_type==ContainerType.Horizontal?this.drag_start_x:this.drag_start_y;
            const move_current = this.container_type==ContainerType.Horizontal?e.clientX:e.clientY;

            const move_precent = (move_current-move_start)/major_axis;

            this.split_position = Math.min(Math.max(.1, this.drag_start_split+move_precent), .9)
            this.updateChildrenStates()
        }

        element.appendChild(splitter_handle)
        this.splitter_element = splitter_element;
        this.splitter_handle = splitter_handle;
    }

    updateContainerType(container_type: ContainerType)
    {

        this.container_type = container_type;

        this.splitter_handle.classList.remove("horizontal")
        this.splitter_handle.classList.remove("vertical")

        if (container_type == ContainerType.Horizontal)
            this.splitter_handle.classList.add("horizontal")
        else
            this.splitter_handle.classList.add("vertical")

        this.updateChildrenStates()
    }

    updateChildrenStates()
    {
        if (!this.child1 || !this.child2) {return}

        const split_pos = Math.floor((this.getMajorAxis()-BORDER_WIDTH)*this.split_position);

        const child1_pos: Vector2 = new Vector2(0, 0)
        const child2_pos: Vector2 = new Vector2(split_pos+BORDER_WIDTH, 0)

        const child1_size: Vector2 = new Vector2(split_pos, this.getMinorAxis())
        const child2_size: Vector2 = new Vector2(this.getMajorAxis()-split_pos-BORDER_WIDTH, this.getMinorAxis())

        if (this.container_type == ContainerType.Horizontal)
        {
            this.splitter_handle.style.left = `${split_pos}px`
            this.splitter_handle.style.top = "0px"
        } else if (this.container_type == ContainerType.Vertical) {
            child1_pos.flipSelf();
            child2_pos.flipSelf();
            child1_size.flipSelf();
            child2_size.flipSelf();

            this.splitter_handle.style.top = `${split_pos}px`
            this.splitter_handle.style.left = "0px"
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
    top_bar: HTMLElement;

    window_name: string = "ERROR: No Window Name";

    dragging: boolean = false;
    drag_start: Vector2 = Vector2.zero();
    drag_start_pos: Vector2 = Vector2.zero();

    constructor(window_name: string)
    {
        const element = document.createElement("div");
        element.classList.add("BarsDockerWindow");

        const top_bar = document.createElement("div");
        top_bar.classList.add("TopBar");
        element.appendChild(top_bar);

        top_bar.onmousedown = (e) => {
            this.dragging = true
            this.drag_start = new Vector2(e.clientX, e.clientY)
            this.drag_start_pos = this.pos.clone()

            dragging_move_connection = (pos: Vector2) => {
                // Is floating
                const dif: Vector2 = pos.sub(this.drag_start)
                if (this.parent == null)
                {
                    this.setPosition(this.drag_start_pos.add(dif))
                }
            }

            is_dragging = true
        }

        super(element);
        this.element.classList.add("BarsDockerContainer");
        this.top_bar = top_bar;
        this.setWindowName(window_name);

        windows[this.id] = this
    }

    setWindowName(window_name: string)
    {
        this.window_name = window_name;
        this.top_bar.innerText = window_name;
    }
}

class BarsDocker extends BarsDockerContainer
{
    root: HTMLElement;

    size_update()
    {
        this.setSize(new Vector2(this.root.clientWidth, this.root.clientHeight))
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