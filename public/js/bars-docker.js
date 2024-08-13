"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarsDockerWindow = exports.BarsDockerContainer = exports.BarsDocker = void 0;
var SizableElementPosition;
(function (SizableElementPosition) {
    SizableElementPosition[SizableElementPosition["Floating"] = 0] = "Floating";
    SizableElementPosition[SizableElementPosition["Parented"] = 1] = "Parented";
})(SizableElementPosition || (SizableElementPosition = {}));
class SizableElement {
    constructor(parent) {
        this.element = null;
        this.float_x = 0;
        this.float_y = 0;
        this.size_x = 100;
        this.size_y = 100;
        this.parent = parent;
    }
    onResize() {
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
        super(null);
        this.container_type = ContainerType.Undefined;
        this.child1 = null;
        this.child2 = null;
        this.split_position = 0.5;
        this.element = document.createElement("div");
        this.element.classList.add("BarsDockerContainer");
    }
    setChild1(child1) {
        this.child1 = child1;
    }
    setChild2(child2) {
        this.child2 = child2;
    }
}
exports.BarsDockerContainer = BarsDockerContainer;
class BarsDockerWindow extends SizableElement {
    constructor() {
        super(null);
        this.element = document.createElement("div");
        this.element.classList.add("BarsDockerContainer");
    }
}
exports.BarsDockerWindow = BarsDockerWindow;
/*

*/
class BarsDocker extends BarsDockerContainer {
    constructor(root) {
        super();
        this.root = root;
    }
}
exports.BarsDocker = BarsDocker;
