import Vector2 from "./vector2.js";
const floating_parent = document.body;
const BORDER_WIDTH = 2;
const windows = {};
let is_dragging = false;
let dragging_move_connection = (pos) => { };
let dragging_end_connection = () => { };
document.body.onmousemove = function (e) {
    if (is_dragging)
        dragging_move_connection(new Vector2(e.clientX, e.clientY));
};
document.body.onmouseup = function (e) {
    if (is_dragging) {
        is_dragging = false;
        dragging_end_connection();
    }
};
function createKey() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
var ChildType;
(function (ChildType) {
    ChildType[ChildType["Child1"] = 0] = "Child1";
    ChildType[ChildType["Child2"] = 1] = "Child2";
    ChildType[ChildType["None"] = 2] = "None";
})(ChildType || (ChildType = {}));
class SizableElement {
    constructor(element) {
        this.parent = null; // If no parent then is floating
        this.child_type = ChildType.None;
        this.pos = new Vector2(0, 0);
        this.size = new Vector2(100, 100);
        this.element = element;
        this.id = createKey();
    }
    setPosition(pos) {
        this.pos = pos;
        this.element.style.left = `${this.pos.x}px`;
        this.element.style.top = `${this.pos.y}px`;
    }
    setSize(size) {
        this.size = size;
        this.element.style.width = `${this.size.x}px`;
        this.element.style.height = `${this.size.y}px`;
    }
    setParent(parent, child_type) {
        this.child_type = child_type;
        if (this.element == null) {
            return;
        } // Should never occur
        if (this.parent == null && this.element.parentElement == floating_parent) {
            floating_parent.removeChild(this.element);
        }
        if (parent) {
            parent.element.appendChild(this.element);
            this.element.classList.remove("floating");
        }
        else {
            floating_parent.appendChild(this.element);
            this.setPosition(this.pos);
            this.setSize(this.size);
            this.element.classList.add("floating");
        }
        this.parent = parent;
    }
    free() {
    }
}
var ContainerType;
(function (ContainerType) {
    ContainerType[ContainerType["Horizontal"] = 0] = "Horizontal";
    ContainerType[ContainerType["Vertical"] = 1] = "Vertical";
    ContainerType[ContainerType["Undefined"] = 2] = "Undefined";
})(ContainerType || (ContainerType = {}));
class BarsDockerContainer extends SizableElement {
    constructor() {
        const element = document.createElement("div");
        element.classList.add("BarsDockerContainer");
        super(element);
        this.container_type = ContainerType.Undefined;
        this.child1 = null;
        this.child2 = null;
        this.split_position = 0.5;
        this.drag_start_split = 0;
        this.dragging = false;
        this.drag_start_x = 0;
        this.drag_start_y = 0;
        const splitter_element = document.createElement("div");
        splitter_element.classList.add("bar");
        const splitter_handle = document.createElement("div");
        splitter_handle.classList.add("BarsDockerContainerSplitter");
        splitter_handle.draggable = true;
        splitter_handle.appendChild(splitter_element);
        splitter_handle.ondragstart = (e) => {
            this.drag_start_x = e.clientX;
            this.drag_start_y = e.clientY;
            this.drag_start_split = this.split_position;
            this.splitter_handle.classList.add("dragging");
        };
        splitter_handle.ondragend = (e) => {
            this.splitter_handle.classList.remove("dragging");
        };
        splitter_handle.ondrag = (e) => {
            if (e.screenX === 0 || e.screenY === 0) {
                return;
            }
            const major_axis = this.getMajorAxis();
            const move_start = this.container_type == ContainerType.Horizontal ? this.drag_start_x : this.drag_start_y;
            const move_current = this.container_type == ContainerType.Horizontal ? e.clientX : e.clientY;
            const move_precent = (move_current - move_start) / major_axis;
            this.split_position = Math.min(Math.max(.1, this.drag_start_split + move_precent), .9);
            this.updateChildrenStates();
        };
        element.appendChild(splitter_handle);
        this.splitter_element = splitter_element;
        this.splitter_handle = splitter_handle;
    }
    updateContainerType(container_type) {
        this.container_type = container_type;
        this.splitter_handle.classList.remove("horizontal");
        this.splitter_handle.classList.remove("vertical");
        if (container_type == ContainerType.Horizontal)
            this.splitter_handle.classList.add("horizontal");
        else
            this.splitter_handle.classList.add("vertical");
        this.updateChildrenStates();
    }
    updateChildrenStates() {
        if (!this.child1 || !this.child2) {
            return;
        }
        const split_pos = Math.floor((this.getMajorAxis() - BORDER_WIDTH) * this.split_position);
        const child1_pos = new Vector2(0, 0);
        const child2_pos = new Vector2(split_pos + BORDER_WIDTH, 0);
        const child1_size = new Vector2(split_pos, this.getMinorAxis());
        const child2_size = new Vector2(this.getMajorAxis() - split_pos - BORDER_WIDTH, this.getMinorAxis());
        if (this.container_type == ContainerType.Horizontal) {
            this.splitter_handle.style.left = `${split_pos}px`;
            this.splitter_handle.style.top = "0px";
        }
        else if (this.container_type == ContainerType.Vertical) {
            child1_pos.flipSelf();
            child2_pos.flipSelf();
            child1_size.flipSelf();
            child2_size.flipSelf();
            this.splitter_handle.style.top = `${split_pos}px`;
            this.splitter_handle.style.left = "0px";
        }
        this.child1.setSize(child1_size);
        this.child1.setPosition(child1_pos);
        this.child2.setSize(child2_size);
        this.child2.setPosition(child2_pos);
    }
    setChildren(child1, child2, container_type) {
        this.child1 = child1;
        child1.setParent(this, ChildType.Child1);
        this.child2 = child2;
        child2.setParent(this, ChildType.Child2);
        this.updateContainerType(container_type); // Also updates child states
    }
    setSize(size) {
        super.setSize(size);
        this.updateChildrenStates();
    }
    getMajorAxis() {
        return this.container_type == ContainerType.Horizontal ? this.size.x : this.size.y;
    }
    getMinorAxis() {
        return this.container_type == ContainerType.Horizontal ? this.size.y : this.size.x;
    }
}
class BarsDockerWindow extends SizableElement {
    constructor(window_name) {
        const element = document.createElement("div");
        element.classList.add("BarsDockerWindow");
        const top_bar = document.createElement("div");
        top_bar.classList.add("TopBar");
        element.appendChild(top_bar);
        top_bar.onmousedown = (e) => {
            this.dragging = true;
            this.drag_start = new Vector2(e.clientX, e.clientY);
            this.drag_start_pos = this.pos.clone();
            dragging_move_connection = (pos) => {
                // Is floating
                const dif = pos.sub(this.drag_start);
                if (this.parent == null) {
                    this.setPosition(this.drag_start_pos.add(dif));
                }
            };
            is_dragging = true;
        };
        super(element);
        this.window_name = "ERROR: No Window Name";
        this.dragging = false;
        this.drag_start = Vector2.zero();
        this.drag_start_pos = Vector2.zero();
        this.element.classList.add("BarsDockerContainer");
        this.top_bar = top_bar;
        this.setWindowName(window_name);
        windows[this.id] = this;
    }
    setWindowName(window_name) {
        this.window_name = window_name;
        this.top_bar.innerText = window_name;
    }
}
class BarsDocker extends BarsDockerContainer {
    size_update() {
        this.setSize(new Vector2(this.root.clientWidth, this.root.clientHeight));
    }
    constructor(root) {
        super();
        this.root = root;
        this.root.appendChild(this.element);
        root.onresize = () => this.size_update();
        this.size_update();
    }
}
export { BarsDocker, BarsDockerContainer, BarsDockerWindow, ChildType, Vector2, ContainerType };
