import Vector2 from "./vector2.js";

const floating_parent: Element = document.body

const BORDER_WIDTH: number = 2;

const windows: { [key: string]: BarsDockerWindow } = {}

const MIN_WINDOW_WIDTH = 100
const MIN_WINDOW_HEIGHT = 120

enum DragType {
    None,
    TopBar,
    LeftEdge,
    RightEdge,
    TopEdge,
    BottomEdge,
    TopLeftEdge,
    TopRightEdge,
    BottomLeftEdge,
    BottomRightEdge,
    HorizontalSplitter,
    VerticalSplitter
}

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
    size: Vector2 = new Vector2(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT);

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

            const is_horizontal: boolean = this.container_type==ContainerType.Horizontal

            const major_axis = this.getMajorAxis()
            const move_start = is_horizontal?this.drag_start_x:this.drag_start_y;
            const move_current = is_horizontal?e.clientX:e.clientY;

            const move_precent = (move_current-move_start)/major_axis;

            const major_axis_min = is_horizontal?MIN_WINDOW_WIDTH/this.size.x:MIN_WINDOW_HEIGHT/this.size.y

            this.split_position = Math.min(Math.max(major_axis_min, this.drag_start_split+move_precent), 1-major_axis_min)
            this.updateChildrenStates()
        }

        element.appendChild(splitter_handle)
        this.splitter_element = splitter_element;
        this.splitter_handle = splitter_handle;
    }

    get_all_windows(): BarsDockerWindow[]
    {
        const windows: BarsDockerWindow[] = []

        if (this.child1 instanceof BarsDockerWindow)
            windows.push(this.child1)
        else if (this.child1 instanceof BarsDockerContainer)
            windows.push(...this.child1.get_all_windows())

        if (this.child2 instanceof BarsDockerWindow)
            windows.push(this.child2)
        else if (this.child2 instanceof BarsDockerContainer)
            windows.push(...this.child2.get_all_windows())
        
        return windows
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

function is_hovering(element: HTMLElement, x: number, y: number): boolean
{
    return true;
}

class DockingPoint
{
    center_dock: HTMLElement;
    left_dock: HTMLElement;
    right_dock: HTMLElement;
    top_dock: HTMLElement;
    bottom_dock: HTMLElement;

    container: HTMLElement;

    parent: SizableElement;

    constructor(parent: SizableElement)
    {
        this.parent = parent

        const container = document.createElement("div")
        container.classList.add("docking-stations-container")
        this.container = container

        const left_dock = document.createElement("div")
        left_dock.classList.add("left")
        container.appendChild(left_dock)
        this.left_dock = left_dock

        const right_dock = document.createElement("div")
        right_dock.classList.add("right")
        container.appendChild(right_dock)
        this.right_dock = right_dock

        const top_dock = document.createElement("div")
        top_dock.classList.add("top")
        container.appendChild(top_dock)
        this.top_dock = top_dock

        const bottom_dock = document.createElement("div")
        bottom_dock.classList.add("bottom")
        container.appendChild(bottom_dock)
        this.bottom_dock = bottom_dock

        const center_dock = document.createElement("div")
        center_dock.classList.add("center")
        container.appendChild(center_dock)
        this.center_dock = center_dock

        parent.element.appendChild(container)

        this.toggle_display(false)
    }

    get_hovered_dock(clientX: number, clientY: number): string|null
    {
        if (is_hovering(this.center_dock, clientX, clientY))
            return "center"

        return null
    }

    toggle_display(value: boolean) {
        this.container.style.visibility = value?"visible":"hidden"
    }
}

class BarsDockerWindow extends SizableElement
{
    top_bar: HTMLElement;

    window_name: string = "ERROR: No Window Name";

    drag_type: DragType = DragType.None;
    drag_start: Vector2 = Vector2.zero();
    drag_start_pos: Vector2 = Vector2.zero();

    docking_point: DockingPoint;

    constructor(window_name: string)
    {
        const element = document.createElement("div");
        element.classList.add("BarsDockerWindow");

        const top_bar = document.createElement("div");
        top_bar.classList.add("TopBar");
        element.appendChild(top_bar);

        top_bar.onmousedown = (e) => {
            this.drag_type = DragType.TopBar
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

            dragging_end_connection = () => {
                this.drag_type = DragType.None
                
            }

            is_dragging = true
        }

        super(element);
        this.element.classList.add("BarsDockerContainer");
        this.top_bar = top_bar;
        this.setWindowName(window_name);

        this.docking_point = new DockingPoint(this)

        windows[this.id] = this
    }

    toggle_docking_display(value: boolean) {
        this.docking_point.toggle_display(value);
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
    hovered_window: BarsDockerWindow|null

    size_update()
    {
        this.setSize(new Vector2(this.root.clientWidth, this.root.clientHeight))
    }

    constructor(root: HTMLElement)
    {
        super();
        this.root = root;
        this.hovered_window = null

        this.root.appendChild(this.element);

        this.size_update()

        const self: BarsDocker = this
        function update()
        {
            // Checking for size updates
            if (self.root.clientWidth != self.size.x || self.root.clientHeight != self.size.y)
                self.size_update()


            requestAnimationFrame(update)
        }

        this.element.onmousemove = (e: MouseEvent) => {
            const x: number = e.clientX
            const y: number = e.clientY

            let hovered_window = null
            const window_names = Object.keys(windows)
            for (let i = 0; i < window_names.length; i++)
            {
                const window = windows[window_names[i]]
                if (
                    (x-window.pos.x) <= window.size.x && (x-window.pos.x) >= 0 &&
                    (y-window.pos.y) <= window.size.y && (y-window.pos.y) >= 0
                )
                {
                    hovered_window = window
                    break;
                }
            }

            this.hovered_window = hovered_window
        }

        update()
    }
}

export { BarsDocker, BarsDockerContainer, BarsDockerWindow, ChildType, Vector2, ContainerType }