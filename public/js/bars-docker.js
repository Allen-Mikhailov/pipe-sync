const floating_parent = document.body;
const BORDER_WIDTH = 2;
const HALF_BORDER = BORDER_WIDTH / 2;
function flip_vector2(vec) {
    const temp = vec.x;
    vec.x = vec.y;
    vec.y = temp;
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
        this.pos = { x: 0, y: 0 };
        this.size = { x: 100, y: 100 };
        this.element = element;
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
        const spliter_element = document.createElement("div");
        spliter_element.classList.add("BarsDockerContainerSplitter");
        element.appendChild(spliter_element);
        this.spliter_element = spliter_element;
    }
    updateContainerType(container_type) {
        this.container_type = container_type;
        this.spliter_element.classList.remove("horizontal");
        this.spliter_element.classList.remove("vertical");
        if (container_type == ContainerType.Horizontal)
            this.spliter_element.classList.add("horizontal");
        else
            this.spliter_element.classList.add("vertical");
        this.updateChildrenStates();
    }
    updateChildrenStates() {
        if (!this.child1 || !this.child2) {
            return;
        }
        const split_pos = Math.floor((this.getMajorAxis() - BORDER_WIDTH) * this.split_position);
        const child1_pos = { x: 0, y: 0 };
        const child2_pos = { x: split_pos + BORDER_WIDTH, y: 0 };
        const child1_size = { x: split_pos, y: this.getMinorAxis() };
        const child2_size = { x: this.getMajorAxis() - split_pos - BORDER_WIDTH, y: this.getMinorAxis() };
        if (this.container_type == ContainerType.Horizontal) {
            this.spliter_element.style.left = `${split_pos}px`;
            this.spliter_element.style.top = "0px";
        }
        else if (this.container_type == ContainerType.Vertical) {
            flip_vector2(child1_pos);
            flip_vector2(child2_pos);
            flip_vector2(child1_size);
            flip_vector2(child2_size);
            this.spliter_element.style.top = `${split_pos}px`;
            this.spliter_element.style.left = "0px";
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
    constructor() {
        const element = document.createElement("div");
        element.classList.add("BarsDockerWindow");
        super(element);
        this.element.classList.add("BarsDockerContainer");
    }
}
/*

*/
class BarsDocker extends BarsDockerContainer {
    size_update() {
        this.setSize({ x: this.root.clientWidth, y: this.root.clientHeight });
    }
    constructor(root) {
        super();
        this.root = root;
        this.root.appendChild(this.element);
        root.onresize = () => this.size_update();
        this.size_update();
    }
}
export { BarsDocker, BarsDockerContainer, BarsDockerWindow, ChildType, ContainerType };
